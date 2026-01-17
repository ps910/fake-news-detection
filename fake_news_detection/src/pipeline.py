"""
Main Pipeline for Fake News Detection with Explainable NLP
Provides end-to-end training, evaluation, and prediction
"""

import os
import sys
import argparse
import json
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime

# Add project root and src to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from preprocessing import TextPreprocessor, DataLoader, create_sample_dataset
from feature_engineering import TfidfFeatureExtractor, FeatureEngineer
from models import ModelTrainer, ModelComparison, print_evaluation_report
from explainability import LimeExplainer, TextExplainerPipeline
from config import (
    DATA_DIR, MODELS_DIR, RESULTS_DIR,
    TFIDF_CONFIG, TRAIN_CONFIG, MODEL_CONFIG, CLASS_NAMES
)

from sklearn.model_selection import train_test_split


class FakeNewsDetector:
    """
    Complete pipeline for fake news detection with explainability.
    """
    
    def __init__(self,
                 model_type: str = 'logistic_regression',
                 use_bert: bool = False,
                 verbose: bool = True):
        """
        Initialize the fake news detector.
        
        Args:
            model_type: Type of ML model to use
            use_bert: Whether to use BERT embeddings
            verbose: Whether to print progress
        """
        self.model_type = model_type
        self.use_bert = use_bert
        self.verbose = verbose
        
        # Initialize components
        self.preprocessor = TextPreprocessor()
        self.feature_extractor = TfidfFeatureExtractor(**TFIDF_CONFIG)
        self.model = None
        self.explainer_pipeline = None
        
        # Metadata
        self.label_mapping = None
        self.is_trained = False
        self.training_history = {}
    
    def log(self, message: str):
        """Print message if verbose mode is on."""
        if self.verbose:
            print(message)
    
    def load_data(self,
                  filepath: str,
                  text_column: str = 'text',
                  label_column: str = 'label') -> Tuple[List[str], np.ndarray]:
        """
        Load and preprocess data from file.
        
        Args:
            filepath: Path to data file
            text_column: Name of text column
            label_column: Name of label column
            
        Returns:
            Tuple of (preprocessed_texts, labels)
        """
        self.log(f"Loading data from {filepath}...")
        
        loader = DataLoader(self.preprocessor)
        texts, labels, self.label_mapping = loader.prepare_dataset(
            filepath, text_column, label_column
        )
        
        self.log(f"Loaded {len(texts)} samples")
        self.log(f"Label mapping: {self.label_mapping}")
        
        return texts, labels
    
    def train(self,
              X_train: List[str],
              y_train: np.ndarray,
              X_val: Optional[List[str]] = None,
              y_val: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """
        Train the fake news detection model.
        
        Args:
            X_train: Training texts
            y_train: Training labels
            X_val: Optional validation texts
            y_val: Optional validation labels
            
        Returns:
            Training results
        """
        self.log("Starting training pipeline...")
        
        # Feature extraction
        self.log("Extracting features...")
        X_train_features = self.feature_extractor.fit_transform(X_train)
        
        if X_val is not None:
            X_val_features = self.feature_extractor.transform(X_val)
        
        # Train model
        self.log(f"Training {self.model_type} model...")
        model_params = MODEL_CONFIG.get(self.model_type, {})
        self.model = ModelTrainer(self.model_type, **model_params)
        
        feature_names = self.feature_extractor.get_feature_names()
        self.model.train(X_train_features, y_train, feature_names=feature_names)
        
        # Evaluate on validation set
        results = {'model_type': self.model_type}
        
        if X_val is not None and y_val is not None:
            self.log("Evaluating on validation set...")
            val_metrics = self.model.evaluate(X_val_features, y_val, CLASS_NAMES)
            results['validation_metrics'] = val_metrics
            
            self.log(f"Validation Accuracy: {val_metrics['accuracy']:.4f}")
            self.log(f"Validation F1-score: {val_metrics['f1_score']:.4f}")
        
        # Initialize explainer
        self.explainer_pipeline = TextExplainerPipeline(
            model=self.model.model,
            vectorizer=self.feature_extractor.vectorizer,
            preprocessor=self.preprocessor,
            class_names=CLASS_NAMES
        )
        
        self.is_trained = True
        self.training_history = results
        
        self.log("Training complete!")
        return results
    
    def train_from_file(self,
                        filepath: str,
                        text_column: str = 'text',
                        label_column: str = 'label',
                        test_size: float = 0.2) -> Dict[str, Any]:
        """
        Train from a data file with automatic train/test split.
        
        Args:
            filepath: Path to data file
            text_column: Name of text column
            label_column: Name of label column
            test_size: Fraction of data for testing
            
        Returns:
            Training and evaluation results
        """
        # Load data
        texts, labels = self.load_data(filepath, text_column, label_column)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels,
            test_size=test_size,
            random_state=TRAIN_CONFIG['random_state'],
            stratify=labels
        )
        
        self.log(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
        
        # Train
        results = self.train(X_train, y_train, X_test, y_test)
        
        # Store test data for later evaluation
        self._X_test = X_test
        self._y_test = y_test
        
        return results
    
    def predict(self, texts: List[str]) -> np.ndarray:
        """
        Make predictions on new texts.
        
        Args:
            texts: List of texts to classify
            
        Returns:
            Predicted labels
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Preprocess
        processed_texts = self.preprocessor.preprocess_batch(texts, verbose=False)
        
        # Extract features
        features = self.feature_extractor.transform(processed_texts)
        
        # Predict
        return self.model.predict(features)
    
    def predict_proba(self, texts: List[str]) -> np.ndarray:
        """
        Get prediction probabilities.
        
        Args:
            texts: List of texts
            
        Returns:
            Prediction probabilities
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Preprocess
        processed_texts = self.preprocessor.preprocess_batch(texts, verbose=False)
        
        # Extract features
        features = self.feature_extractor.transform(processed_texts)
        
        # Predict probabilities
        return self.model.predict_proba(features)
    
    def classify(self, text: str) -> Dict[str, Any]:
        """
        Classify a single text with confidence scores.
        
        Args:
            text: Text to classify
            
        Returns:
            Classification result with probabilities
        """
        predictions = self.predict([text])
        probabilities = self.predict_proba([text])[0]
        
        result = {
            'text': text[:200] + '...' if len(text) > 200 else text,
            'prediction': CLASS_NAMES[predictions[0]],
            'confidence': float(max(probabilities)),
            'probabilities': {
                name: float(prob)
                for name, prob in zip(CLASS_NAMES, probabilities)
            }
        }
        
        return result
    
    def explain(self, text: str, num_features: int = 10) -> Dict[str, Any]:
        """
        Classify and explain a prediction.
        
        Args:
            text: Text to classify and explain
            num_features: Number of features for explanation
            
        Returns:
            Classification with explanation
        """
        if self.explainer_pipeline is None:
            raise ValueError("Explainer not initialized. Train model first.")
        
        return self.explainer_pipeline.predict_and_explain(text, num_features)
    
    def compare_models(self,
                       texts: List[str],
                       labels: np.ndarray,
                       models: List[str] = None) -> Dict[str, Dict]:
        """
        Compare multiple models on the same data.
        
        Args:
            texts: Training texts
            labels: Training labels
            models: List of model types to compare
            
        Returns:
            Comparison results
        """
        self.log("Comparing models...")
        
        # Extract features
        features = self.feature_extractor.fit_transform(texts)
        
        # Compare
        comparison = ModelComparison(models=models)
        results = comparison.compare(features, labels, CLASS_NAMES)
        
        # Print summary
        print(comparison.summary())
        
        return results
    
    def save(self, directory: str = None):
        """
        Save the trained model and components.
        
        Args:
            directory: Directory to save to
        """
        if not self.is_trained:
            raise ValueError("No trained model to save.")
        
        directory = directory or MODELS_DIR
        os.makedirs(directory, exist_ok=True)
        
        # Save model
        model_path = os.path.join(directory, 'model.pkl')
        self.model.save(model_path)
        
        # Save vectorizer
        vectorizer_path = os.path.join(directory, 'vectorizer.pkl')
        self.feature_extractor.save(vectorizer_path)
        
        # Save metadata - convert numpy types to Python types
        label_mapping_clean = {str(k): int(v) for k, v in self.label_mapping.items()} if self.label_mapping else None
        
        metadata = {
            'model_type': self.model_type,
            'label_mapping': label_mapping_clean,
            'class_names': CLASS_NAMES,
            'training_history': self.training_history,
            'saved_at': datetime.now().isoformat()
        }
        
        metadata_path = os.path.join(directory, 'metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2, default=str)
        
        self.log(f"Model saved to {directory}")
    
    def load(self, directory: str = None):
        """
        Load a trained model and components.
        
        Args:
            directory: Directory to load from
        """
        directory = directory or MODELS_DIR
        
        # Load model
        model_path = os.path.join(directory, 'model.pkl')
        self.model = ModelTrainer.load(model_path)
        
        # Load vectorizer
        vectorizer_path = os.path.join(directory, 'vectorizer.pkl')
        self.feature_extractor.load(vectorizer_path)
        
        # Load metadata
        metadata_path = os.path.join(directory, 'metadata.json')
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        self.model_type = metadata['model_type']
        self.label_mapping = metadata['label_mapping']
        self.training_history = metadata.get('training_history', {})
        
        # Initialize explainer
        self.explainer_pipeline = TextExplainerPipeline(
            model=self.model.model,
            vectorizer=self.feature_extractor.vectorizer,
            preprocessor=self.preprocessor,
            class_names=CLASS_NAMES
        )
        
        self.is_trained = True
        self.log(f"Model loaded from {directory}")


def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(
        description='Fake News Detection with Explainable NLP'
    )
    
    parser.add_argument(
        '--mode',
        choices=['train', 'predict', 'explain', 'compare', 'demo'],
        default='demo',
        help='Operation mode'
    )
    
    parser.add_argument(
        '--data',
        type=str,
        help='Path to data file'
    )
    
    parser.add_argument(
        '--model',
        type=str,
        default='logistic_regression',
        choices=['logistic_regression', 'random_forest', 'svm', 'naive_bayes'],
        help='Model type to use'
    )
    
    parser.add_argument(
        '--text',
        type=str,
        help='Text to classify (for predict/explain modes)'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        default='results',
        help='Output directory'
    )
    
    args = parser.parse_args()
    
    # Initialize detector
    detector = FakeNewsDetector(model_type=args.model)
    
    if args.mode == 'demo':
        # Run demo with sample data
        print("\n" + "="*60)
        print("FAKE NEWS DETECTION - DEMO MODE")
        print("="*60 + "\n")
        
        # Create sample data
        sample_data_path = os.path.join(DATA_DIR, 'sample_news.csv')
        os.makedirs(DATA_DIR, exist_ok=True)
        create_sample_dataset(sample_data_path, num_samples=500)
        
        # Train model
        results = detector.train_from_file(sample_data_path)
        
        # Print results
        if 'validation_metrics' in results:
            print_evaluation_report(
                results['validation_metrics'],
                f"{args.model} Model"
            )
        
        # Demo classification
        demo_texts = [
            "BREAKING: Scientists discover shocking new evidence about climate change!",
            "New study shows that regular exercise may improve mental health outcomes.",
            "You won't BELIEVE what this celebrity just revealed about the government!",
            "Researchers report findings from a 10-year longitudinal study on education."
        ]
        
        print("\n" + "="*60)
        print("DEMO PREDICTIONS")
        print("="*60)
        
        for text in demo_texts:
            result = detector.classify(text)
            print(f"\nText: {result['text']}")
            print(f"Prediction: {result['prediction']}")
            print(f"Confidence: {result['confidence']:.2%}")
        
        # Demo explanation
        print("\n" + "="*60)
        print("DEMO EXPLANATION (LIME)")
        print("="*60)
        
        explanation = detector.explain(demo_texts[0])
        print(f"\nText: {explanation['text'][:100]}...")
        print(f"Predicted: {explanation['predicted_class']} ({explanation['confidence']:.2%})")
        print("\nInfluential words:")
        for word, score in explanation['word_importance'][:5]:
            direction = "→ Real" if score > 0 else "→ Fake"
            print(f"  '{word}': {score:+.4f} {direction}")
        
        # Save model
        detector.save()
        print(f"\nModel saved to {MODELS_DIR}")
    
    elif args.mode == 'train':
        if not args.data:
            print("Error: --data required for training mode")
            return
        
        results = detector.train_from_file(args.data)
        detector.save(args.output)
        
        if 'validation_metrics' in results:
            print_evaluation_report(results['validation_metrics'], args.model)
    
    elif args.mode == 'predict':
        if not args.text:
            print("Error: --text required for predict mode")
            return
        
        detector.load()
        result = detector.classify(args.text)
        print(json.dumps(result, indent=2))
    
    elif args.mode == 'explain':
        if not args.text:
            print("Error: --text required for explain mode")
            return
        
        detector.load()
        result = detector.explain(args.text)
        
        print(f"Prediction: {result['predicted_class']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print("\nWord importance:")
        for word, score in result['word_importance']:
            print(f"  {word}: {score:+.4f}")
    
    elif args.mode == 'compare':
        if not args.data:
            print("Error: --data required for compare mode")
            return
        
        texts, labels = detector.load_data(args.data)
        results = detector.compare_models(texts, labels)


if __name__ == "__main__":
    main()

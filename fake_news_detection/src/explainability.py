"""
Explainability Module for Fake News Detection
Implements LIME and SHAP for model interpretability
"""

import numpy as np
import matplotlib.pyplot as plt
from typing import List, Tuple, Optional, Dict, Any, Callable
import os


class LimeExplainer:
    """
    LIME (Local Interpretable Model-Agnostic Explanations) for text classification.
    
    Explains individual predictions by highlighting influential words.
    """
    
    def __init__(self,
                 class_names: List[str] = None,
                 num_features: int = 10,
                 num_samples: int = 5000):
        """
        Initialize LIME explainer.
        
        Args:
            class_names: Names of classification classes
            num_features: Number of features to show in explanation
            num_samples: Number of samples for perturbation
        """
        self.class_names = class_names or ['Fake', 'Real']
        self.num_features = num_features
        self.num_samples = num_samples
        self.explainer = None
        
        self._initialize()
    
    def _initialize(self):
        """Initialize LIME text explainer."""
        try:
            from lime.lime_text import LimeTextExplainer
            
            self.explainer = LimeTextExplainer(
                class_names=self.class_names,
                random_state=42
            )
            print("LIME explainer initialized successfully")
            
        except ImportError:
            print("Warning: lime not installed. Install with: pip install lime")
            self.explainer = None
    
    def explain_instance(self,
                         text: str,
                         predict_fn: Callable,
                         num_features: int = None) -> 'LimeExplanation':
        """
        Explain a single prediction.
        
        Args:
            text: Text to explain
            predict_fn: Prediction function that returns probabilities
            num_features: Number of features to show
            
        Returns:
            LIME explanation object
        """
        if self.explainer is None:
            raise RuntimeError("LIME not initialized. Install lime package.")
        
        num_features = num_features or self.num_features
        
        explanation = self.explainer.explain_instance(
            text,
            predict_fn,
            num_features=num_features,
            num_samples=self.num_samples
        )
        
        return LimeExplanation(explanation, text, self.class_names)
    
    def explain_batch(self,
                      texts: List[str],
                      predict_fn: Callable,
                      num_features: int = None) -> List['LimeExplanation']:
        """
        Explain multiple predictions.
        
        Args:
            texts: List of texts to explain
            predict_fn: Prediction function
            num_features: Number of features to show
            
        Returns:
            List of LIME explanation objects
        """
        explanations = []
        
        for i, text in enumerate(texts):
            print(f"Explaining instance {i+1}/{len(texts)}...")
            exp = self.explain_instance(text, predict_fn, num_features)
            explanations.append(exp)
        
        return explanations


class LimeExplanation:
    """Wrapper for LIME explanation with visualization methods."""
    
    def __init__(self, explanation, text: str, class_names: List[str]):
        """
        Initialize explanation wrapper.
        
        Args:
            explanation: LIME explanation object
            text: Original text
            class_names: Class names
        """
        self.explanation = explanation
        self.text = text
        self.class_names = class_names
    
    def get_word_importance(self, label: int = 1) -> List[Tuple[str, float]]:
        """
        Get word importance scores.
        
        Args:
            label: Class label to explain
            
        Returns:
            List of (word, importance) tuples
        """
        return self.explanation.as_list(label=label)
    
    def get_prediction_proba(self) -> Dict[str, float]:
        """Get predicted probabilities."""
        probs = self.explanation.predict_proba
        return {name: prob for name, prob in zip(self.class_names, probs)}
    
    def get_predicted_class(self) -> str:
        """Get predicted class name."""
        probs = self.explanation.predict_proba
        return self.class_names[np.argmax(probs)]
    
    def show_in_notebook(self):
        """Display explanation in Jupyter notebook."""
        return self.explanation.show_in_notebook(text=True)
    
    def as_html(self) -> str:
        """Get explanation as HTML."""
        return self.explanation.as_html()
    
    def save_html(self, filepath: str):
        """Save explanation as HTML file."""
        html_content = self.as_html()
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"Explanation saved to {filepath}")
    
    def plot_importance(self, 
                        label: int = 1,
                        figsize: Tuple[int, int] = (10, 6),
                        save_path: str = None):
        """
        Plot word importance as bar chart.
        
        Args:
            label: Class label to explain
            figsize: Figure size
            save_path: Optional path to save figure
        """
        word_importance = self.get_word_importance(label)
        
        words = [w for w, _ in word_importance]
        scores = [s for _, s in word_importance]
        
        # Color based on positive/negative contribution
        colors = ['green' if s > 0 else 'red' for s in scores]
        
        fig, ax = plt.subplots(figsize=figsize)
        y_pos = np.arange(len(words))
        
        ax.barh(y_pos, scores, color=colors, alpha=0.7)
        ax.set_yticks(y_pos)
        ax.set_yticklabels(words)
        ax.invert_yaxis()
        ax.set_xlabel('Contribution to Prediction')
        ax.set_title(f'Word Importance for "{self.class_names[label]}" Prediction')
        ax.axvline(x=0, color='black', linestyle='-', linewidth=0.5)
        
        plt.tight_layout()
        
        if save_path:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"Figure saved to {save_path}")
        
        plt.show()
    
    def __repr__(self) -> str:
        pred_class = self.get_predicted_class()
        probs = self.get_prediction_proba()
        return f"LimeExplanation(predicted='{pred_class}', probabilities={probs})"


class ShapExplainer:
    """
    SHAP (SHapley Additive exPlanations) for text classification.
    
    Provides both local and global explanations using game theory.
    """
    
    def __init__(self,
                 model,
                 vectorizer=None,
                 class_names: List[str] = None,
                 max_display: int = 20):
        """
        Initialize SHAP explainer.
        
        Args:
            model: Trained model with predict_proba method
            vectorizer: Text vectorizer (TF-IDF or similar)
            class_names: Names of classification classes
            max_display: Maximum features to display
        """
        self.model = model
        self.vectorizer = vectorizer
        self.class_names = class_names or ['Fake', 'Real']
        self.max_display = max_display
        self.explainer = None
        self.shap_values = None
    
    def _create_explainer(self, background_data: np.ndarray):
        """Create SHAP explainer with background data."""
        try:
            import shap
            
            # Use KernelExplainer for model-agnostic explanations
            self.explainer = shap.KernelExplainer(
                self.model.predict_proba,
                background_data
            )
            print("SHAP explainer created successfully")
            
        except ImportError:
            print("Warning: shap not installed. Install with: pip install shap")
    
    def compute_shap_values(self,
                             X: np.ndarray,
                             background_data: np.ndarray = None,
                             nsamples: int = 100) -> np.ndarray:
        """
        Compute SHAP values for given data.
        
        Args:
            X: Data to explain
            background_data: Background dataset for SHAP
            nsamples: Number of samples for SHAP computation
            
        Returns:
            SHAP values array
        """
        import shap
        
        if self.explainer is None:
            if background_data is None:
                raise ValueError("background_data required to create explainer")
            self._create_explainer(background_data)
        
        print(f"Computing SHAP values for {len(X)} samples...")
        self.shap_values = self.explainer.shap_values(X, nsamples=nsamples)
        
        return self.shap_values
    
    def plot_summary(self,
                     X: np.ndarray,
                     feature_names: List[str] = None,
                     class_idx: int = 1,
                     save_path: str = None):
        """
        Plot SHAP summary (global feature importance).
        
        Args:
            X: Data used for SHAP values
            feature_names: Names of features
            class_idx: Class index to plot
            save_path: Optional path to save figure
        """
        import shap
        
        if self.shap_values is None:
            raise ValueError("Compute SHAP values first using compute_shap_values()")
        
        plt.figure(figsize=(10, 8))
        
        shap_vals = self.shap_values[class_idx] if isinstance(self.shap_values, list) else self.shap_values
        
        shap.summary_plot(
            shap_vals,
            X,
            feature_names=feature_names,
            max_display=self.max_display,
            show=False
        )
        
        if save_path:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"Figure saved to {save_path}")
        
        plt.show()
    
    def plot_force(self,
                   idx: int,
                   X: np.ndarray,
                   feature_names: List[str] = None,
                   class_idx: int = 1):
        """
        Plot SHAP force plot for a single instance.
        
        Args:
            idx: Index of instance to plot
            X: Data array
            feature_names: Names of features
            class_idx: Class index
        """
        import shap
        
        if self.shap_values is None:
            raise ValueError("Compute SHAP values first")
        
        shap_vals = self.shap_values[class_idx] if isinstance(self.shap_values, list) else self.shap_values
        
        shap.force_plot(
            self.explainer.expected_value[class_idx],
            shap_vals[idx],
            X[idx],
            feature_names=feature_names
        )
    
    def get_feature_importance(self,
                                feature_names: List[str],
                                class_idx: int = 1) -> List[Tuple[str, float]]:
        """
        Get global feature importance from SHAP values.
        
        Args:
            feature_names: Names of features
            class_idx: Class index
            
        Returns:
            List of (feature, importance) tuples
        """
        if self.shap_values is None:
            raise ValueError("Compute SHAP values first")
        
        shap_vals = self.shap_values[class_idx] if isinstance(self.shap_values, list) else self.shap_values
        
        # Mean absolute SHAP value for each feature
        importance = np.abs(shap_vals).mean(axis=0)
        
        feature_importance = list(zip(feature_names, importance))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        return feature_importance


class TextExplainerPipeline:
    """
    Unified pipeline for text explanation using LIME and SHAP.
    """
    
    def __init__(self,
                 model,
                 vectorizer,
                 preprocessor=None,
                 class_names: List[str] = None):
        """
        Initialize explanation pipeline.
        
        Args:
            model: Trained classification model
            vectorizer: Text vectorizer
            preprocessor: Optional text preprocessor
            class_names: Classification class names
        """
        self.model = model
        self.vectorizer = vectorizer
        self.preprocessor = preprocessor
        self.class_names = class_names or ['Fake', 'Real']
        
        # Initialize explainers
        self.lime_explainer = LimeExplainer(class_names=self.class_names)
    
    def _predict_fn(self, texts: List[str]) -> np.ndarray:
        """
        Prediction function for explainers.
        
        Args:
            texts: List of texts
            
        Returns:
            Prediction probabilities
        """
        # Preprocess if needed
        if self.preprocessor:
            texts = [self.preprocessor.preprocess(t) for t in texts]
        
        # Vectorize
        X = self.vectorizer.transform(texts)
        
        # Predict
        if hasattr(self.model, 'predict_proba'):
            return self.model.predict_proba(X)
        else:
            predictions = self.model.predict(X)
            n_classes = len(self.class_names)
            proba = np.zeros((len(predictions), n_classes))
            for i, pred in enumerate(predictions):
                proba[i, int(pred)] = 1.0
            return proba
    
    def explain_with_lime(self,
                          text: str,
                          num_features: int = 10) -> LimeExplanation:
        """
        Explain a prediction using LIME.
        
        Args:
            text: Text to explain
            num_features: Number of features to show
            
        Returns:
            LIME explanation
        """
        return self.lime_explainer.explain_instance(
            text,
            self._predict_fn,
            num_features=num_features
        )
    
    def predict_and_explain(self,
                            text: str,
                            num_features: int = 10) -> Dict[str, Any]:
        """
        Make prediction and provide explanation.
        
        Args:
            text: Text to classify and explain
            num_features: Number of features for explanation
            
        Returns:
            Dictionary with prediction and explanation
        """
        # Get prediction
        probs = self._predict_fn([text])[0]
        predicted_class = self.class_names[np.argmax(probs)]
        confidence = float(max(probs))
        
        # Get LIME explanation
        explanation = self.explain_with_lime(text, num_features)
        word_importance = explanation.get_word_importance()
        
        return {
            'text': text,
            'predicted_class': predicted_class,
            'confidence': confidence,
            'probabilities': {
                name: float(prob) 
                for name, prob in zip(self.class_names, probs)
            },
            'word_importance': word_importance,
            'explanation': explanation
        }
    
    def generate_report(self,
                        text: str,
                        output_dir: str = 'results',
                        num_features: int = 10) -> str:
        """
        Generate comprehensive explanation report.
        
        Args:
            text: Text to analyze
            output_dir: Directory to save results
            num_features: Number of features to show
            
        Returns:
            Path to generated report
        """
        os.makedirs(output_dir, exist_ok=True)
        
        # Get prediction and explanation
        result = self.predict_and_explain(text, num_features)
        
        # Generate report
        report_lines = [
            "=" * 60,
            "FAKE NEWS DETECTION - EXPLANATION REPORT",
            "=" * 60,
            "",
            "INPUT TEXT:",
            "-" * 40,
            text[:500] + ("..." if len(text) > 500 else ""),
            "",
            "PREDICTION:",
            "-" * 40,
            f"Class: {result['predicted_class']}",
            f"Confidence: {result['confidence']:.2%}",
            "",
            "PROBABILITIES:",
            "-" * 40,
        ]
        
        for class_name, prob in result['probabilities'].items():
            report_lines.append(f"  {class_name}: {prob:.2%}")
        
        report_lines.extend([
            "",
            "KEY INFLUENTIAL WORDS:",
            "-" * 40,
        ])
        
        for word, importance in result['word_importance']:
            direction = "→ Real" if importance > 0 else "→ Fake"
            report_lines.append(f"  '{word}': {importance:+.4f} {direction}")
        
        report_lines.extend([
            "",
            "=" * 60,
        ])
        
        report_text = "\n".join(report_lines)
        
        # Save report
        report_path = os.path.join(output_dir, 'explanation_report.txt')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report_text)
        
        # Save HTML explanation
        html_path = os.path.join(output_dir, 'explanation.html')
        result['explanation'].save_html(html_path)
        
        # Save visualization
        fig_path = os.path.join(output_dir, 'word_importance.png')
        result['explanation'].plot_importance(save_path=fig_path)
        
        print(f"\nReport saved to: {report_path}")
        return report_path


def visualize_word_importance(word_importance: List[Tuple[str, float]],
                               title: str = "Word Importance",
                               figsize: Tuple[int, int] = (10, 6),
                               save_path: str = None):
    """
    Visualize word importance as horizontal bar chart.
    
    Args:
        word_importance: List of (word, importance) tuples
        title: Plot title
        figsize: Figure size
        save_path: Optional path to save figure
    """
    words = [w for w, _ in word_importance]
    scores = [s for _, s in word_importance]
    
    # Sort by absolute value
    sorted_indices = np.argsort(np.abs(scores))[::-1]
    words = [words[i] for i in sorted_indices]
    scores = [scores[i] for i in sorted_indices]
    
    colors = ['#2ecc71' if s > 0 else '#e74c3c' for s in scores]
    
    fig, ax = plt.subplots(figsize=figsize)
    y_pos = np.arange(len(words))
    
    bars = ax.barh(y_pos, scores, color=colors, alpha=0.8, edgecolor='black')
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(words, fontsize=10)
    ax.invert_yaxis()
    ax.set_xlabel('Contribution Score', fontsize=11)
    ax.set_title(title, fontsize=13, fontweight='bold')
    ax.axvline(x=0, color='black', linestyle='-', linewidth=0.8)
    
    # Add legend
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='#2ecc71', label='Supports "Real"'),
        Patch(facecolor='#e74c3c', label='Supports "Fake"')
    ]
    ax.legend(handles=legend_elements, loc='lower right')
    
    plt.tight_layout()
    
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        print(f"Figure saved to {save_path}")
    
    plt.show()


if __name__ == "__main__":
    print("Explainability module loaded successfully.")
    print("Required packages: lime, shap")
    print("Install with: pip install lime shap")

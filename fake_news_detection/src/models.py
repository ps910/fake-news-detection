"""
Model Training Module for Fake News Detection
Contains traditional ML models and evaluation utilities
"""

import numpy as np
import pickle
import os
from typing import Dict, List, Tuple, Optional, Any, Union
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import (
    train_test_split, 
    cross_val_score, 
    GridSearchCV,
    StratifiedKFold
)
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
import warnings

warnings.filterwarnings('ignore')


class ModelTrainer:
    """
    Unified model training class for traditional ML models.
    
    Supported models:
    - Logistic Regression
    - Random Forest
    - Support Vector Machine (SVM)
    - Naive Bayes
    """
    
    AVAILABLE_MODELS = {
        'logistic_regression': LogisticRegression,
        'random_forest': RandomForestClassifier,
        'svm': SVC,
        'naive_bayes': MultinomialNB
    }
    
    DEFAULT_PARAMS = {
        'logistic_regression': {
            'max_iter': 1000,
            'random_state': 42,
            'C': 1.0
        },
        'random_forest': {
            'n_estimators': 100,
            'max_depth': 20,
            'random_state': 42,
            'n_jobs': -1
        },
        'svm': {
            'kernel': 'linear',
            'C': 1.0,
            'random_state': 42,
            'probability': True
        },
        'naive_bayes': {
            'alpha': 1.0
        }
    }
    
    def __init__(self, model_type: str = 'logistic_regression', **kwargs):
        """
        Initialize model trainer.
        
        Args:
            model_type: Type of model to use
            **kwargs: Additional model parameters
        """
        if model_type not in self.AVAILABLE_MODELS:
            raise ValueError(
                f"Unknown model type: {model_type}. "
                f"Available: {list(self.AVAILABLE_MODELS.keys())}"
            )
        
        self.model_type = model_type
        
        # Merge default params with provided kwargs
        params = self.DEFAULT_PARAMS[model_type].copy()
        params.update(kwargs)
        
        self.model = self.AVAILABLE_MODELS[model_type](**params)
        self.is_trained = False
        self.feature_names = None
    
    def train(self, 
              X_train: np.ndarray, 
              y_train: np.ndarray,
              feature_names: Optional[List[str]] = None) -> 'ModelTrainer':
        """
        Train the model.
        
        Args:
            X_train: Training features
            y_train: Training labels
            feature_names: Optional list of feature names
            
        Returns:
            Self
        """
        print(f"Training {self.model_type}...")
        self.model.fit(X_train, y_train)
        self.is_trained = True
        self.feature_names = feature_names
        print(f"Training complete!")
        return self
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Make predictions.
        
        Args:
            X: Features to predict
            
        Returns:
            Predicted labels
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        return self.model.predict(X)
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """
        Get prediction probabilities.
        
        Args:
            X: Features to predict
            
        Returns:
            Prediction probabilities
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        if hasattr(self.model, 'predict_proba'):
            return self.model.predict_proba(X)
        else:
            # For models without predict_proba, return one-hot predictions
            predictions = self.predict(X)
            n_classes = len(np.unique(predictions))
            proba = np.zeros((len(predictions), n_classes))
            for i, pred in enumerate(predictions):
                proba[i, int(pred)] = 1.0
            return proba
    
    def evaluate(self, 
                 X_test: np.ndarray, 
                 y_test: np.ndarray,
                 class_names: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Evaluate model performance.
        
        Args:
            X_test: Test features
            y_test: True labels
            class_names: Optional class names for report
            
        Returns:
            Dictionary of evaluation metrics
        """
        predictions = self.predict(X_test)
        probabilities = self.predict_proba(X_test)
        
        metrics = {
            'accuracy': accuracy_score(y_test, predictions),
            'precision': precision_score(y_test, predictions, average='weighted'),
            'recall': recall_score(y_test, predictions, average='weighted'),
            'f1_score': f1_score(y_test, predictions, average='weighted'),
            'confusion_matrix': confusion_matrix(y_test, predictions)
        }
        
        # ROC-AUC for binary classification
        if len(np.unique(y_test)) == 2:
            metrics['roc_auc'] = roc_auc_score(y_test, probabilities[:, 1])
        
        # Classification report
        target_names = class_names or [f"Class {i}" for i in range(len(np.unique(y_test)))]
        metrics['classification_report'] = classification_report(
            y_test, predictions, target_names=target_names
        )
        
        return metrics
    
    def cross_validate(self, 
                       X: np.ndarray, 
                       y: np.ndarray, 
                       cv: int = 5) -> Dict[str, float]:
        """
        Perform cross-validation.
        
        Args:
            X: Features
            y: Labels
            cv: Number of folds
            
        Returns:
            Cross-validation scores
        """
        print(f"Performing {cv}-fold cross-validation...")
        
        skf = StratifiedKFold(n_splits=cv, shuffle=True, random_state=42)
        
        scores = {
            'accuracy': cross_val_score(self.model, X, y, cv=skf, scoring='accuracy'),
            'f1': cross_val_score(self.model, X, y, cv=skf, scoring='f1_weighted'),
            'precision': cross_val_score(self.model, X, y, cv=skf, scoring='precision_weighted'),
            'recall': cross_val_score(self.model, X, y, cv=skf, scoring='recall_weighted')
        }
        
        results = {
            metric: {
                'mean': np.mean(values),
                'std': np.std(values),
                'scores': values.tolist()
            }
            for metric, values in scores.items()
        }
        
        print(f"CV Accuracy: {results['accuracy']['mean']:.4f} (+/- {results['accuracy']['std']:.4f})")
        print(f"CV F1-score: {results['f1']['mean']:.4f} (+/- {results['f1']['std']:.4f})")
        
        return results
    
    def get_feature_importance(self, top_n: int = 20) -> Optional[List[Tuple[str, float]]]:
        """
        Get feature importance (for models that support it).
        
        Args:
            top_n: Number of top features to return
            
        Returns:
            List of (feature_name, importance) tuples
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet.")
        
        if self.feature_names is None:
            print("Feature names not provided during training.")
            return None
        
        # Get importance based on model type
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
        elif hasattr(self.model, 'coef_'):
            importances = np.abs(self.model.coef_).flatten()
        else:
            print(f"Feature importance not available for {self.model_type}")
            return None
        
        # Pair features with importances
        feature_importance = list(zip(self.feature_names, importances))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        return feature_importance[:top_n]
    
    def save(self, filepath: str):
        """
        Save model to file.
        
        Args:
            filepath: Path to save model
        """
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'model_type': self.model_type,
                'is_trained': self.is_trained,
                'feature_names': self.feature_names
            }, f)
        print(f"Model saved to {filepath}")
    
    @classmethod
    def load(cls, filepath: str) -> 'ModelTrainer':
        """
        Load model from file.
        
        Args:
            filepath: Path to model file
            
        Returns:
            Loaded ModelTrainer instance
        """
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
        
        trainer = cls(model_type=data['model_type'])
        trainer.model = data['model']
        trainer.is_trained = data['is_trained']
        trainer.feature_names = data['feature_names']
        
        print(f"Model loaded from {filepath}")
        return trainer


class HyperparameterTuner:
    """
    Hyperparameter tuning for model optimization.
    """
    
    PARAM_GRIDS = {
        'logistic_regression': {
            'C': [0.01, 0.1, 1.0, 10.0],
            'penalty': ['l2'],
            'solver': ['lbfgs', 'liblinear']
        },
        'random_forest': {
            'n_estimators': [50, 100, 200],
            'max_depth': [10, 20, 30, None],
            'min_samples_split': [2, 5, 10]
        },
        'svm': {
            'C': [0.1, 1.0, 10.0],
            'kernel': ['linear', 'rbf'],
            'gamma': ['scale', 'auto']
        },
        'naive_bayes': {
            'alpha': [0.1, 0.5, 1.0, 2.0]
        }
    }
    
    def __init__(self, 
                 model_type: str,
                 param_grid: Optional[Dict] = None,
                 cv: int = 5,
                 scoring: str = 'f1_weighted',
                 n_jobs: int = -1):
        """
        Initialize hyperparameter tuner.
        
        Args:
            model_type: Type of model to tune
            param_grid: Custom parameter grid
            cv: Number of cross-validation folds
            scoring: Scoring metric
            n_jobs: Number of parallel jobs
        """
        self.model_type = model_type
        self.param_grid = param_grid or self.PARAM_GRIDS.get(model_type, {})
        self.cv = cv
        self.scoring = scoring
        self.n_jobs = n_jobs
        
        self.best_params = None
        self.best_score = None
        self.cv_results = None
    
    def tune(self, 
             X: np.ndarray, 
             y: np.ndarray,
             verbose: int = 1) -> Dict[str, Any]:
        """
        Perform hyperparameter tuning.
        
        Args:
            X: Training features
            y: Training labels
            verbose: Verbosity level
            
        Returns:
            Best parameters and scores
        """
        print(f"Tuning {self.model_type} with {len(self.param_grid)} parameters...")
        
        # Create base model
        base_model = ModelTrainer.AVAILABLE_MODELS[self.model_type]()
        
        # Grid search
        grid_search = GridSearchCV(
            estimator=base_model,
            param_grid=self.param_grid,
            cv=self.cv,
            scoring=self.scoring,
            n_jobs=self.n_jobs,
            verbose=verbose
        )
        
        grid_search.fit(X, y)
        
        self.best_params = grid_search.best_params_
        self.best_score = grid_search.best_score_
        self.cv_results = grid_search.cv_results_
        
        print(f"Best parameters: {self.best_params}")
        print(f"Best {self.scoring} score: {self.best_score:.4f}")
        
        return {
            'best_params': self.best_params,
            'best_score': self.best_score,
            'cv_results': self.cv_results
        }
    
    def get_best_model(self) -> ModelTrainer:
        """
        Get model with best parameters.
        
        Returns:
            ModelTrainer with best parameters
        """
        if self.best_params is None:
            raise ValueError("No tuning performed yet. Call tune() first.")
        
        return ModelTrainer(self.model_type, **self.best_params)


class ModelComparison:
    """
    Compare multiple models on the same dataset.
    """
    
    def __init__(self, 
                 models: List[str] = None,
                 cv: int = 5):
        """
        Initialize model comparison.
        
        Args:
            models: List of model types to compare
            cv: Number of cross-validation folds
        """
        self.models = models or ['logistic_regression', 'random_forest', 'svm', 'naive_bayes']
        self.cv = cv
        self.results = {}
    
    def compare(self, 
                X: np.ndarray, 
                y: np.ndarray,
                class_names: Optional[List[str]] = None) -> Dict[str, Dict]:
        """
        Compare models using cross-validation.
        
        Args:
            X: Features
            y: Labels
            class_names: Optional class names
            
        Returns:
            Comparison results
        """
        print("Comparing models...")
        print("-" * 60)
        
        for model_type in self.models:
            try:
                trainer = ModelTrainer(model_type)
                cv_results = trainer.cross_validate(X, y, cv=self.cv)
                self.results[model_type] = cv_results
            except Exception as e:
                print(f"Error with {model_type}: {e}")
                self.results[model_type] = {'error': str(e)}
        
        print("-" * 60)
        return self.results
    
    def get_best_model(self, metric: str = 'accuracy') -> str:
        """
        Get the best performing model.
        
        Args:
            metric: Metric to use for comparison
            
        Returns:
            Best model type
        """
        best_model = None
        best_score = -1
        
        for model_type, results in self.results.items():
            if 'error' not in results and metric in results:
                score = results[metric]['mean']
                if score > best_score:
                    best_score = score
                    best_model = model_type
        
        print(f"Best model: {best_model} with {metric}={best_score:.4f}")
        return best_model
    
    def summary(self) -> str:
        """Generate summary of comparison results."""
        lines = ["Model Comparison Summary", "=" * 50]
        
        for model_type, results in self.results.items():
            if 'error' in results:
                lines.append(f"{model_type}: Error - {results['error']}")
            else:
                acc = results['accuracy']['mean']
                f1 = results['f1']['mean']
                lines.append(f"{model_type}:")
                lines.append(f"  Accuracy: {acc:.4f} (+/- {results['accuracy']['std']:.4f})")
                lines.append(f"  F1-score: {f1:.4f} (+/- {results['f1']['std']:.4f})")
        
        return "\n".join(lines)


def print_evaluation_report(metrics: Dict[str, Any], model_name: str = "Model"):
    """
    Print formatted evaluation report.
    
    Args:
        metrics: Dictionary of metrics
        model_name: Name of the model
    """
    print(f"\n{'='*60}")
    print(f"Evaluation Report: {model_name}")
    print('='*60)
    
    print(f"\nAccuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"F1-score:  {metrics['f1_score']:.4f}")
    
    if 'roc_auc' in metrics:
        print(f"ROC-AUC:   {metrics['roc_auc']:.4f}")
    
    print(f"\nConfusion Matrix:")
    print(metrics['confusion_matrix'])
    
    print(f"\nClassification Report:")
    print(metrics['classification_report'])


if __name__ == "__main__":
    # Example usage
    from sklearn.datasets import make_classification
    
    # Generate sample data
    X, y = make_classification(
        n_samples=1000, 
        n_features=100, 
        n_classes=2, 
        random_state=42
    )
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train and evaluate a model
    trainer = ModelTrainer('logistic_regression')
    trainer.train(X_train, y_train)
    
    metrics = trainer.evaluate(X_test, y_test, class_names=['Fake', 'Real'])
    print_evaluation_report(metrics, 'Logistic Regression')

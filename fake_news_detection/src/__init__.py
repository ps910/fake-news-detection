"""
Fake News Detection with Explainable NLP
=========================================

A comprehensive Python package for detecting fake news with 
interpretable AI explanations using LIME and SHAP.

Modules:
- preprocessing: Text cleaning and tokenization
- feature_engineering: TF-IDF and BERT embeddings
- models: ML model training and evaluation
- bert_model: BERT-based deep learning
- explainability: LIME and SHAP explanations
- pipeline: End-to-end training and prediction
"""

from .preprocessing import TextPreprocessor, DataLoader
from .feature_engineering import TfidfFeatureExtractor, BertFeatureExtractor
from .models import ModelTrainer, ModelComparison
from .explainability import LimeExplainer, ShapExplainer, TextExplainerPipeline
from .pipeline import FakeNewsDetector

__version__ = "1.0.0"
__author__ = "Your Name"

__all__ = [
    'TextPreprocessor',
    'DataLoader',
    'TfidfFeatureExtractor',
    'BertFeatureExtractor',
    'ModelTrainer',
    'ModelComparison',
    'LimeExplainer',
    'ShapExplainer',
    'TextExplainerPipeline',
    'FakeNewsDetector'
]

"""
Configuration settings for Fake News Detection project
"""

import os

# Project paths
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results")

# Create directories if they don't exist
for directory in [DATA_DIR, MODELS_DIR, RESULTS_DIR]:
    os.makedirs(directory, exist_ok=True)

# Data settings
RAW_DATA_PATH = os.path.join(DATA_DIR, "raw")
PROCESSED_DATA_PATH = os.path.join(DATA_DIR, "processed")

# Model settings
MODEL_CONFIG = {
    "logistic_regression": {
        "max_iter": 1000,
        "random_state": 42,
        "C": 1.0
    },
    "random_forest": {
        "n_estimators": 100,
        "max_depth": 20,
        "random_state": 42
    },
    "svm": {
        "kernel": "linear",
        "C": 1.0,
        "random_state": 42,
        "probability": True
    },
    "bert": {
        "model_name": "bert-base-uncased",
        "max_length": 256,
        "batch_size": 16,
        "epochs": 3,
        "learning_rate": 2e-5
    }
}

# TF-IDF settings
TFIDF_CONFIG = {
    "max_features": 5000,
    "ngram_range": (1, 2),
    "min_df": 2,
    "max_df": 0.95
}

# Training settings
TRAIN_CONFIG = {
    "test_size": 0.2,
    "validation_size": 0.1,
    "random_state": 42,
    "cv_folds": 5
}

# Explainability settings
EXPLAINER_CONFIG = {
    "lime": {
        "num_features": 10,
        "num_samples": 5000
    },
    "shap": {
        "max_display": 20,
        "check_additivity": False
    }
}

# Class labels (WELFake dataset: 0=Real, 1=Fake)
CLASS_NAMES = ["Real", "Fake"]

"""
Feature Engineering Module for Fake News Detection
Handles TF-IDF vectorization and text embeddings
"""

import numpy as np
import pickle
from typing import List, Tuple, Optional, Union
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import TruncatedSVD
import os


class TfidfFeatureExtractor:
    """
    TF-IDF based feature extraction for fake news detection.
    
    Features:
    - Configurable TF-IDF parameters
    - N-gram support
    - Dimensionality reduction
    - Save/load functionality
    """
    
    def __init__(self,
                 max_features: int = 5000,
                 ngram_range: Tuple[int, int] = (1, 2),
                 min_df: int = 2,
                 max_df: float = 0.95,
                 use_idf: bool = True,
                 sublinear_tf: bool = True):
        """
        Initialize TF-IDF feature extractor.
        
        Args:
            max_features: Maximum number of features
            ngram_range: Range of n-grams (min, max)
            min_df: Minimum document frequency
            max_df: Maximum document frequency
            use_idf: Whether to use inverse document frequency
            sublinear_tf: Apply sublinear TF scaling
        """
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.min_df = min_df
        self.max_df = max_df
        
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            min_df=min_df,
            max_df=max_df,
            use_idf=use_idf,
            sublinear_tf=sublinear_tf,
            stop_words='english'
        )
        
        self.is_fitted = False
        self.feature_names = None
    
    def fit(self, texts: List[str]) -> 'TfidfFeatureExtractor':
        """
        Fit the vectorizer on training texts.
        
        Args:
            texts: List of training texts
            
        Returns:
            Self
        """
        self.vectorizer.fit(texts)
        self.is_fitted = True
        self.feature_names = self.vectorizer.get_feature_names_out()
        print(f"Fitted TF-IDF vectorizer with {len(self.feature_names)} features")
        return self
    
    def transform(self, texts: List[str]) -> np.ndarray:
        """
        Transform texts to TF-IDF features.
        
        Args:
            texts: List of texts to transform
            
        Returns:
            TF-IDF feature matrix
        """
        if not self.is_fitted:
            raise ValueError("Vectorizer not fitted. Call fit() first.")
        
        return self.vectorizer.transform(texts)
    
    def fit_transform(self, texts: List[str]) -> np.ndarray:
        """
        Fit vectorizer and transform texts.
        
        Args:
            texts: List of texts
            
        Returns:
            TF-IDF feature matrix
        """
        self.fit(texts)
        return self.transform(texts)
    
    def get_feature_names(self) -> List[str]:
        """Get feature names from vectorizer."""
        if self.feature_names is None:
            raise ValueError("Vectorizer not fitted yet.")
        return list(self.feature_names)
    
    def get_top_features(self, n: int = 20) -> List[Tuple[str, float]]:
        """
        Get top N features by IDF score.
        
        Args:
            n: Number of top features
            
        Returns:
            List of (feature, idf_score) tuples
        """
        if not self.is_fitted:
            raise ValueError("Vectorizer not fitted yet.")
        
        idf_scores = self.vectorizer.idf_
        feature_idf = list(zip(self.feature_names, idf_scores))
        feature_idf.sort(key=lambda x: x[1], reverse=True)
        
        return feature_idf[:n]
    
    def save(self, filepath: str):
        """
        Save vectorizer to file.
        
        Args:
            filepath: Path to save file
        """
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'wb') as f:
            pickle.dump({
                'vectorizer': self.vectorizer,
                'is_fitted': self.is_fitted,
                'feature_names': self.feature_names
            }, f)
        print(f"Saved vectorizer to {filepath}")
    
    def load(self, filepath: str) -> 'TfidfFeatureExtractor':
        """
        Load vectorizer from file.
        
        Args:
            filepath: Path to load file
            
        Returns:
            Self
        """
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
        
        self.vectorizer = data['vectorizer']
        self.is_fitted = data['is_fitted']
        self.feature_names = data['feature_names']
        print(f"Loaded vectorizer from {filepath}")
        return self


class BertFeatureExtractor:
    """
    BERT-based feature extraction for fake news detection.
    Uses Hugging Face transformers for embeddings.
    """
    
    def __init__(self,
                 model_name: str = "bert-base-uncased",
                 max_length: int = 256,
                 batch_size: int = 16,
                 device: str = None):
        """
        Initialize BERT feature extractor.
        
        Args:
            model_name: Hugging Face model name
            max_length: Maximum sequence length
            batch_size: Batch size for processing
            device: Device to use ('cuda' or 'cpu')
        """
        self.model_name = model_name
        self.max_length = max_length
        self.batch_size = batch_size
        self.device = device
        
        self.tokenizer = None
        self.model = None
        self.is_loaded = False
    
    def load_model(self):
        """Load BERT model and tokenizer."""
        try:
            from transformers import AutoTokenizer, AutoModel
            import torch
            
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModel.from_pretrained(self.model_name)
            
            # Set device
            if self.device is None:
                self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            
            print(f"Loaded {self.model_name} on {self.device}")
            
        except ImportError:
            raise ImportError(
                "Please install transformers and torch: "
                "pip install transformers torch"
            )
    
    def extract_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Extract BERT embeddings for texts.
        
        Args:
            texts: List of texts
            
        Returns:
            Embedding matrix (num_texts, embedding_dim)
        """
        if not self.is_loaded:
            self.load_model()
        
        import torch
        
        embeddings = []
        
        for i in range(0, len(texts), self.batch_size):
            batch_texts = texts[i:i + self.batch_size]
            
            # Tokenize
            inputs = self.tokenizer(
                batch_texts,
                padding=True,
                truncation=True,
                max_length=self.max_length,
                return_tensors='pt'
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get embeddings
            with torch.no_grad():
                outputs = self.model(**inputs)
                # Use [CLS] token embedding
                batch_embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            
            embeddings.append(batch_embeddings)
            
            if (i + self.batch_size) % 100 == 0:
                print(f"Processed {min(i + self.batch_size, len(texts))}/{len(texts)} texts")
        
        return np.vstack(embeddings)


class DimensionalityReducer:
    """
    Dimensionality reduction for high-dimensional features.
    """
    
    def __init__(self, n_components: int = 100, method: str = 'svd'):
        """
        Initialize dimensionality reducer.
        
        Args:
            n_components: Number of components to keep
            method: Reduction method ('svd', 'pca')
        """
        self.n_components = n_components
        self.method = method
        
        if method == 'svd':
            self.reducer = TruncatedSVD(n_components=n_components, random_state=42)
        else:
            from sklearn.decomposition import PCA
            self.reducer = PCA(n_components=n_components, random_state=42)
        
        self.is_fitted = False
    
    def fit(self, X: np.ndarray) -> 'DimensionalityReducer':
        """Fit the reducer."""
        self.reducer.fit(X)
        self.is_fitted = True
        
        explained_var = sum(self.reducer.explained_variance_ratio_) * 100
        print(f"Reduced to {self.n_components} components, "
              f"explaining {explained_var:.2f}% variance")
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """Transform features."""
        if not self.is_fitted:
            raise ValueError("Reducer not fitted. Call fit() first.")
        return self.reducer.transform(X)
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """Fit and transform."""
        self.fit(X)
        return self.transform(X)


class FeatureEngineer:
    """
    Combined feature engineering pipeline.
    """
    
    def __init__(self,
                 method: str = 'tfidf',
                 tfidf_config: dict = None,
                 bert_config: dict = None,
                 reduce_dims: bool = False,
                 n_components: int = 100):
        """
        Initialize feature engineer.
        
        Args:
            method: Feature extraction method ('tfidf', 'bert', 'combined')
            tfidf_config: TF-IDF configuration
            bert_config: BERT configuration
            reduce_dims: Whether to apply dimensionality reduction
            n_components: Number of components for reduction
        """
        self.method = method
        self.reduce_dims = reduce_dims
        
        # Initialize TF-IDF
        tfidf_config = tfidf_config or {}
        self.tfidf_extractor = TfidfFeatureExtractor(**tfidf_config)
        
        # Initialize BERT if needed
        if method in ['bert', 'combined']:
            bert_config = bert_config or {}
            self.bert_extractor = BertFeatureExtractor(**bert_config)
        else:
            self.bert_extractor = None
        
        # Initialize dimensionality reducer
        if reduce_dims:
            self.reducer = DimensionalityReducer(n_components=n_components)
        else:
            self.reducer = None
    
    def fit_transform(self, texts: List[str]) -> np.ndarray:
        """
        Fit feature extractors and transform texts.
        
        Args:
            texts: List of texts
            
        Returns:
            Feature matrix
        """
        if self.method == 'tfidf':
            features = self.tfidf_extractor.fit_transform(texts)
            if hasattr(features, 'toarray'):
                features = features.toarray()
        
        elif self.method == 'bert':
            features = self.bert_extractor.extract_embeddings(texts)
        
        elif self.method == 'combined':
            tfidf_features = self.tfidf_extractor.fit_transform(texts)
            if hasattr(tfidf_features, 'toarray'):
                tfidf_features = tfidf_features.toarray()
            
            bert_features = self.bert_extractor.extract_embeddings(texts)
            features = np.hstack([tfidf_features, bert_features])
        
        else:
            raise ValueError(f"Unknown method: {self.method}")
        
        # Apply dimensionality reduction
        if self.reduce_dims and self.reducer:
            features = self.reducer.fit_transform(features)
        
        return features
    
    def transform(self, texts: List[str]) -> np.ndarray:
        """
        Transform texts using fitted extractors.
        
        Args:
            texts: List of texts
            
        Returns:
            Feature matrix
        """
        if self.method == 'tfidf':
            features = self.tfidf_extractor.transform(texts)
            if hasattr(features, 'toarray'):
                features = features.toarray()
        
        elif self.method == 'bert':
            features = self.bert_extractor.extract_embeddings(texts)
        
        elif self.method == 'combined':
            tfidf_features = self.tfidf_extractor.transform(texts)
            if hasattr(tfidf_features, 'toarray'):
                tfidf_features = tfidf_features.toarray()
            
            bert_features = self.bert_extractor.extract_embeddings(texts)
            features = np.hstack([tfidf_features, bert_features])
        
        else:
            raise ValueError(f"Unknown method: {self.method}")
        
        # Apply dimensionality reduction
        if self.reduce_dims and self.reducer:
            features = self.reducer.transform(features)
        
        return features


if __name__ == "__main__":
    # Example usage
    sample_texts = [
        "Government officials announce new economic policy changes",
        "SHOCKING secret revealed about celebrity scandal",
        "Scientists discover breakthrough in renewable energy",
        "You won't believe what this politician said about taxes"
    ]
    
    # TF-IDF features
    tfidf_extractor = TfidfFeatureExtractor(max_features=100)
    tfidf_features = tfidf_extractor.fit_transform(sample_texts)
    
    print(f"TF-IDF feature shape: {tfidf_features.shape}")
    print(f"Top features: {tfidf_extractor.get_top_features(5)}")

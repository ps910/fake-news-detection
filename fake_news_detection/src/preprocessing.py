"""
Data Preprocessing Module for Fake News Detection
Handles text cleaning, tokenization, and preparation
"""

import re
import string
import pandas as pd
import numpy as np
from typing import List, Tuple, Optional, Union
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import warnings

warnings.filterwarnings('ignore')

# Download required NLTK data
def download_nltk_resources():
    """Download required NLTK resources"""
    resources = ['punkt', 'stopwords', 'wordnet', 'punkt_tab']
    for resource in resources:
        try:
            nltk.download(resource, quiet=True)
        except Exception as e:
            print(f"Warning: Could not download {resource}: {e}")


class TextPreprocessor:
    """
    A comprehensive text preprocessing class for fake news detection.
    
    Features:
    - Text cleaning (URLs, mentions, hashtags, special characters)
    - Lowercasing
    - Stop-word removal
    - Tokenization
    - Lemmatization
    """
    
    def __init__(self, 
                 remove_stopwords: bool = True,
                 lemmatize: bool = True,
                 lowercase: bool = True,
                 remove_urls: bool = True,
                 remove_numbers: bool = False,
                 min_word_length: int = 2):
        """
        Initialize the preprocessor with configuration options.
        
        Args:
            remove_stopwords: Whether to remove stop words
            lemmatize: Whether to apply lemmatization
            lowercase: Whether to convert text to lowercase
            remove_urls: Whether to remove URLs
            remove_numbers: Whether to remove numbers
            min_word_length: Minimum word length to keep
        """
        download_nltk_resources()
        
        self.remove_stopwords = remove_stopwords
        self.lemmatize = lemmatize
        self.lowercase = lowercase
        self.remove_urls = remove_urls
        self.remove_numbers = remove_numbers
        self.min_word_length = min_word_length
        
        # Initialize NLTK components
        try:
            self.stop_words = set(stopwords.words('english'))
        except:
            self.stop_words = set()
        self.lemmatizer = WordNetLemmatizer()
        
        # Regex patterns
        self.url_pattern = re.compile(r'https?://\S+|www\.\S+')
        self.email_pattern = re.compile(r'\S+@\S+')
        self.mention_pattern = re.compile(r'@\w+')
        self.hashtag_pattern = re.compile(r'#\w+')
        self.html_pattern = re.compile(r'<.*?>')
        self.emoji_pattern = re.compile(
            "["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+", 
            flags=re.UNICODE
        )
    
    def clean_text(self, text: str) -> str:
        """
        Apply basic text cleaning operations.
        
        Args:
            text: Input text string
            
        Returns:
            Cleaned text string
        """
        if not isinstance(text, str):
            return ""
        
        # Remove HTML tags
        text = self.html_pattern.sub(' ', text)
        
        # Remove URLs
        if self.remove_urls:
            text = self.url_pattern.sub(' ', text)
        
        # Remove emails
        text = self.email_pattern.sub(' ', text)
        
        # Remove mentions and hashtags
        text = self.mention_pattern.sub(' ', text)
        text = self.hashtag_pattern.sub(' ', text)
        
        # Remove emojis
        text = self.emoji_pattern.sub(' ', text)
        
        # Remove special characters and punctuation
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove numbers if specified
        if self.remove_numbers:
            text = re.sub(r'\d+', ' ', text)
        
        # Lowercase
        if self.lowercase:
            text = text.lower()
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def tokenize(self, text: str) -> List[str]:
        """
        Tokenize text into words.
        
        Args:
            text: Input text string
            
        Returns:
            List of tokens
        """
        try:
            tokens = word_tokenize(text)
        except:
            tokens = text.split()
        return tokens
    
    def remove_stopwords_from_tokens(self, tokens: List[str]) -> List[str]:
        """
        Remove stop words from token list.
        
        Args:
            tokens: List of tokens
            
        Returns:
            Filtered list of tokens
        """
        return [token for token in tokens if token.lower() not in self.stop_words]
    
    def lemmatize_tokens(self, tokens: List[str]) -> List[str]:
        """
        Apply lemmatization to tokens.
        
        Args:
            tokens: List of tokens
            
        Returns:
            Lemmatized list of tokens
        """
        return [self.lemmatizer.lemmatize(token) for token in tokens]
    
    def filter_by_length(self, tokens: List[str]) -> List[str]:
        """
        Filter tokens by minimum length.
        
        Args:
            tokens: List of tokens
            
        Returns:
            Filtered list of tokens
        """
        return [token for token in tokens if len(token) >= self.min_word_length]
    
    def preprocess(self, text: str) -> str:
        """
        Apply full preprocessing pipeline to text.
        
        Args:
            text: Input text string
            
        Returns:
            Preprocessed text string
        """
        # Clean text
        text = self.clean_text(text)
        
        # Tokenize
        tokens = self.tokenize(text)
        
        # Remove stopwords
        if self.remove_stopwords:
            tokens = self.remove_stopwords_from_tokens(tokens)
        
        # Lemmatize
        if self.lemmatize:
            tokens = self.lemmatize_tokens(tokens)
        
        # Filter by length
        tokens = self.filter_by_length(tokens)
        
        return ' '.join(tokens)
    
    def preprocess_batch(self, texts: List[str], verbose: bool = True) -> List[str]:
        """
        Apply preprocessing to a batch of texts.
        
        Args:
            texts: List of text strings
            verbose: Whether to show progress
            
        Returns:
            List of preprocessed text strings
        """
        processed = []
        total = len(texts)
        
        for i, text in enumerate(texts):
            processed.append(self.preprocess(text))
            if verbose and (i + 1) % 1000 == 0:
                print(f"Processed {i + 1}/{total} texts...")
        
        return processed


class DataLoader:
    """
    Handles loading and initial processing of fake news datasets.
    """
    
    def __init__(self, preprocessor: Optional[TextPreprocessor] = None):
        """
        Initialize DataLoader.
        
        Args:
            preprocessor: TextPreprocessor instance for text cleaning
        """
        self.preprocessor = preprocessor or TextPreprocessor()
    
    def load_csv(self, 
                 filepath: str, 
                 text_column: str = 'text',
                 label_column: str = 'label',
                 title_column: Optional[str] = None) -> pd.DataFrame:
        """
        Load data from CSV file.
        
        Args:
            filepath: Path to CSV file
            text_column: Name of column containing text
            label_column: Name of column containing labels
            title_column: Optional name of column containing titles
            
        Returns:
            Loaded DataFrame
        """
        df = pd.read_csv(filepath)
        
        # Validate columns
        required_cols = [text_column, label_column]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Column '{col}' not found in dataset")
        
        # Handle missing values
        df = df.dropna(subset=[text_column, label_column])
        
        # Combine title and text if title column exists
        if title_column and title_column in df.columns:
            df['combined_text'] = df[title_column].fillna('') + ' ' + df[text_column].fillna('')
            df[text_column] = df['combined_text']
        
        return df
    
    def encode_labels(self, 
                      labels: pd.Series, 
                      label_mapping: Optional[dict] = None) -> Tuple[np.ndarray, dict]:
        """
        Encode string labels to numerical values.
        
        Args:
            labels: Series of label values
            label_mapping: Optional custom label mapping
            
        Returns:
            Tuple of encoded labels and mapping dictionary
        """
        if label_mapping is None:
            unique_labels = labels.unique()
            label_mapping = {label: idx for idx, label in enumerate(sorted(unique_labels))}
        
        encoded = labels.map(label_mapping).values
        return encoded, label_mapping
    
    def prepare_dataset(self,
                        filepath: str,
                        text_column: str = 'text',
                        label_column: str = 'label',
                        preprocess: bool = True) -> Tuple[List[str], np.ndarray, dict]:
        """
        Load and prepare dataset for training.
        
        Args:
            filepath: Path to data file
            text_column: Name of text column
            label_column: Name of label column
            preprocess: Whether to preprocess text
            
        Returns:
            Tuple of (texts, labels, label_mapping)
        """
        # Load data
        df = self.load_csv(filepath, text_column, label_column)
        
        # Get texts
        texts = df[text_column].tolist()
        
        # Preprocess if requested
        if preprocess:
            print("Preprocessing texts...")
            texts = self.preprocessor.preprocess_batch(texts)
        
        # Encode labels
        labels, label_mapping = self.encode_labels(df[label_column])
        
        print(f"Loaded {len(texts)} samples")
        print(f"Label distribution: {pd.Series(labels).value_counts().to_dict()}")
        
        return texts, labels, label_mapping


def create_sample_dataset(output_path: str, num_samples: int = 1000):
    """
    Create a sample dataset for testing purposes.
    
    Args:
        output_path: Path to save the sample dataset
        num_samples: Number of samples to generate
    """
    np.random.seed(42)
    
    fake_templates = [
        "BREAKING: Scientists discover {} causes {}!",
        "SHOCKING: Government hides {} from public!",
        "You won't believe what {} revealed about {}!",
        "EXCLUSIVE: {} exposed in major scandal!",
        "URGENT: {} confirms {} conspiracy!",
    ]
    
    real_templates = [
        "Study finds {} may impact {} rates",
        "Researchers report {} in new findings",
        "Analysis shows {} trend continues",
        "Report indicates {} affects {} outcomes",
        "Data suggests {} correlates with {}",
    ]
    
    topics = ["climate", "economy", "health", "technology", "education", "politics"]
    effects = ["growth", "decline", "changes", "improvements", "challenges"]
    
    data = []
    for _ in range(num_samples):
        if np.random.random() > 0.5:
            template = np.random.choice(fake_templates)
            label = "FAKE"
        else:
            template = np.random.choice(real_templates)
            label = "REAL"
        
        topic1 = np.random.choice(topics)
        topic2 = np.random.choice(effects)
        text = template.format(topic1, topic2)
        
        data.append({"text": text, "label": label})
    
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Sample dataset saved to {output_path}")


if __name__ == "__main__":
    # Example usage
    preprocessor = TextPreprocessor()
    
    sample_text = """
    BREAKING NEWS!!! Check out this amazing story at https://example.com 
    @journalist shared #FakeNews about the government 😱😱😱
    This is absolutely SHOCKING information that everyone needs to know!!!
    """
    
    print("Original text:")
    print(sample_text)
    print("\nPreprocessed text:")
    print(preprocessor.preprocess(sample_text))

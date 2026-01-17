"""
BERT-based Model for Fake News Detection
Uses Hugging Face Transformers for fine-tuning
"""

import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from typing import List, Tuple, Optional, Dict, Any
import os


class FakeNewsDataset(Dataset):
    """PyTorch Dataset for fake news classification."""
    
    def __init__(self, 
                 texts: List[str], 
                 labels: np.ndarray,
                 tokenizer,
                 max_length: int = 256):
        """
        Initialize dataset.
        
        Args:
            texts: List of text strings
            labels: Array of labels
            tokenizer: Hugging Face tokenizer
            max_length: Maximum sequence length
        """
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_length,
            padding='max_length',
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'label': torch.tensor(label, dtype=torch.long)
        }


class BertClassifier:
    """
    BERT-based classifier for fake news detection.
    """
    
    def __init__(self,
                 model_name: str = 'bert-base-uncased',
                 num_labels: int = 2,
                 max_length: int = 256,
                 batch_size: int = 16,
                 learning_rate: float = 2e-5,
                 epochs: int = 3,
                 device: str = None):
        """
        Initialize BERT classifier.
        
        Args:
            model_name: Hugging Face model name
            num_labels: Number of classification labels
            max_length: Maximum sequence length
            batch_size: Training batch size
            learning_rate: Learning rate
            epochs: Number of training epochs
            device: Device to use ('cuda' or 'cpu')
        """
        self.model_name = model_name
        self.num_labels = num_labels
        self.max_length = max_length
        self.batch_size = batch_size
        self.learning_rate = learning_rate
        self.epochs = epochs
        
        # Set device
        if device is None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = device
        
        self.model = None
        self.tokenizer = None
        self.is_trained = False
    
    def _load_model(self):
        """Load BERT model and tokenizer."""
        try:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name,
                num_labels=self.num_labels
            )
            self.model.to(self.device)
            
            print(f"Loaded {self.model_name} on {self.device}")
            
        except ImportError:
            raise ImportError(
                "Please install transformers: pip install transformers torch"
            )
    
    def train(self,
              X_train: List[str],
              y_train: np.ndarray,
              X_val: Optional[List[str]] = None,
              y_val: Optional[np.ndarray] = None) -> Dict[str, List[float]]:
        """
        Train the BERT model.
        
        Args:
            X_train: Training texts
            y_train: Training labels
            X_val: Optional validation texts
            y_val: Optional validation labels
            
        Returns:
            Training history
        """
        from transformers import AdamW, get_linear_schedule_with_warmup
        
        if self.model is None:
            self._load_model()
        
        # Create datasets
        train_dataset = FakeNewsDataset(
            X_train, y_train, self.tokenizer, self.max_length
        )
        train_loader = DataLoader(
            train_dataset, batch_size=self.batch_size, shuffle=True
        )
        
        val_loader = None
        if X_val is not None and y_val is not None:
            val_dataset = FakeNewsDataset(
                X_val, y_val, self.tokenizer, self.max_length
            )
            val_loader = DataLoader(
                val_dataset, batch_size=self.batch_size
            )
        
        # Optimizer and scheduler
        optimizer = AdamW(self.model.parameters(), lr=self.learning_rate)
        total_steps = len(train_loader) * self.epochs
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=0,
            num_training_steps=total_steps
        )
        
        # Training history
        history = {
            'train_loss': [],
            'train_acc': [],
            'val_loss': [],
            'val_acc': []
        }
        
        # Training loop
        print(f"Training for {self.epochs} epochs...")
        
        for epoch in range(self.epochs):
            # Training phase
            self.model.train()
            train_loss = 0
            train_correct = 0
            train_total = 0
            
            for batch in train_loader:
                optimizer.zero_grad()
                
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['label'].to(self.device)
                
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                loss = outputs.loss
                train_loss += loss.item()
                
                _, predicted = torch.max(outputs.logits, 1)
                train_total += labels.size(0)
                train_correct += (predicted == labels).sum().item()
                
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                optimizer.step()
                scheduler.step()
            
            avg_train_loss = train_loss / len(train_loader)
            train_acc = train_correct / train_total
            
            history['train_loss'].append(avg_train_loss)
            history['train_acc'].append(train_acc)
            
            # Validation phase
            if val_loader:
                val_loss, val_acc = self._evaluate_loader(val_loader)
                history['val_loss'].append(val_loss)
                history['val_acc'].append(val_acc)
                
                print(f"Epoch {epoch+1}/{self.epochs} - "
                      f"Train Loss: {avg_train_loss:.4f}, Train Acc: {train_acc:.4f}, "
                      f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")
            else:
                print(f"Epoch {epoch+1}/{self.epochs} - "
                      f"Train Loss: {avg_train_loss:.4f}, Train Acc: {train_acc:.4f}")
        
        self.is_trained = True
        return history
    
    def _evaluate_loader(self, data_loader) -> Tuple[float, float]:
        """Evaluate model on a data loader."""
        self.model.eval()
        total_loss = 0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for batch in data_loader:
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['label'].to(self.device)
                
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                total_loss += outputs.loss.item()
                _, predicted = torch.max(outputs.logits, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        return total_loss / len(data_loader), correct / total
    
    def predict(self, texts: List[str]) -> np.ndarray:
        """
        Make predictions.
        
        Args:
            texts: List of texts to classify
            
        Returns:
            Predicted labels
        """
        probabilities = self.predict_proba(texts)
        return np.argmax(probabilities, axis=1)
    
    def predict_proba(self, texts: List[str]) -> np.ndarray:
        """
        Get prediction probabilities.
        
        Args:
            texts: List of texts
            
        Returns:
            Prediction probabilities
        """
        if self.model is None:
            self._load_model()
        
        self.model.eval()
        
        # Create dataset
        dummy_labels = np.zeros(len(texts))
        dataset = FakeNewsDataset(
            texts, dummy_labels, self.tokenizer, self.max_length
        )
        loader = DataLoader(dataset, batch_size=self.batch_size)
        
        all_probs = []
        
        with torch.no_grad():
            for batch in loader:
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask
                )
                
                probs = torch.softmax(outputs.logits, dim=1)
                all_probs.append(probs.cpu().numpy())
        
        return np.vstack(all_probs)
    
    def evaluate(self, 
                 X_test: List[str], 
                 y_test: np.ndarray) -> Dict[str, Any]:
        """
        Evaluate model on test data.
        
        Args:
            X_test: Test texts
            y_test: True labels
            
        Returns:
            Evaluation metrics
        """
        from sklearn.metrics import (
            accuracy_score, precision_score, recall_score,
            f1_score, roc_auc_score, confusion_matrix,
            classification_report
        )
        
        predictions = self.predict(X_test)
        probabilities = self.predict_proba(X_test)
        
        metrics = {
            'accuracy': accuracy_score(y_test, predictions),
            'precision': precision_score(y_test, predictions, average='weighted'),
            'recall': recall_score(y_test, predictions, average='weighted'),
            'f1_score': f1_score(y_test, predictions, average='weighted'),
            'confusion_matrix': confusion_matrix(y_test, predictions)
        }
        
        if self.num_labels == 2:
            metrics['roc_auc'] = roc_auc_score(y_test, probabilities[:, 1])
        
        metrics['classification_report'] = classification_report(
            y_test, predictions, target_names=['Fake', 'Real']
        )
        
        return metrics
    
    def save(self, directory: str):
        """
        Save model and tokenizer.
        
        Args:
            directory: Directory to save to
        """
        os.makedirs(directory, exist_ok=True)
        self.model.save_pretrained(directory)
        self.tokenizer.save_pretrained(directory)
        print(f"Model saved to {directory}")
    
    def load(self, directory: str):
        """
        Load model and tokenizer.
        
        Args:
            directory: Directory to load from
        """
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        
        self.tokenizer = AutoTokenizer.from_pretrained(directory)
        self.model = AutoModelForSequenceClassification.from_pretrained(directory)
        self.model.to(self.device)
        self.is_trained = True
        print(f"Model loaded from {directory}")


if __name__ == "__main__":
    # Example usage (requires transformers and torch)
    print("BERT Classifier module loaded successfully.")
    print("To use, install: pip install transformers torch")

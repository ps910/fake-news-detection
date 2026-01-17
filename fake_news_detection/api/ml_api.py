"""
Flask API for Fake News Detection ML Model
Provides REST endpoints for news classification and explanation
"""

import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS  # type: ignore
import logging

# Add project paths
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, 'src'))

from pipeline import FakeNewsDetector  # type: ignore

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global detector instance
detector = None

def load_model():
    """Load the trained ML model."""
    global detector
    try:
        detector = FakeNewsDetector()
        model_path = os.path.join(project_root, 'models')
        detector.load(model_path)
        logger.info("✅ ML Model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        return False


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': detector is not None and detector.is_trained
    })


@app.route('/api/classify', methods=['POST'])
def classify_news():
    """
    Classify a news article as fake or real.
    
    Request body:
        {
            "text": "News article text to classify"
        }
    
    Returns:
        {
            "success": true,
            "prediction": "Fake" | "Real",
            "confidence": 0.95,
            "probabilities": {"Fake": 0.95, "Real": 0.05}
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: text'
            }), 400
        
        text = data['text'].strip()
        
        if len(text) < 10:
            return jsonify({
                'success': False,
                'error': 'Text must be at least 10 characters long'
            }), 400
        
        # Classify the text (no max length limit)
        result = detector.classify(text)
        
        return jsonify({
            'success': True,
            'prediction': result['prediction'],
            'confidence': round(result['confidence'], 4),
            'probabilities': {
                k: round(v, 4) for k, v in result['probabilities'].items()
            }
        })
    
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during classification'
        }), 500


@app.route('/api/explain', methods=['POST'])
def explain_prediction():
    """
    Classify and explain a news article prediction using LIME.
    
    Request body:
        {
            "text": "News article text to explain",
            "num_features": 10 (optional)
        }
    
    Returns:
        {
            "success": true,
            "prediction": "Fake" | "Real",
            "confidence": 0.95,
            "probabilities": {...},
            "explanation": [
                {"word": "shocking", "score": -0.45, "direction": "Fake"},
                ...
            ]
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: text'
            }), 400
        
        text = data['text'].strip()
        num_features = data.get('num_features', 10)
        
        if len(text) < 10:
            return jsonify({
                'success': False,
                'error': 'Text must be at least 10 characters long'
            }), 400
        
        # Get explanation
        result = detector.explain(text, num_features=num_features)
        
        # Format word importance
        explanation = []
        for word, score in result['word_importance']:
            explanation.append({
                'word': word,
                'score': round(score, 4),
                'direction': 'Real' if score > 0 else 'Fake'
            })
        
        return jsonify({
            'success': True,
            'prediction': result['predicted_class'],
            'confidence': round(result['confidence'], 4),
            'probabilities': {
                k: round(v, 4) for k, v in result['probabilities'].items()
            },
            'explanation': explanation
        })
    
    except Exception as e:
        logger.error(f"Explanation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during explanation'
        }), 500


@app.route('/api/batch-classify', methods=['POST'])
def batch_classify():
    """
    Classify multiple news articles.
    
    Request body:
        {
            "texts": ["Article 1", "Article 2", ...]
        }
    
    Returns:
        {
            "success": true,
            "results": [
                {"text": "...", "prediction": "Fake", "confidence": 0.95},
                ...
            ]
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: texts'
            }), 400
        
        texts = data['texts']
        
        if not isinstance(texts, list) or len(texts) == 0:
            return jsonify({
                'success': False,
                'error': 'texts must be a non-empty array'
            }), 400
        
        if len(texts) > 100:
            return jsonify({
                'success': False,
                'error': 'Maximum 100 articles per batch'
            }), 400
        
        results = []
        for text in texts:
            if isinstance(text, str) and len(text) >= 10:
                result = detector.classify(text)
                results.append({
                    'text': text[:100] + '...' if len(text) > 100 else text,
                    'prediction': result['prediction'],
                    'confidence': round(result['confidence'], 4)
                })
            else:
                results.append({
                    'text': str(text)[:100],
                    'prediction': None,
                    'confidence': None,
                    'error': 'Invalid or too short text'
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'total': len(results)
        })
    
    except Exception as e:
        logger.error(f"Batch classification error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during batch classification'
        }), 500


@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model."""
    try:
        return jsonify({
            'success': True,
            'model_type': detector.model_type if detector else None,
            'is_trained': detector.is_trained if detector else False,
            'classes': ['Real', 'Fake']
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    # Load model on startup
    if load_model():
        print("\n" + "="*50)
        print("🚀 Fake News Detection API")
        print("="*50)
        print("Server running at: http://localhost:5000")
        print("Endpoints:")
        print("  GET  /api/health       - Health check")
        print("  POST /api/classify     - Classify single article")
        print("  POST /api/explain      - Classify with LIME explanation")
        print("  POST /api/batch-classify - Classify multiple articles")
        print("  GET  /api/model-info   - Model information")
        print("="*50 + "\n")
        
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("❌ Failed to start API - Model not loaded")
        sys.exit(1)

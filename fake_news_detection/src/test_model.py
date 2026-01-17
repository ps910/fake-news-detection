"""
Quick test script for the trained fake news detector
"""
from pipeline import FakeNewsDetector

# Load trained model
print("Loading model...")
detector = FakeNewsDetector()
detector.load('../models')

# Test with examples
test_texts = [
    'BREAKING: Scientists reveal SHOCKING truth government is hiding from public!',
    'A new study published in Nature shows that climate change affects crop yields.',
    'You wont BELIEVE what this celebrity just confessed about the illuminati!',
    'The Federal Reserve announced a 0.25% interest rate increase citing inflation concerns.',
    'URGENT: This miracle cure they dont want you to know about!',
    'Reuters reports that the Senate passed a new bill on healthcare reform.',
    'EXCLUSIVE: Secret documents PROVE aliens exist and government knows!'
]

print('=' * 60)
print('FAKE NEWS DETECTION RESULTS')
print('=' * 60)

for text in test_texts:
    result = detector.classify(text)
    emoji = "❌ FAKE" if result['prediction'] == 'Fake' else "✅ REAL"
    print(f"\nText: {text[:70]}...")
    print(f"Prediction: {emoji}")
    print(f"Confidence: {result['confidence']:.1%}")
    print(f"  Real: {result['probabilities']['Real']:.1%} | Fake: {result['probabilities']['Fake']:.1%}")

print('\n' + '=' * 60)
print('EXPLANATION DEMO (LIME)')
print('=' * 60)

# Explain a prediction
text_to_explain = test_texts[0]
print(f"\nExplaining: {text_to_explain[:60]}...")
explanation = detector.explain(text_to_explain, num_features=8)

print(f"\nPrediction: {explanation['predicted_class']} ({explanation['confidence']:.1%})")
print("\nInfluential words:")
for word, score in explanation['word_importance']:
    direction = "→ Real" if score > 0 else "→ Fake"
    print(f"  '{word}': {score:+.4f} {direction}")

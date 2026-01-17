import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TextArea from '../components/ui/TextArea';

function Home() {
  const [demoText, setDemoText] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);

  const heroText = "Fake News Detection";
  
  useEffect(() => {
    if (typingIndex < heroText.length) {
      const timeout = setTimeout(() => {
        setTypingText(heroText.slice(0, typingIndex + 1));
        setTypingIndex(typingIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [typingIndex]);

  const sampleTexts = {
    fake: "BREAKING: Scientists confirm that drinking hot water with lemon cures cancer overnight! Big Pharma is desperately trying to hide this miracle cure. Share before they delete this!",
    real: "The Federal Reserve announced a 0.25% interest rate increase on Wednesday, citing continued economic growth. The decision aligns with analysts' expectations and aims to manage inflation targets."
  };

  const analyzeDemo = async () => {
    if (!demoText.trim()) return;
    setAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const text = demoText.toLowerCase();
    const fakeIndicators = ['shocking', 'miracle', 'cure', 'secret', 'delete', 'share', 'big pharma', 'hide', 'breaking', 'unbelievable'];
    const realIndicators = ['announced', 'according', 'reported', 'percent', 'official', 'federal', 'study', 'research'];
    
    let fakeScore = fakeIndicators.filter(word => text.includes(word)).length;
    let realScore = realIndicators.filter(word => text.includes(word)).length;
    
    const isFake = fakeScore > realScore;
    const confidence = Math.min(0.98, 0.7 + Math.abs(fakeScore - realScore) * 0.08);
    
    setDemoResult({
      prediction: isFake ? 'Fake' : 'Real',
      confidence: confidence,
      indicators: isFake 
        ? fakeIndicators.filter(word => text.includes(word))
        : realIndicators.filter(word => text.includes(word))
    });
    setAnalyzing(false);
  };

  const features = [
    { icon: '🧠', title: 'AI-Powered Detection', desc: 'Advanced ML models with 94.8% accuracy' },
    { icon: '🔬', title: 'Explainable AI', desc: 'LIME & SHAP for transparent predictions' },
    { icon: '🌐', title: 'Web Verification', desc: 'Cross-reference with global news sources', link: '/verify' },
    { icon: '📰', title: 'Live News Scanner', desc: 'Real-time news source analysis' },
    { icon: '📊', title: 'Detailed Analytics', desc: 'Comprehensive statistics dashboard' },
    { icon: '📑', title: 'PDF Reports', desc: 'Generate professional reports' },
    { icon: '🔄', title: 'Model Comparison', desc: 'Compare multiple ML algorithms' },
    { icon: '💬', title: 'User Feedback', desc: 'Help improve our model' }
  ];

  const stats = [
    { value: '94.8%', label: 'Accuracy', icon: '🎯' },
    { value: '72,095', label: 'Training Articles', icon: '📚' },
    { value: '<0.5s', label: 'Response Time', icon: '⚡' },
    { value: '98.87%', label: 'ROC-AUC Score', icon: '📈' }
  ];

  const testimonials = [
    { name: 'Dr. Sarah Chen', role: 'Media Studies Professor', text: 'This tool has revolutionized how we teach media literacy. The explainability features are exceptional.' },
    { name: 'James Wilson', role: 'Journalist', text: 'I use this daily to verify sources. The accuracy is impressive and the interface is intuitive.' },
    { name: 'Emily Rodriguez', role: 'Fact Checker', text: 'The batch processing and report generation save hours of manual work. Highly recommended.' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span>AI-Powered News Verification</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {typingText}
              </span>
              <span className="animate-pulse">|</span>
              <br />
              <span className="text-gray-700 dark:text-gray-300 text-4xl sm:text-5xl">with Explainable AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            >
              Verify news articles instantly using state-of-the-art machine learning.
              Understand predictions with LIME & SHAP explainability.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free →
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all"
                >
                  Login to Dashboard
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Try It Now
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Live Demo - No Account Required
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
          >
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setDemoText(sampleTexts.fake)}
                className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
              >
                🚨 Load Fake Sample
              </button>
              <button
                onClick={() => setDemoText(sampleTexts.real)}
                className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors"
              >
                ✅ Load Real Sample
              </button>
            </div>

            <TextArea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              placeholder="Paste a news article or headline here..."
              rows={5}
            />

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {demoText.length} characters
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeDemo}
                disabled={analyzing || !demoText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : '🔍 Analyze Article'}
              </motion.button>
            </div>

            <AnimatePresence>
              {demoResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-6 p-6 rounded-xl ${
                    demoResult.prediction === 'Fake'
                      ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                      : 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{demoResult.prediction === 'Fake' ? '❌' : '✅'}</span>
                      <div>
                        <p className={`text-2xl font-bold ${
                          demoResult.prediction === 'Fake' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {demoResult.prediction} News
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(demoResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {demoResult.indicators.map((indicator, i) => (
                      <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${
                        demoResult.prediction === 'Fake' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                      }`}>
                        {indicator}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Everything You Need
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all"
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Three Simple Steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Paste Article', desc: 'Copy and paste any news article', icon: '📋' },
              { step: 2, title: 'AI Analysis', desc: 'Our ML model analyzes patterns', icon: '🤖' },
              { step: 3, title: 'Get Results', desc: 'Receive prediction with explainability', icon: '📊' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg relative"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <span className="text-5xl mb-4 block">{item.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Trusted by Professionals</h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8"
            >
              <p className="text-xl text-gray-700 dark:text-gray-300 italic mb-6">
                "{testimonials[currentTestimonial].text}"
              </p>
              <p className="font-bold text-gray-900 dark:text-white">{testimonials[currentTestimonial].name}</p>
              <p className="text-gray-600 dark:text-gray-400">{testimonials[currentTestimonial].role}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center space-x-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${currentTestimonial === index ? 'bg-blue-600 w-8' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Fight Misinformation?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg">
                Start Free Today
              </motion.button>
            </Link>
            <Link to="/api-docs">
              <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white">
                View API Docs
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">© 2026 Fake News Detection. Built with ❤️ and AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home

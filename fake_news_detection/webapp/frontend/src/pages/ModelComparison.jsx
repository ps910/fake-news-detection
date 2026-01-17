import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { FadeIn, SlideUp, ScaleIn } from '../components/animations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function ModelComparison() {
  const [selectedModels, setSelectedModels] = useState(['logistic_regression', 'random_forest']);
  
  const models = [
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      icon: '📊',
      color: '#3B82F6',
      description: 'Linear model with high interpretability',
      metrics: {
        accuracy: 94.80,
        precision: 94.79,
        recall: 94.80,
        f1: 94.80,
        rocAuc: 98.87,
        trainTime: 2.3,
        inferenceTime: 0.5
      },
      pros: ['Fast training', 'Highly interpretable', 'Low memory usage'],
      cons: ['Limited to linear boundaries', 'May underfit complex data']
    },
    {
      id: 'random_forest',
      name: 'Random Forest',
      icon: '🌲',
      color: '#10B981',
      description: 'Ensemble of decision trees',
      metrics: {
        accuracy: 96.12,
        precision: 96.08,
        recall: 96.15,
        f1: 96.11,
        rocAuc: 99.21,
        trainTime: 45.8,
        inferenceTime: 2.1
      },
      pros: ['Handles non-linear data', 'Feature importance', 'Robust to outliers'],
      cons: ['Slower training', 'Less interpretable', 'Higher memory usage']
    },
    {
      id: 'xgboost',
      name: 'XGBoost',
      icon: '⚡',
      color: '#F59E0B',
      description: 'Gradient boosting framework',
      metrics: {
        accuracy: 96.85,
        precision: 96.82,
        recall: 96.88,
        f1: 96.85,
        rocAuc: 99.45,
        trainTime: 38.2,
        inferenceTime: 1.8
      },
      pros: ['State-of-the-art performance', 'Built-in regularization', 'Handles missing values'],
      cons: ['Complex hyperparameters', 'Longer training time', 'Prone to overfitting']
    },
    {
      id: 'naive_bayes',
      name: 'Naive Bayes',
      icon: '🎯',
      color: '#8B5CF6',
      description: 'Probabilistic classifier',
      metrics: {
        accuracy: 89.45,
        precision: 89.21,
        recall: 89.67,
        f1: 89.44,
        rocAuc: 95.23,
        trainTime: 0.8,
        inferenceTime: 0.2
      },
      pros: ['Extremely fast', 'Works well with small data', 'Good for text classification'],
      cons: ['Assumes feature independence', 'Lower accuracy', 'Sensitive to feature correlation']
    },
    {
      id: 'svm',
      name: 'Support Vector Machine',
      icon: '📐',
      color: '#EC4899',
      description: 'Maximum margin classifier',
      metrics: {
        accuracy: 93.67,
        precision: 93.54,
        recall: 93.78,
        f1: 93.66,
        rocAuc: 98.12,
        trainTime: 125.4,
        inferenceTime: 3.5
      },
      pros: ['Effective in high dimensions', 'Memory efficient', 'Versatile kernels'],
      cons: ['Very slow on large datasets', 'Requires feature scaling', 'No probability estimates']
    },
    {
      id: 'neural_network',
      name: 'Neural Network (MLP)',
      icon: '🧠',
      color: '#14B8A6',
      description: 'Multi-layer perceptron',
      metrics: {
        accuracy: 95.23,
        precision: 95.18,
        recall: 95.28,
        f1: 95.23,
        rocAuc: 98.92,
        trainTime: 89.6,
        inferenceTime: 1.2
      },
      pros: ['Captures complex patterns', 'Flexible architecture', 'Transfer learning ready'],
      cons: ['Requires more data', 'Black box model', 'Hyperparameter sensitive']
    }
  ];

  const toggleModel = (modelId) => {
    if (selectedModels.includes(modelId)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
      }
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  const getSelectedModels = () => models.filter(m => selectedModels.includes(m.id));

  const radarData = [
    { metric: 'Accuracy', fullMark: 100, ...Object.fromEntries(getSelectedModels().map(m => [m.name, m.metrics.accuracy])) },
    { metric: 'Precision', fullMark: 100, ...Object.fromEntries(getSelectedModels().map(m => [m.name, m.metrics.precision])) },
    { metric: 'Recall', fullMark: 100, ...Object.fromEntries(getSelectedModels().map(m => [m.name, m.metrics.recall])) },
    { metric: 'F1 Score', fullMark: 100, ...Object.fromEntries(getSelectedModels().map(m => [m.name, m.metrics.f1])) },
    { metric: 'ROC-AUC', fullMark: 100, ...Object.fromEntries(getSelectedModels().map(m => [m.name, m.metrics.rocAuc])) },
  ];

  const barData = getSelectedModels().map(m => ({
    name: m.name,
    accuracy: m.metrics.accuracy,
    precision: m.metrics.precision,
    recall: m.metrics.recall,
    f1: m.metrics.f1
  }));

  const timeData = getSelectedModels().map(m => ({
    name: m.name,
    'Training Time (s)': m.metrics.trainTime,
    'Inference Time (ms)': m.metrics.inferenceTime
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🔬 Model Comparison
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Compare different ML models for fake news detection
            </p>
          </div>
        </FadeIn>

        {/* Model Selection */}
        <SlideUp>
          <Card className="mb-8 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Select Models to Compare
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {models.map((model) => (
                <motion.button
                  key={model.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleModel(model.id)}
                  className={`p-4 rounded-xl text-center transition-all border-2 ${
                    selectedModels.includes(model.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{model.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {model.metrics.accuracy}% acc
                  </div>
                  {selectedModels.includes(model.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </Card>
        </SlideUp>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Radar
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[80, 100]} tick={{ fill: '#9CA3AF' }} />
                  {getSelectedModels().map((model) => (
                    <Radar
                      key={model.id}
                      name={model.name}
                      dataKey={model.name}
                      stroke={model.color}
                      fill={model.color}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>

          <ScaleIn>
            <Card className="dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Metrics Comparison
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[85, 100]} stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="precision" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recall" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="f1" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ScaleIn>
        </div>

        {/* Time Comparison */}
        <SlideUp>
          <Card className="mb-8 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Training & Inference Time
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="Training Time (s)" fill="#EF4444" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Inference Time (ms)" fill="#14B8A6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </SlideUp>

        {/* Detailed Comparison */}
        <SlideUp>
          <Card className="dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Detailed Model Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getSelectedModels().map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  style={{ borderTopColor: model.color, borderTopWidth: '4px' }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{model.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{model.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{model.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {Object.entries(model.metrics).slice(0, 5).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, value)}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className="h-2 rounded-full"
                              style={{ backgroundColor: model.color }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white w-14 text-right">
                            {value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✅ Pros</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {model.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">❌ Cons</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {model.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </SlideUp>

        {/* Recommendation */}
        <SlideUp>
          <Card className="mt-8 dark:bg-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">💡</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Recommendation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Based on the comparison, <strong>XGBoost</strong> offers the best overall performance with 96.85% accuracy 
                  and 99.45% ROC-AUC. However, if interpretability is important for your use case, 
                  <strong> Logistic Regression</strong> (currently deployed) provides excellent performance (94.80% accuracy) 
                  with full explainability through LIME and SHAP. For production systems requiring fast inference, 
                  <strong> Naive Bayes</strong> offers the fastest prediction times at 0.2ms per sample.
                </p>
              </div>
            </div>
          </Card>
        </SlideUp>
      </div>
    </div>
  );
}

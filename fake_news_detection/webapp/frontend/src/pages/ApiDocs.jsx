import { useState } from 'react';
import { motion } from 'framer-motion';
import { FadeIn, SlideUp } from '../components/animations';
import Card from '../components/ui/Card';

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  const sections = [
    { id: 'overview', name: 'Overview', icon: '📖' },
    { id: 'authentication', name: 'Authentication', icon: '🔐' },
    { id: 'classification', name: 'Classification', icon: '🔍' },
    { id: 'explainability', name: 'Explainability', icon: '🔬' },
    { id: 'user', name: 'User Management', icon: '👤' },
    { id: 'errors', name: 'Error Handling', icon: '⚠️' }
  ];

  const endpoints = {
    authentication: [
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user account',
        requestBody: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'securepassword123'
        },
        response: {
          success: true,
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: { id: '123', name: 'John Doe', email: 'john@example.com' }
        }
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate and get access token',
        requestBody: {
          email: 'john@example.com',
          password: 'securepassword123'
        },
        response: {
          success: true,
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: { id: '123', name: 'John Doe', email: 'john@example.com' }
        }
      }
    ],
    classification: [
      {
        method: 'POST',
        path: '/api/news/classify',
        description: 'Classify a news article as real or fake',
        auth: true,
        requestBody: {
          text: 'The Federal Reserve announced a rate increase today...'
        },
        response: {
          success: true,
          prediction: 'Real',
          confidence: 0.9245,
          probabilities: { real: 0.9245, fake: 0.0755 }
        }
      },
      {
        method: 'POST',
        path: '/api/news/batch',
        description: 'Classify multiple articles at once',
        auth: true,
        requestBody: {
          articles: [
            { id: 1, text: 'Article 1 content...' },
            { id: 2, text: 'Article 2 content...' }
          ]
        },
        response: {
          success: true,
          results: [
            { id: 1, prediction: 'Real', confidence: 0.89 },
            { id: 2, prediction: 'Fake', confidence: 0.92 }
          ]
        }
      },
      {
        method: 'GET',
        path: '/api/news/history',
        description: 'Get user classification history',
        auth: true,
        response: {
          success: true,
          history: [
            { id: '1', text: '...', prediction: 'Real', confidence: 0.89, createdAt: '2026-01-17T10:00:00Z' }
          ],
          total: 45,
          page: 1
        }
      }
    ],
    explainability: [
      {
        method: 'POST',
        path: '/api/news/explain',
        description: 'Get LIME/SHAP explanation for a prediction',
        auth: true,
        requestBody: {
          text: 'SHOCKING: Scientists discover miracle cure...',
          method: 'lime'
        },
        response: {
          success: true,
          prediction: 'Fake',
          confidence: 0.87,
          explanation: {
            method: 'lime',
            top_words: [
              { word: 'shocking', importance: -0.45, contribution: 'fake' },
              { word: 'miracle', importance: -0.38, contribution: 'fake' }
            ]
          }
        }
      }
    ],
    user: [
      {
        method: 'GET',
        path: '/api/user/profile',
        description: 'Get current user profile',
        auth: true,
        response: {
          success: true,
          user: { id: '123', name: 'John Doe', email: 'john@example.com', createdAt: '2026-01-01' }
        }
      },
      {
        method: 'GET',
        path: '/api/user/dashboard',
        description: 'Get dashboard statistics',
        auth: true,
        response: {
          success: true,
          stats: {
            totalClassifications: 156,
            realCount: 89,
            fakeCount: 67,
            avgConfidence: 87.3
          }
        }
      }
    ]
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-green-500';
      case 'POST': return 'bg-blue-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📚 API Documentation
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Complete reference for the Fake News Detection API
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded text-sm">
                v1.0.0
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded text-sm">
                OpenAPI 3.0
              </span>
            </div>
          </div>
        </FadeIn>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <SlideUp>
            <div className="lg:w-64 flex-shrink-0">
              <Card className="dark:bg-gray-800 sticky top-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sections</h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{section.icon}</span>
                      <span className="text-sm font-medium">{section.name}</span>
                    </button>
                  ))}
                </nav>
              </Card>
            </div>
          </SlideUp>

          {/* Main Content */}
          <div className="flex-1">
            <SlideUp delay={0.1}>
              {activeSection === 'overview' && (
                <Card className="dark:bg-gray-800 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    API Overview
                  </h2>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400">
                      The Fake News Detection API provides endpoints for classifying news articles
                      as real or fake using machine learning. The API supports both single article
                      classification and batch processing.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">
                      Base URL
                    </h3>
                    <code className="block p-3 bg-gray-900 dark:bg-gray-950 text-green-400 rounded-lg">
                      https://api.fakenewsdetector.com/v1
                    </code>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">
                      Rate Limits
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Free Tier</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">100 requests/day</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pro Tier</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">10,000 requests/day</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">
                      Quick Start
                    </h3>
                    <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-300">
{`curl -X POST https://api.fakenewsdetector.com/v1/news/classify \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your news article text here..."}'`}
                      </pre>
                    </div>
                  </div>
                </Card>
              )}

              {activeSection === 'authentication' && (
                <Card className="dark:bg-gray-800 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    🔐 Authentication
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    All API requests require authentication using a Bearer token. Obtain a token
                    by registering an account and logging in.
                  </p>

                  <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-400 mb-2">Authorization Header</p>
                    <code className="text-green-400">Authorization: Bearer your_jwt_token_here</code>
                  </div>

                  <div className="space-y-4">
                    {endpoints.authentication.map((endpoint, index) => (
                      <EndpointCard key={index} endpoint={endpoint} getMethodColor={getMethodColor} />
                    ))}
                  </div>
                </Card>
              )}

              {activeSection === 'classification' && (
                <Card className="dark:bg-gray-800 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    🔍 Classification Endpoints
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Endpoints for classifying news articles. Supports single article and batch processing.
                  </p>

                  <div className="space-y-4">
                    {endpoints.classification.map((endpoint, index) => (
                      <EndpointCard key={index} endpoint={endpoint} getMethodColor={getMethodColor} />
                    ))}
                  </div>
                </Card>
              )}

              {activeSection === 'explainability' && (
                <Card className="dark:bg-gray-800 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    🔬 Explainability Endpoints
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Get detailed explanations for predictions using LIME and SHAP algorithms.
                  </p>

                  <div className="space-y-4">
                    {endpoints.explainability.map((endpoint, index) => (
                      <EndpointCard key={index} endpoint={endpoint} getMethodColor={getMethodColor} />
                    ))}
                  </div>
                </Card>
              )}

              {activeSection === 'user' && (
                <Card className="dark:bg-gray-800 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    👤 User Management
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Endpoints for managing user profiles and retrieving statistics.
                  </p>

                  <div className="space-y-4">
                    {endpoints.user.map((endpoint, index) => (
                      <EndpointCard key={index} endpoint={endpoint} getMethodColor={getMethodColor} />
                    ))}
                  </div>
                </Card>
              )}

              {activeSection === 'errors' && (
                <Card className="dark:bg-gray-800 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    ⚠️ Error Handling
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The API uses standard HTTP status codes to indicate success or failure.
                  </p>

                  <div className="space-y-4">
                    {[
                      { code: 200, name: 'OK', desc: 'Request successful' },
                      { code: 201, name: 'Created', desc: 'Resource created successfully' },
                      { code: 400, name: 'Bad Request', desc: 'Invalid request body or parameters' },
                      { code: 401, name: 'Unauthorized', desc: 'Missing or invalid authentication' },
                      { code: 403, name: 'Forbidden', desc: 'Insufficient permissions' },
                      { code: 404, name: 'Not Found', desc: 'Resource not found' },
                      { code: 429, name: 'Too Many Requests', desc: 'Rate limit exceeded' },
                      { code: 500, name: 'Internal Server Error', desc: 'Server error' }
                    ].map((error) => (
                      <div key={error.code} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className={`px-3 py-1 rounded font-mono font-bold ${
                          error.code < 300 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                          error.code < 500 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                        }`}>
                          {error.code}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{error.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{error.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-4">
                    Error Response Format
                  </h3>
                  <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300">
{`{
  "success": false,
  "error": {
    "code": "INVALID_TEXT",
    "message": "Article text is required and must be at least 50 characters",
    "details": {
      "field": "text",
      "minLength": 50
    }
  }
}`}
                    </pre>
                  </div>
                </Card>
              )}
            </SlideUp>
          </div>
        </div>
      </div>
    </div>
  );
}

function EndpointCard({ endpoint, getMethodColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      initial={false}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded text-white text-sm font-bold ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </span>
          <code className="text-gray-900 dark:text-white font-mono">{endpoint.path}</code>
          {endpoint.auth && (
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-xs rounded">
              🔐 Auth
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">{endpoint.description}</p>

          {endpoint.requestBody && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Request Body</h4>
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-3 overflow-x-auto">
                <pre className="text-sm text-green-400">
                  {JSON.stringify(endpoint.requestBody, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Response</h4>
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-3 overflow-x-auto">
              <pre className="text-sm text-blue-400">
                {JSON.stringify(endpoint.response, null, 2)}
              </pre>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

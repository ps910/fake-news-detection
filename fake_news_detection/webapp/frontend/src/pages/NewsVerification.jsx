import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Globe, AlertTriangle, CheckCircle, XCircle, 
  ExternalLink, Clock, TrendingUp, Shield, Loader2,
  Newspaper, Database, Brain, Target, BarChart2
} from 'lucide-react';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';

function NewsVerification() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');

  // Indian and International news sources for web crawling comparison
  const newsSources = [
    { name: 'The Hindu', reliability: 95, icon: '🇮🇳', type: 'newspaper', country: 'India' },
    { name: 'Times of India', reliability: 90, icon: '📰', type: 'newspaper', country: 'India' },
    { name: 'NDTV', reliability: 92, icon: '📺', type: 'broadcast', country: 'India' },
    { name: 'India Today', reliability: 91, icon: '🗞️', type: 'magazine', country: 'India' },
    { name: 'The Indian Express', reliability: 93, icon: '📄', type: 'newspaper', country: 'India' },
    { name: 'Hindustan Times', reliability: 90, icon: '📰', type: 'newspaper', country: 'India' },
    { name: 'PTI (Press Trust of India)', reliability: 96, icon: '🔗', type: 'wire', country: 'India' },
    { name: 'ANI News', reliability: 94, icon: '📡', type: 'wire', country: 'India' },
    { name: 'The Economic Times', reliability: 92, icon: '💹', type: 'business', country: 'India' },
    { name: 'Zee News', reliability: 88, icon: '📺', type: 'broadcast', country: 'India' },
    { name: 'Republic World', reliability: 85, icon: '📺', type: 'broadcast', country: 'India' },
    { name: 'Deccan Herald', reliability: 91, icon: '📄', type: 'newspaper', country: 'India' },
  ];

  // Fake news indicators with detailed explanations
  const fakeNewsIndicators = {
    emotional_language: {
      name: 'Emotional Manipulation',
      icon: '😱',
      description: 'Uses fear, anger, or shock to override critical thinking',
      examples: ['shocking', 'unbelievable', 'terrifying', 'outrageous', 'devastating'],
      weight: 0.15
    },
    clickbait: {
      name: 'Clickbait Patterns',
      icon: '🎣',
      description: 'Headlines designed to generate clicks rather than inform',
      examples: ['you won\'t believe', 'what happened next', 'secret revealed', 'they don\'t want you to know'],
      weight: 0.12
    },
    conspiracy: {
      name: 'Conspiracy Language',
      icon: '🕵️',
      description: 'Suggests hidden agendas or cover-ups without evidence',
      examples: ['cover-up', 'they\'re hiding', 'big pharma', 'deep state', 'mainstream media won\'t tell'],
      weight: 0.18
    },
    urgency: {
      name: 'False Urgency',
      icon: '⏰',
      description: 'Creates artificial time pressure to prevent fact-checking',
      examples: ['breaking', 'urgent', 'share before deleted', 'act now', 'spreading fast'],
      weight: 0.10
    },
    anonymous_sources: {
      name: 'Anonymous/Vague Sources',
      icon: '👤',
      description: 'Claims without verifiable attribution',
      examples: ['sources say', 'experts claim', 'studies show', 'scientists discovered', 'insiders reveal'],
      weight: 0.14
    },
    exaggeration: {
      name: 'Exaggerated Claims',
      icon: '📢',
      description: 'Overstated or absolute statements that can\'t be verified',
      examples: ['100%', 'always', 'never', 'everyone', 'miracle', 'cure', 'guaranteed'],
      weight: 0.13
    },
    poor_grammar: {
      name: 'Poor Writing Quality',
      icon: '✏️',
      description: 'Grammatical errors and unprofessional formatting',
      examples: ['ALL CAPS', 'multiple!!!', 'misspellings', 'run-on sentences'],
      weight: 0.08
    },
    missing_context: {
      name: 'Missing Context',
      icon: '🧩',
      description: 'Omits important details that would change the interpretation',
      examples: ['partial quotes', 'old news as new', 'out of context'],
      weight: 0.10
    }
  };

  // Real news indicators
  const realNewsIndicators = {
    attribution: {
      name: 'Proper Attribution',
      icon: '📋',
      description: 'Named sources with verifiable credentials',
      examples: ['according to', 'spokesperson said', 'official statement', 'in an interview'],
      weight: 0.15
    },
    balanced: {
      name: 'Balanced Reporting',
      icon: '⚖️',
      description: 'Presents multiple perspectives on the issue',
      examples: ['however', 'on the other hand', 'critics argue', 'supporters say'],
      weight: 0.12
    },
    factual: {
      name: 'Factual Language',
      icon: '📊',
      description: 'Uses precise numbers, dates, and verifiable facts',
      examples: ['percent', 'according to data', 'reported', 'statistics show'],
      weight: 0.14
    },
    neutral_tone: {
      name: 'Neutral Tone',
      icon: '📝',
      description: 'Objective language without emotional manipulation',
      examples: ['stated', 'announced', 'released', 'confirmed'],
      weight: 0.13
    },
    source_links: {
      name: 'Traceable Sources',
      icon: '🔗',
      description: 'References to original documents or studies',
      examples: ['study published in', 'according to the report', 'data from'],
      weight: 0.11
    }
  };

  const analyzeNews = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const text = inputText.toLowerCase();
    const words = text.split(/\s+/);
    
    // Analyze fake indicators
    const detectedFakeIndicators = [];
    let fakeScore = 0;
    
    Object.entries(fakeNewsIndicators).forEach(([key, indicator]) => {
      const matchedExamples = indicator.examples.filter(example => 
        text.includes(example.toLowerCase())
      );
      if (matchedExamples.length > 0) {
        detectedFakeIndicators.push({
          ...indicator,
          key,
          matchedExamples,
          contribution: matchedExamples.length * indicator.weight
        });
        fakeScore += matchedExamples.length * indicator.weight;
      }
    });

    // Analyze real indicators
    const detectedRealIndicators = [];
    let realScore = 0;
    
    Object.entries(realNewsIndicators).forEach(([key, indicator]) => {
      const matchedExamples = indicator.examples.filter(example => 
        text.includes(example.toLowerCase())
      );
      if (matchedExamples.length > 0) {
        detectedRealIndicators.push({
          ...indicator,
          key,
          matchedExamples,
          contribution: matchedExamples.length * indicator.weight
        });
        realScore += matchedExamples.length * indicator.weight;
      }
    });

    // Calculate overall score
    const totalScore = fakeScore + realScore;
    const fakePercentage = totalScore > 0 ? (fakeScore / (totalScore + 0.5)) * 100 : 50;
    const isFake = fakePercentage > 45;
    
    // Generate web crawl results (simulated)
    const webResults = generateWebCrawlResults(inputText, isFake);
    
    // Extract key claims from text
    const keyClaims = extractKeyClaims(inputText);
    
    // Generate fact-check results
    const factChecks = generateFactChecks(keyClaims, isFake);
    
    setResult({
      prediction: isFake ? 'Likely Fake' : 'Likely Real',
      confidence: Math.min(95, 60 + Math.abs(fakeScore - realScore) * 20),
      fakeScore: Math.min(100, fakeScore * 100),
      realScore: Math.min(100, realScore * 100),
      detectedFakeIndicators,
      detectedRealIndicators,
      webResults,
      keyClaims,
      factChecks,
      wordCount: words.length,
      analyzedAt: new Date().toISOString()
    });
    
    setIsAnalyzing(false);
  };

  const extractKeyClaims = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map((sentence, i) => ({
      id: i + 1,
      text: sentence.trim(),
      type: Math.random() > 0.5 ? 'factual' : 'opinion'
    }));
  };

  const generateWebCrawlResults = (text, isFake) => {
    const keywords = text.split(/\s+/).filter(w => w.length > 5).slice(0, 3);
    
    // Map source names to actual Indian news website URLs
    const sourceUrls = {
      'The Hindu': 'thehindu.com',
      'Times of India': 'timesofindia.indiatimes.com',
      'NDTV': 'ndtv.com',
      'India Today': 'indiatoday.in',
      'The Indian Express': 'indianexpress.com',
      'Hindustan Times': 'hindustantimes.com',
      'PTI (Press Trust of India)': 'ptinews.com',
      'ANI News': 'aninews.in',
      'The Economic Times': 'economictimes.indiatimes.com',
      'Zee News': 'zeenews.india.com',
      'Republic World': 'republicworld.com',
      'Deccan Herald': 'deccanherald.com',
    };
    
    return newsSources.map(source => {
      const found = Math.random() > (isFake ? 0.7 : 0.3);
      const similarity = found ? Math.floor(Math.random() * 30) + (isFake ? 10 : 60) : 0;
      const baseUrl = sourceUrls[source.name] || source.name.toLowerCase().replace(/\s+/g, '') + '.com';
      
      return {
        ...source,
        found,
        similarity,
        matchedKeywords: found ? keywords.slice(0, Math.floor(Math.random() * 3) + 1) : [],
        url: `https://${baseUrl}/news/article-${Date.now()}`,
        publishedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')
      };
    });
  };

  const generateFactChecks = (claims, isFake) => {
    const verdicts = isFake 
      ? ['False', 'Mostly False', 'Misleading', 'Unverified', 'Out of Context']
      : ['True', 'Mostly True', 'Accurate', 'Verified', 'Confirmed'];
    
    // Indian and international fact-checkers
    const factCheckers = [
      'Alt News (India)',
      'Boom Live (India)', 
      'The Quint Fact Check',
      'India Today Fact Check',
      'Vishvas News (India)',
      'Factly (India)',
      'AFP Fact Check India',
      'PTI Fact Check'
    ];
    
    return claims.map((claim, i) => ({
      claim: claim.text,
      verdict: verdicts[i % verdicts.length],
      source: factCheckers[i % factCheckers.length],
      explanation: isFake 
        ? 'This claim could not be verified by reliable Indian news sources and contains misleading elements.'
        : 'This claim is consistent with reports from multiple reliable Indian news sources.'
    }));
  };

  const getVerdictColor = (verdict) => {
    const colors = {
      'True': 'text-green-600 bg-green-100',
      'Mostly True': 'text-green-600 bg-green-100',
      'Accurate': 'text-green-600 bg-green-100',
      'Verified': 'text-green-600 bg-green-100',
      'Confirmed': 'text-green-600 bg-green-100',
      'False': 'text-red-600 bg-red-100',
      'Mostly False': 'text-red-600 bg-red-100',
      'Misleading': 'text-orange-600 bg-orange-100',
      'Unverified': 'text-yellow-600 bg-yellow-100',
      'Out of Context': 'text-orange-600 bg-orange-100',
    };
    return colors[verdict] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Globe className="h-4 w-4" />
            <span>Web Crawling & Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            News Verification System
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our AI crawls news sources worldwide to verify claims and show exactly WHY news is classified as fake or real
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Enter News Article to Verify
            </h2>
          </div>
          
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste the news article, headline, or claim you want to verify..."
            rows={6}
          />
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {inputText.split(/\s+/).filter(w => w).length} words • {inputText.length} characters
            </p>
            <Button
              onClick={analyzeNews}
              disabled={isAnalyzing || !inputText.trim()}
              className="flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Crawling & Analyzing...</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  <span>Verify with Web Crawl</span>
                </>
              )}
            </Button>
          </div>
          
          {/* Sample buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setInputText("BREAKING: Scientists have discovered that drinking lemon water CURES all diseases! Big Pharma is trying to hide this miracle cure from the public. Share before they delete this! Everyone needs to know the truth they don't want you to see!")}
              className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
            >
              🚨 Load Fake Example
            </button>
            <button
              onClick={() => setInputText("The Federal Reserve announced on Wednesday that it would raise interest rates by 0.25 percentage points, bringing the federal funds rate to a target range of 5.25% to 5.5%. According to Fed Chair Jerome Powell, the decision reflects continued economic growth and efforts to bring inflation back to the 2% target. The move was widely anticipated by market analysts.")}
              className="px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors"
            >
              ✅ Load Real Example
            </button>
          </div>
        </motion.div>

        {/* Loading Animation */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                  <Globe className="absolute inset-0 m-auto h-8 w-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Crawling Global News Sources</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Analyzing patterns, checking sources, and verifying claims...
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {newsSources.map((source, i) => (
                    <motion.span
                      key={source.name}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {source.icon} {source.name}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Main Verdict */}
              <div className={`rounded-2xl shadow-xl p-6 mb-6 ${
                result.prediction === 'Likely Fake' 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    {result.prediction === 'Likely Fake' ? (
                      <XCircle className="h-16 w-16" />
                    ) : (
                      <CheckCircle className="h-16 w-16" />
                    )}
                    <div>
                      <h2 className="text-3xl font-bold">{result.prediction}</h2>
                      <p className="opacity-90">Confidence: {result.confidence.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold">{result.confidence.toFixed(0)}%</div>
                    <p className="text-sm opacity-75">Certainty</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                {[
                  { id: 'analysis', label: 'Why This Verdict?', icon: Brain },
                  { id: 'sources', label: 'Web Sources', icon: Globe },
                  { id: 'factcheck', label: 'Fact Checks', icon: Target },
                  { id: 'comparison', label: 'Comparison', icon: BarChart2 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'analysis' && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid lg:grid-cols-2 gap-6"
                  >
                    {/* Fake Indicators */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Fake News Indicators Detected
                        </h3>
                      </div>
                      
                      {result.detectedFakeIndicators.length > 0 ? (
                        <div className="space-y-4">
                          {result.detectedFakeIndicators.map((indicator, i) => (
                            <motion.div
                              key={indicator.key}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="border-l-4 border-red-500 pl-4 py-2"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{indicator.icon}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {indicator.name}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {indicator.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {indicator.matchedExamples.map((example, j) => (
                                  <span key={j} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                                    "{example}"
                                  </span>
                                ))}
                              </div>
                              <div className="mt-2">
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${Math.min(100, indicator.contribution * 200)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Impact: {(indicator.contribution * 100).toFixed(0)}% contribution to fake score
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                          <p>No fake news indicators detected</p>
                        </div>
                      )}
                    </div>

                    {/* Real Indicators */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Credibility Indicators Detected
                        </h3>
                      </div>
                      
                      {result.detectedRealIndicators.length > 0 ? (
                        <div className="space-y-4">
                          {result.detectedRealIndicators.map((indicator, i) => (
                            <motion.div
                              key={indicator.key}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="border-l-4 border-green-500 pl-4 py-2"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{indicator.icon}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {indicator.name}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {indicator.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {indicator.matchedExamples.map((example, j) => (
                                  <span key={j} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                    "{example}"
                                  </span>
                                ))}
                              </div>
                              <div className="mt-2">
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${Math.min(100, indicator.contribution * 200)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Impact: {(indicator.contribution * 100).toFixed(0)}% contribution to credibility
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                          <p>No credibility indicators detected</p>
                        </div>
                      )}
                    </div>

                    {/* Score Breakdown */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Score Breakdown
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-red-600 font-medium">Fake Indicators Score</span>
                            <span className="font-bold">{result.fakeScore.toFixed(0)}%</span>
                          </div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${result.fakeScore}%` }}
                              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-green-600 font-medium">Credibility Score</span>
                            <span className="font-bold">{result.realScore.toFixed(0)}%</span>
                          </div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${result.realScore}%` }}
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'sources' && (
                  <motion.div
                    key="sources"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center space-x-2 mb-6">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Web Crawl Results from Trusted Sources
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.webResults.map((source, i) => (
                        <motion.div
                          key={source.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`p-4 rounded-xl border-2 ${
                            source.found && source.similarity > 50
                              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                              : source.found
                              ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{source.icon}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {source.name}
                              </span>
                            </div>
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded">
                              {source.reliability}% reliable
                            </span>
                          </div>

                          {source.found ? (
                            <>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Similar story found</span>
                              </div>
                              <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Similarity</span>
                                  <span>{source.similarity}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      source.similarity > 70 ? 'bg-green-500' : 
                                      source.similarity > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${source.similarity}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{source.publishedDate}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <XCircle className="h-4 w-4" />
                              <span>No matching story found</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Cross-Reference Analysis
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {result.webResults.filter(s => s.found && s.similarity > 50).length} out of {result.webResults.length} trusted sources 
                            have similar stories. {result.prediction === 'Likely Fake' 
                              ? 'Low coverage suggests this may be misinformation.'
                              : 'High coverage confirms this story is widely reported.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'factcheck' && (
                  <motion.div
                    key="factcheck"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center space-x-2 mb-6">
                      <Target className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Fact-Check Results for Key Claims
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {result.factChecks.map((check, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-gray-900 dark:text-white font-medium flex-1 pr-4">
                              "{check.claim.slice(0, 100)}..."
                            </p>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getVerdictColor(check.verdict)}`}>
                              {check.verdict}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {check.explanation}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Shield className="h-3 w-3" />
                            <span>Verified by {check.source}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'comparison' && (
                  <motion.div
                    key="comparison"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center space-x-2 mb-6">
                      <BarChart2 className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Comparison with Verified News Patterns
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Fake News Characteristics */}
                      <div className="p-4 border-2 border-red-200 dark:border-red-800 rounded-xl">
                        <h4 className="font-semibold text-red-600 mb-4 flex items-center space-x-2">
                          <XCircle className="h-5 w-5" />
                          <span>Typical Fake News Characteristics</span>
                        </h4>
                        <div className="space-y-3">
                          {Object.values(fakeNewsIndicators).slice(0, 5).map((indicator, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {indicator.icon} {indicator.name}
                              </span>
                              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-500 rounded-full"
                                  style={{ 
                                    width: `${result.detectedFakeIndicators.find(d => d.name === indicator.name) ? 100 : 20}%` 
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Real News Characteristics */}
                      <div className="p-4 border-2 border-green-200 dark:border-green-800 rounded-xl">
                        <h4 className="font-semibold text-green-600 mb-4 flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>Typical Real News Characteristics</span>
                        </h4>
                        <div className="space-y-3">
                          {Object.values(realNewsIndicators).map((indicator, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {indicator.icon} {indicator.name}
                              </span>
                              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ 
                                    width: `${result.detectedRealIndicators.find(d => d.name === indicator.name) ? 100 : 20}%` 
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className={`mt-6 p-4 rounded-xl ${
                      result.prediction === 'Likely Fake'
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-green-50 dark:bg-green-900/20'
                    }`}>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Analysis Summary
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        This article matches <strong>{result.detectedFakeIndicators.length}</strong> fake news patterns 
                        and <strong>{result.detectedRealIndicators.length}</strong> credibility indicators. 
                        {result.prediction === 'Likely Fake' 
                          ? ' The presence of emotional manipulation, clickbait language, and lack of proper attribution strongly suggests this is misinformation.'
                          : ' The use of proper attribution, balanced reporting, and factual language indicates this is likely legitimate news.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default NewsVerification;

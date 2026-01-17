import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FadeIn, SlideUp, ScaleIn } from '../components/animations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';

export default function WordCloud() {
  const [text, setText] = useState('');
  const [wordData, setWordData] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const sampleTexts = {
    fake: "SHOCKING BREAKING NEWS! Scientists discover miracle cure that doctors don't want you to know! This amazing secret remedy has been hidden by big pharma for years. Share before they delete this! Unbelievable results guaranteed or your money back. Act now, limited time offer!",
    real: "The Federal Reserve announced Wednesday that it will maintain current interest rates, citing stable economic indicators. According to official reports, unemployment remains at 3.7%, while inflation has decreased to 2.1%. Economists expect moderate growth in the upcoming quarter."
  };

  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'us',
    'our', 'you', 'your', 'he', 'she', 'him', 'her', 'his', 'i', 'my', 'me'
  ]);

  const fakeIndicators = [
    'shocking', 'breaking', 'miracle', 'secret', 'hidden', 'amazing', 'unbelievable',
    'guaranteed', 'urgent', 'exclusive', 'exposed', 'banned', 'doctors', 'pharma',
    'cure', 'trick', 'hack', 'delete', 'share', 'viral', 'conspiracy', 'truth'
  ];

  const realIndicators = [
    'according', 'reported', 'announced', 'official', 'government', 'study', 'research',
    'percent', 'data', 'statistics', 'analysis', 'experts', 'committee', 'statement',
    'quarterly', 'annual', 'economic', 'policy', 'legislation', 'congress', 'senate'
  ];

  const analyzeText = () => {
    if (!text.trim()) return;
    setLoading(true);

    setTimeout(() => {
      // Tokenize and count words
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

      const wordCount = {};
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      // Generate word data with sentiment
      const data = Object.entries(wordCount)
        .map(([word, count]) => {
          let type = 'neutral';
          if (fakeIndicators.includes(word)) type = 'fake';
          if (realIndicators.includes(word)) type = 'real';
          
          return {
            word,
            count,
            type,
            size: Math.min(60, 16 + count * 8),
            color: type === 'fake' ? '#EF4444' : type === 'real' ? '#10B981' : '#6B7280'
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      setWordData(data);
      setLoading(false);
    }, 1000);
  };

  const getStats = () => {
    const fakeWords = wordData.filter(w => w.type === 'fake');
    const realWords = wordData.filter(w => w.type === 'real');
    const neutralWords = wordData.filter(w => w.type === 'neutral');
    
    const fakeCount = fakeWords.reduce((sum, w) => sum + w.count, 0);
    const realCount = realWords.reduce((sum, w) => sum + w.count, 0);
    
    return {
      totalWords: wordData.reduce((sum, w) => sum + w.count, 0),
      uniqueWords: wordData.length,
      fakeIndicators: fakeWords.length,
      realIndicators: realWords.length,
      fakeScore: fakeCount,
      realScore: realCount,
      prediction: fakeCount > realCount ? 'Likely Fake' : 'Likely Real',
      confidence: Math.abs(fakeCount - realCount) / (fakeCount + realCount + 1) * 100
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ☁️ Word Cloud Analysis
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Visualize word frequency and identify fake news indicators
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <SlideUp>
            <Card className="dark:bg-gray-800 h-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Enter Text to Analyze
              </h2>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setText(sampleTexts.fake)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 rounded-full hover:bg-red-200"
                >
                  Load Fake Sample
                </button>
                <button
                  onClick={() => setText(sampleTexts.real)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 rounded-full hover:bg-green-200"
                >
                  Load Real Sample
                </button>
              </div>

              <TextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a news article to generate word cloud..."
                rows={10}
              />

              <Button
                onClick={analyzeText}
                disabled={loading || !text.trim()}
                className="w-full mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '☁️ Generate Word Cloud'
                )}
              </Button>

              {/* Legend */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Legend</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fake News Indicator</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Real News Indicator</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-gray-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Neutral</span>
                  </div>
                </div>
              </div>
            </Card>
          </SlideUp>

          {/* Word Cloud Visualization */}
          <SlideUp delay={0.1}>
            <Card className="dark:bg-gray-800 h-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Word Cloud
              </h2>

              {wordData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">☁️</span>
                    <p>Enter text and click generate to see word cloud</p>
                  </div>
                </div>
              ) : (
                <div className="min-h-[320px] p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex flex-wrap items-center justify-center gap-2">
                  {wordData.map((item, index) => (
                    <motion.span
                      key={item.word}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02, type: 'spring' }}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        fontSize: `${item.size}px`,
                        color: item.color,
                        fontWeight: item.count > 2 ? 'bold' : 'normal'
                      }}
                      title={`${item.word}: ${item.count} occurrences (${item.type})`}
                    >
                      {item.word}
                    </motion.span>
                  ))}
                </div>
              )}
            </Card>
          </SlideUp>
        </div>

        {/* Statistics */}
        {wordData.length > 0 && (
          <SlideUp delay={0.2}>
            <Card className="mt-8 dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Analysis Results
              </h2>

              {(() => {
                const stats = getStats();
                return (
                  <>
                    {/* Prediction Banner */}
                    <div className={`p-4 rounded-lg mb-6 ${
                      stats.prediction === 'Likely Fake'
                        ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800'
                        : 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Word Analysis Prediction</p>
                          <p className={`text-2xl font-bold ${
                            stats.prediction === 'Likely Fake' ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                          }`}>
                            {stats.prediction === 'Likely Fake' ? '⚠️' : '✅'} {stats.prediction}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.confidence.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalWords}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Words</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.uniqueWords}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Unique Words</p>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.fakeIndicators}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fake Indicators</p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.realIndicators}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Real Indicators</p>
                      </div>
                    </div>

                    {/* Top Words */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                          ⚠️ Fake News Indicators Found
                        </h3>
                        <div className="space-y-2">
                          {wordData.filter(w => w.type === 'fake').slice(0, 5).map(word => (
                            <div key={word.word} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                              <span className="text-red-700 dark:text-red-400 font-medium">{word.word}</span>
                              <span className="text-sm text-gray-500">{word.count}x</span>
                            </div>
                          ))}
                          {wordData.filter(w => w.type === 'fake').length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No fake indicators found</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                          ✅ Real News Indicators Found
                        </h3>
                        <div className="space-y-2">
                          {wordData.filter(w => w.type === 'real').slice(0, 5).map(word => (
                            <div key={word.word} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                              <span className="text-green-700 dark:text-green-400 font-medium">{word.word}</span>
                              <span className="text-sm text-gray-500">{word.count}x</span>
                            </div>
                          ))}
                          {wordData.filter(w => w.type === 'real').length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No real indicators found</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          📊 Most Frequent Words
                        </h3>
                        <div className="space-y-2">
                          {wordData.slice(0, 5).map(word => (
                            <div key={word.word} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{word.word}</span>
                              <span className="text-sm text-gray-500">{word.count}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </Card>
          </SlideUp>
        )}
      </div>
    </div>
  );
}

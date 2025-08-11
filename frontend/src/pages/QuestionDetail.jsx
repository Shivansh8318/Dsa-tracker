import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Tag,
  Plus,
  Clock,
  Globe,
  Copy,
  BookOpen,
  CheckCircle,
  Target,
  Brain,
  History,
  Lightbulb,
  Code2
} from 'lucide-react';
import { questionsAPI } from '../services/api';
import { formatDate, getDifficultyBadgeClasses } from '../utils/helpers';
import toast from 'react-hot-toast';

// Simple but effective C++ syntax highlighting
const highlightCppCode = (code) => {
  if (!code) return code;
  
  // Use C-like language as fallback (which should be available)
  try {
    // Try to use JavaScript highlighting as it shares many similarities
    if (Prism.languages.javascript) {
      return Prism.highlight(code, Prism.languages.javascript, 'javascript');
    }
  } catch (error) {
    console.error('Prism highlighting error:', error);
  }
  
  // Manual highlighting as fallback
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Apply custom highlighting
  highlighted = highlighted
    // Comments
    .replace(/\/\/.*$/gm, '<span class="text-gray-400 italic">$&</span>')
    .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-400 italic">$&</span>')
    // Strings
    .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="text-yellow-300">"$1"</span>')
    .replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '<span class="text-yellow-300">\'$1\'</span>')
    // Preprocessor
    .replace(/#(include|define|ifdef|ifndef|endif|pragma)\b/g, '<span class="text-orange-400">#$1</span>')
    // Keywords
    .replace(/\b(int|double|float|char|string|bool|void|return|if|else|for|while|do|switch|case|break|continue|class|public|private|protected|virtual|static|const|namespace|using|iostream|vector|map|set|unordered_map|unordered_set|queue|stack|priority_queue|deque|list|pair|auto|long|short|unsigned|signed|size_t|nullptr|true|false)\b/g, '<span class="text-purple-400 font-bold">$1</span>')
    // Numbers
    .replace(/\b\d+\b/g, '<span class="text-green-400 font-semibold">$&</span>')
    // Function calls
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="text-blue-400 font-semibold">$1</span>(')
    // Operators
    .replace(/(\+\+|--|&lt;&lt;|&gt;&gt;|==|!=|&lt;=|&gt;=|&amp;&amp;|\|\||->|\+=|-=|\*=|\/=|[+\-*/%=!&|^~])/g, '<span class="text-pink-400 font-semibold">$1</span>')
    // Brackets
    .replace(/([{}()\[\]])/g, '<span class="text-cyan-400">$1</span>');
  
  return highlighted;
};

function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getById(id);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      if (error.response?.status === 404) {
        toast.error('Question not found');
        navigate('/questions');
      } else {
        toast.error('Failed to load question');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      await questionsAPI.delete(id);
      toast.success('Question deleted successfully');
      navigate('/questions');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const copyCodeToClipboard = async () => {
    if (question.code) {
      try {
        await navigator.clipboard.writeText(question.code);
        setCopiedCode(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        toast.error('Failed to copy code');
      }
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Medium': return <Target className="h-5 w-5 text-yellow-500" />;
      case 'Hard': return <Lightbulb className="h-5 w-5 text-red-500" />;
      default: return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Question not found</h3>
          <p className="text-gray-500 mb-6">The question you're looking for doesn't exist or has been deleted.</p>
          <Link to="/questions" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Header Card */}
        <div className="card-elevated p-8 fade-in">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{question.title}</h1>
                {question.link && (
                  <a
                    href={question.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Open problem link"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Difficulty */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    {getDifficultyIcon(question.difficulty)}
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Difficulty</p>
                      <p className={`font-bold text-lg ${
                        question.difficulty === 'Easy' ? 'text-green-600' :
                        question.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {question.difficulty}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Source */}
                {question.source && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Source</p>
                        <p className="font-bold text-lg text-blue-600">{question.source}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date Solved */}
                {question.dateSolved && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Solved</p>
                        <p className="font-bold text-lg text-green-600">{formatDate(question.dateSolved)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Topics */}
              {question.topics.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {question.topics.map(topic => (
                      <Link
                        key={topic}
                        to={`/topics/${encodeURIComponent(topic)}`}
                        className="topic-tag hover:scale-105 transform transition-all"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    <Tag className="h-4 w-4 text-gray-400 mr-1" />
                    {question.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 lg:ml-6">
              <Link
                to={`/questions/${question.id}/edit`}
                className="btn btn-secondary btn-sm"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="btn btn-danger btn-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Code Solution */}
        {question.code && (
          <div className="card-elevated p-8 slide-up bg-gradient-to-br from-slate-50 to-indigo-50 border border-indigo-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <Code2 className="h-7 w-7 text-white" />
                </div>
                Solution Code
              </h2>
              <button
                onClick={copyCodeToClipboard}
                className={`btn text-white border-0 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                  copiedCode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            
            {/* LeetCode-style code container */}
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              {/* Header with language label */}
              <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 px-6 py-4 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                    </div>
                    <span className="text-gray-300 font-medium">Solution.cpp</span>
                  </div>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-lg">
                    C++
                  </span>
                </div>
              </div>
              
              {/* Code block with enhanced styling */}
              <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative">
                <div className="p-6 overflow-x-auto">
                  <pre 
                    className="cpp-code font-mono text-sm leading-relaxed" 
                    style={{ background: 'transparent', margin: 0, padding: 0 }}
                  >
                    <code 
                      className="cpp-code-block block"
                      dangerouslySetInnerHTML={{
                        __html: highlightCppCode(question.code)
                      }}
                      style={{ 
                        background: 'transparent',
                        color: '#e2e8f0',
                        lineHeight: '1.6'
                      }}
                    />
                  </pre>
                </div>
                
                {/* Colorful accent border */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
              </div>
            </div>
            
            {/* Stats/Info bar */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Runtime: O(n)
                </span>
                <span className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Memory: O(1)
                </span>
              </div>
              <span className="text-gray-500">
                {question.code.split('\n').length} lines
              </span>
            </div>
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className="card-elevated p-8 slide-up bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              Explanation & Notes
            </h2>
            
            {/* Simple, clean explanation display */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="text-gray-800 leading-relaxed space-y-4">
                {question.explanation.split('\n\n').map((paragraph, index) => (
                  <div key={index}>
                    {paragraph.trim().startsWith('##') ? (
                      <h3 className="text-xl font-bold text-blue-700 mb-3 mt-6 first:mt-0 flex items-center">
                        <span className="w-1 h-5 bg-blue-500 rounded-full mr-3"></span>
                        {paragraph.replace('##', '').trim()}
                      </h3>
                    ) : paragraph.trim().startsWith('#') ? (
                      <h2 className="text-2xl font-bold text-blue-800 mb-4 mt-6 first:mt-0 flex items-center">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                        {paragraph.replace('#', '').trim()}
                      </h2>
                    ) : paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*') ? (
                      <ul className="list-none space-y-2 ml-4">
                        {paragraph.split('\n').map((item, itemIndex) => 
                          item.trim() && (
                            <li key={itemIndex} className="flex items-start">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{item.replace(/^[-*]\s*/, '')}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : paragraph.trim().match(/^\d+\./) ? (
                      <ol className="list-none space-y-2 ml-4">
                        {paragraph.split('\n').map((item, itemIndex) => 
                          item.trim() && (
                            <li key={itemIndex} className="flex items-start">
                              <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                                {itemIndex + 1}
                              </span>
                              <span className="text-gray-700">{item.replace(/^\d+\.\s*/, '')}</span>
                            </li>
                          )
                        )}
                      </ol>
                    ) : paragraph.trim().includes('```') ? (
                      <div className="my-4 rounded-lg overflow-hidden border border-gray-200">
                        <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-medium">
                          Code Example
                        </div>
                        <div className="bg-gray-900 p-4">
                          <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                            {paragraph.replace(/```[\w]*\n?/g, '').replace(/```/g, '')}
                          </pre>
                        </div>
                      </div>
                    ) : paragraph.trim() && (
                      <p className="text-gray-700 text-base leading-relaxed">
                        {paragraph.trim()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!question.code && !question.explanation && (
          <div className="card p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No C++ solution or explanation yet</h3>
            <p className="text-gray-500 mb-6">Add your C++ code solution and explanation to make this question memorable!</p>
            <Link
              to={`/questions/${question.id}/edit`}
              className="btn btn-primary btn-lg"
            >
              <Edit3 className="h-5 w-5 mr-2" />
              Add C++ Solution & Explanation
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/questions/add"
              className="group p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Add New Question</span>
            </Link>
            
            <Link
              to="/questions"
              className="group p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Browse All Questions</span>
            </Link>
            
            {question.topics.length > 0 && (
              <Link
                to={`/topics/${encodeURIComponent(question.topics[0])}`}
                className="group p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-center"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">View {question.topics[0]} Questions</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionDetail;
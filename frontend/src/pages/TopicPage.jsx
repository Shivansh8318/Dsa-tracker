import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Calendar,
  Tag,
  BookOpen,
  TrendingUp,
  Target
} from 'lucide-react';
import { questionsAPI } from '../services/api';
import { 
  formatDate, 
  getDifficultyBadgeClasses, 
  truncateText 
} from '../utils/helpers';
import { DIFFICULTY_LEVELS } from '../utils/constants';
import toast from 'react-hot-toast';

function TopicPage() {
  const { topic } = useParams();
  const decodedTopic = decodeURIComponent(topic);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    solved: 0,
    byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
    solvedByDifficulty: { Easy: 0, Medium: 0, Hard: 0 }
  });

  useEffect(() => {
    fetchTopicQuestions();
  }, [decodedTopic]);

  const fetchTopicQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getAll({ topic: decodedTopic });
      const topicQuestions = response.data;
      
      setQuestions(topicQuestions);
      
      // Calculate stats
      const newStats = {
        total: topicQuestions.length,
        solved: topicQuestions.filter(q => q.dateSolved).length,
        byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
        solvedByDifficulty: { Easy: 0, Medium: 0, Hard: 0 }
      };

      topicQuestions.forEach(question => {
        newStats.byDifficulty[question.difficulty]++;
        if (question.dateSolved) {
          newStats.solvedByDifficulty[question.difficulty]++;
        }
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching topic questions:', error);
      toast.error('Failed to load questions for this topic');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await questionsAPI.delete(id);
      setQuestions(questions.filter(q => q.id !== id));
      
      // Recalculate stats
      const updatedQuestions = questions.filter(q => q.id !== id);
      const newStats = {
        total: updatedQuestions.length,
        solved: updatedQuestions.filter(q => q.dateSolved).length,
        byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
        solvedByDifficulty: { Easy: 0, Medium: 0, Hard: 0 }
      };

      updatedQuestions.forEach(question => {
        newStats.byDifficulty[question.difficulty]++;
        if (question.dateSolved) {
          newStats.solvedByDifficulty[question.difficulty]++;
        }
      });

      setStats(newStats);
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const progressPercentage = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-16 mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 h-32">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 h-32">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{decodedTopic} Questions</h1>
            <p className="text-gray-600 mt-1">
              {stats.total} question{stats.total !== 1 ? 's' : ''} • {stats.solved} solved
            </p>
          </div>
          <Link
            to="/questions/add"
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Solved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.solved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total - stats.solved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress by Difficulty</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(DIFFICULTY_LEVELS).map(([difficulty, colors]) => {
            const total = stats.byDifficulty[difficulty];
            const solved = stats.solvedByDifficulty[difficulty];
            const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
            
            return (
              <div key={difficulty} className="text-center">
                <div className={`text-2xl font-bold mb-1 ${colors.color}`}>
                  {solved}/{total}
                </div>
                <div className={`text-sm font-medium mb-2 ${colors.color}`}>
                  {difficulty}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${colors.bg.replace('bg-', 'bg-').replace('-100', '-500')}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions in this topic yet</h3>
          <p className="text-gray-500 mb-4">Start building your {decodedTopic} question collection</p>
          <Link to="/questions/add" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First {decodedTopic} Question
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">All Questions</h2>
            <div className="text-sm text-gray-500">
              Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Link
                            to={`/questions/${question.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {question.title}
                          </Link>
                          {question.link && (
                            <a
                              href={question.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary-500"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyBadgeClasses(question.difficulty)}`}>
                            {question.difficulty}
                          </span>

                          {question.source && (
                            <span className="text-sm text-gray-500">
                              {question.source}
                            </span>
                          )}

                          {question.dateSolved && (
                            <div className="flex items-center text-sm text-green-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              Solved {formatDate(question.dateSolved)}
                            </div>
                          )}
                        </div>

                        {/* Other topics (excluding current topic) */}
                        {question.topics.filter(t => t !== decodedTopic).length > 0 && (
                          <div className="flex items-center flex-wrap gap-1 mb-2">
                            <span className="text-xs text-gray-500 mr-1">Also in:</span>
                            {question.topics.filter(t => t !== decodedTopic).map(otherTopic => (
                              <Link
                                key={otherTopic}
                                to={`/topics/${encodeURIComponent(otherTopic)}`}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                              >
                                {otherTopic}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Tags */}
                        {question.tags.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1 mb-2">
                            <Tag className="h-3 w-3 text-gray-400 mr-1" />
                            {question.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Explanation preview */}
                        {question.explanation && (
                          <p className="text-sm text-gray-600 mt-2">
                            {truncateText(question.explanation.replace(/[#*`]/g, ''), 150)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/questions/${question.id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/questions/add"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Add {decodedTopic} Question</span>
            </div>
          </Link>
          
          <Link
            to="/questions"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Browse All Questions</span>
            </div>
          </Link>
          
          <Link
            to="/"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">View Dashboard</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TopicPage;


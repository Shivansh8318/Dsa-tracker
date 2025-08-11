import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Calendar,
  Tag,
  Hash,
  Eye,
  Code2
} from 'lucide-react';
import { questionsAPI, topicsAPI, tagsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  useEffect(() => {
    fetchQuestions();
    fetchTopics();
    fetchTags();
  }, [searchTerm, topicFilter, difficultyFilter, tagFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (topicFilter) params.topic = topicFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (tagFilter) params.tags = tagFilter;
      
      const response = await questionsAPI.getAll(params);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await topicsAPI.getAll();
      setAllTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagsAPI.getAll();
      setAllTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await questionsAPI.delete(id);
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const getDifficultyBadgeClasses = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">DSA Questions</h1>
          <p className="text-gray-600 mt-2">Track and manage your Data Structures & Algorithms practice</p>
        </div>
        <Link to="/questions/add" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card-elevated p-6 mb-8 fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Topic Filter */}
          <select
            className="input"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
          >
            <option value="">All Topics</option>
            {allTopics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            className="input"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Tag Filter */}
        <div className="mt-4">
          <select
            className="input"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="card p-12 text-center">
          <Code2 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {searchTerm || topicFilter || difficultyFilter || tagFilter ? 'No questions found' : 'No questions yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || topicFilter || difficultyFilter || tagFilter
              ? 'Try adjusting your search or filters' 
              : 'Start your DSA journey by adding your first question'
            }
          </p>
          <Link to="/questions/add" className="btn btn-primary btn-lg">
            <Plus className="h-5 w-5 mr-2" />
            Add First Question
          </Link>
        </div>
      ) : (
        <div className="list-modern">
          {questions.map((question) => (
            <div key={question.id} className="card-interactive p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Link
                          to={`/questions/${question.id}`}
                          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {question.title}
                        </Link>
                      </div>

                      <div className="flex items-center space-x-4 mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeClasses(question.difficulty)}`}>
                          {question.difficulty}
                        </span>

                        {question.source && (
                          <span className="text-sm text-gray-600">
                            {question.source}
                          </span>
                        )}

                        {question.dateSolved && (
                          <span className="text-sm text-green-600 font-medium">
                            <Calendar className="h-4 w-4 mr-1 inline" />
                            Solved {formatDate(question.dateSolved)}
                          </span>
                        )}
                      </div>

                      {/* Topics */}
                      {question.topics && question.topics.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {question.topics.map((topic, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {question.tags.map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Link */}
                      {question.link && (
                        <a
                          href={question.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Problem
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/questions/${question.id}`}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/questions/${question.id}/edit`}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Questions;

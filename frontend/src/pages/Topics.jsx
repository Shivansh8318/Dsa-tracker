import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Hash, 
  Search, 
  X, 
  Grid3X3, 
  List, 
  Filter,
  TrendingUp,
  Code2,
  BookOpen
} from 'lucide-react';
import { topicsAPI, questionsAPI } from '../services/api';
import { cn } from '../utils/helpers';

function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'count'
  const [topicStats, setTopicStats] = useState({});

  useEffect(() => {
    fetchTopics();
    fetchTopicStats();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await topicsAPI.getAll();
      setTopics(response.data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicStats = async () => {
    try {
      // Get all questions and count by topic
      const response = await questionsAPI.getAll();
      const questions = response.data || [];
      
      const stats = {};
      questions.forEach(question => {
        if (question.topics && Array.isArray(question.topics)) {
          question.topics.forEach(topic => {
            stats[topic] = (stats[topic] || 0) + 1;
          });
        }
      });
      
      setTopicStats(stats);
    } catch (error) {
      console.error('Error fetching topic stats:', error);
    }
  };

  // Filter and sort topics
  const filteredTopics = topics
    .filter(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.localeCompare(b);
      } else {
        const countA = topicStats[a] || 0;
        const countB = topicStats[b] || 0;
        return countB - countA;
      }
    });

  const getTopicColors = (index) => {
    const colors = [
      'from-red-500 to-pink-500',
      'from-blue-500 to-indigo-500', 
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-purple-500 to-violet-500',
      'from-cyan-500 to-teal-500',
      'from-rose-500 to-pink-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-cyan-500',
      'from-orange-500 to-red-500'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900 opacity-20"></div>
        </div>
        <span className="ml-4 text-lg font-medium text-theme-secondary">Loading topics...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-secondary">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Code2 className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              DSA Topics
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explore and master Data Structures & Algorithms organized by topics
            </p>
            <div className="mt-6 flex justify-center space-x-8 text-blue-100">
              <div className="text-center">
                <div className="text-2xl font-bold">{topics.length}</div>
                <div className="text-sm">Total Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.values(topicStats).reduce((sum, count) => sum + count, 0)}
                </div>
                <div className="text-sm">Total Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-theme-primary border-b border-theme-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-tertiary" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-theme-primary bg-theme-secondary text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-theme-primary bg-theme-secondary text-theme-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="count">Sort by Question Count</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg bg-theme-secondary border border-theme-primary p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-md transition-all duration-200",
                    viewMode === 'grid'
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-theme-secondary hover:text-theme-primary"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-md transition-all duration-200",
                    viewMode === 'list'
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-theme-secondary hover:text-theme-primary"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-theme-tertiary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-theme-secondary" />
            </div>
            <h3 className="text-lg font-medium text-theme-primary mb-2">
              {searchQuery ? 'No topics found' : 'No topics available'}
            </h3>
            <p className="text-theme-secondary">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Add some questions to see topics here'
              }
            </p>
          </div>
        ) : (
          <div className={cn(
            "gap-6",
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          )}>
            {filteredTopics.map((topic, index) => {
              const questionCount = topicStats[topic] || 0;
              const colorClass = getTopicColors(index);
              
              return (
                <Link
                  key={topic}
                  to={`/topics/${encodeURIComponent(topic)}`}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl bg-theme-primary border border-theme-primary transition-all duration-300 hover:shadow-xl hover:scale-105",
                    viewMode === 'list' ? "flex items-center p-4" : "p-6"
                  )}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="relative z-10">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${colorClass} mb-4 shadow-lg`}>
                          <Hash className="h-6 w-6 text-white" />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-theme-primary mb-2 group-hover:text-blue-600 transition-colors">
                          {topic}
                        </h3>
                        
                        <div className="flex items-center text-theme-secondary">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                          </span>
                        </div>
                        
                        {questionCount > 0 && (
                          <div className="mt-4 w-full bg-theme-tertiary rounded-full h-2">
                            <div 
                              className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500`}
                              style={{ width: `${Math.min(100, (questionCount / Math.max(...Object.values(topicStats))) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-r ${colorClass} mr-4`}>
                        <Hash className="h-5 w-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-theme-primary group-hover:text-blue-600 transition-colors truncate">
                          {topic}
                        </h3>
                        <div className="flex items-center text-theme-secondary mt-1">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-theme-tertiary group-hover:text-blue-500 transition-colors" />
                      </div>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Topics;


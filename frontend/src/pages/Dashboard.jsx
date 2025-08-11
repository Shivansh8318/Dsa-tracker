import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  BookOpen, 
  Target, 
  Calendar,
  Plus,
  Eye,
  Building2,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase
} from 'lucide-react';
import { statsAPI, companiesAPI } from '../services/api';
import { generateHeatmapData, getHeatmapColor, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const DIFFICULTY_COLORS = {
  Easy: '#10B981',
  Medium: '#F59E0B', 
  Hard: '#EF4444'
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [companyStats, setCompanyStats] = useState(null);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  // Refresh stats when the component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh when window gets focus
    const handleFocus = () => fetchStats();
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsResponse, companyStatsResponse, companiesResponse] = await Promise.all([
        statsAPI.getStats(),
        companiesAPI.getStats(),
        companiesAPI.getAll({ limit: 5 })
      ]);
      
      setStats(statsResponse.data);
      setCompanyStats(companyStatsResponse.data);
      setRecentCompanies(companiesResponse.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 h-32">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6 h-96">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-80 bg-gray-100 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 h-96">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-80 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500 mb-4">Start tracking your DSA progress by adding questions</p>
          <Link
            to="/questions/add"
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Question
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const topicChartData = Object.entries(stats.topicStats).map(([topic, data]) => ({
    topic,
    solved: data.solved,
    total: data.total,
    remaining: data.total - data.solved
  }));

  const difficultyChartData = Object.entries(stats.difficultyStats).map(([difficulty, count]) => ({
    name: difficulty,
    value: count,
    color: DIFFICULTY_COLORS[difficulty]
  }));

  // Generate heatmap data for last 365 days (GitHub-style)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 365);
  
  // Adjust start date to begin on Sunday for proper week alignment
  const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  startDate.setDate(startDate.getDate() - dayOfWeek);
  
  const heatmapData = generateHeatmapData(stats.heatmapData, startDate, endDate);
  
  // Debug logging
  console.log('Heatmap raw data:', stats.heatmapData);
  console.log('Generated heatmap data sample:', heatmapData.slice(0, 10));
  console.log('Total heatmap data points:', heatmapData.length);
  console.log('Start date (Sunday aligned):', startDate.toDateString());
  console.log('End date:', endDate.toDateString());

  // Group by weeks for GitHub-style display (7 rows, ~53 columns)
  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }
  
  // Generate month labels based on actual weeks
  const monthLabels = [];
  const currentMonthLabel = new Date(startDate);
  let monthIndex = 0;
  
  weeks.forEach((week, weekIndex) => {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (weekIndex * 7));
    
    if (weekIndex === 0 || weekStart.getDate() <= 7) {
      monthLabels.push({
        index: weekIndex,
        label: weekStart.toLocaleDateString('en-US', { month: 'short' })
      });
    }
  });
  
  // Ensure we don't show too many weeks
  const maxWeeksToShow = Math.min(weeks.length, 53);

  const solvedPercentage = stats.totalQuestions > 0 
    ? Math.round((stats.totalSolved / stats.totalQuestions) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Track your DSA learning progress and performance</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="btn btn-secondary"
            title="Refresh dashboard data"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card-elevated p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Total Solved</p>
              <p className="text-3xl font-bold text-purple-900">{stats.totalSolved}</p>
              <p className="text-xs text-purple-600 mt-1">Questions completed</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl group-hover:scale-110 transition-transform">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Total Questions</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalQuestions}</p>
              <p className="text-xs text-blue-600 mt-1">In your collection</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">Success Rate</p>
              <p className="text-3xl font-bold text-green-900">{solvedPercentage}%</p>
              <p className="text-xs text-green-600 mt-1">Completion rate</p>
            </div>
            <div className="p-3 bg-green-200 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-2">Topics Covered</p>
              <p className="text-3xl font-bold text-amber-900">{Object.keys(stats.topicStats).length}</p>
              <p className="text-xs text-amber-600 mt-1">Different categories</p>
            </div>
            <div className="p-3 bg-amber-200 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Topic Progress Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Progress by Topic</h3>
            <Link to="/questions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              <Eye className="h-4 w-4 inline mr-1" />
              View All
            </Link>
          </div>
          {topicChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicChartData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="topic" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="solved" fill="#3B82F6" name="Solved" />
                <Bar dataKey="remaining" fill="#E5E7EB" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300">
              <p className="text-gray-500">No topic data available</p>
            </div>
          )}
        </div>

        {/* Difficulty Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Difficulty Distribution</h3>
          {difficultyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300">
              <p className="text-gray-500">No difficulty data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Activity Heatmap (Last Year)</h3>
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Month labels - dynamically positioned */}
            <div className="flex mb-2 text-xs relative" style={{ marginLeft: '30px', color: 'var(--text-tertiary)', height: '15px' }}>
              {monthLabels.map((month, index) => (
                <div 
                  key={`${month.label}-${month.index}`} 
                  className="absolute text-center" 
                  style={{ 
                    left: `${month.index * 12}px`,
                    width: '36px'
                  }}
                >
                  {month.label}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex">
              {/* Day labels - GitHub style (7 rows) */}
              <div className="flex flex-col text-xs mr-2" style={{ color: 'var(--text-tertiary)' }}>
                <div className="flex items-center justify-end" style={{ height: '12px', width: '20px' }}>Sun</div>
                <div className="flex items-center justify-end" style={{ height: '12px', width: '20px' }}></div>
                <div className="flex items-center justify-end" style={{ height: '12px', width: '20px' }}>Tue</div>
                <div className="flex items-center justify-end" style={{ height: '12px', width: '20px' }}></div>
                <div className="flex items-center justify-end" style={{ height: '12px', width: '20px' }}>Thu</div>
                <div className="flex items-center justify-end" style={{ height: '12px', width: '20px' }}></div>
                <div className="flex items-center justify-end" style={{ height: '12px', width: '20px' }}>Sat</div>
              </div>
              
              {/* Heatmap squares - GitHub style grid */}
              <div className="flex">
                {weeks.slice(0, maxWeeksToShow).map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col mr-1">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const day = week[dayIndex];
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`w-2.5 h-2.5 rounded-sm mb-0.5 ${day ? getHeatmapColor(day.count) : 'bg-gray-100 dark:bg-gray-800'} border transition-colors cursor-pointer`}
                          style={{ borderColor: 'var(--border-primary)' }}
                          onMouseEnter={(e) => e.target.style.borderColor = 'var(--border-tertiary)'}
                          onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                          title={day ? `${day.date}: ${day.count} question${day.count !== 1 ? 's' : ''} solved` : 'No data'}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              <span>Less</span>
              <div className="flex items-center space-x-1">
                <span className="text-xs mr-2">More</span>
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-700 border" style={{ borderColor: 'var(--border-primary)' }} title="0 questions" />
                <div className="w-2.5 h-2.5 rounded-sm bg-green-200 dark:bg-green-800 border" style={{ borderColor: 'var(--border-primary)' }} title="1 question" />
                <div className="w-2.5 h-2.5 rounded-sm bg-green-300 dark:bg-green-700 border" style={{ borderColor: 'var(--border-primary)' }} title="2 questions" />
                <div className="w-2.5 h-2.5 rounded-sm bg-green-400 dark:bg-green-600 border" style={{ borderColor: 'var(--border-primary)' }} title="3-4 questions" />
                <div className="w-2.5 h-2.5 rounded-sm bg-green-500 dark:bg-green-500 border" style={{ borderColor: 'var(--border-primary)' }} title="5-7 questions" />
                <div className="w-2.5 h-2.5 rounded-sm bg-green-600 dark:bg-green-400 border" style={{ borderColor: 'var(--border-primary)' }} title="8+ questions" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Applications Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Company Stats */}
        <div className="lg:col-span-2">
          <div className="card-elevated p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                Job Applications
              </h3>
              <Link
                to="/companies/add"
                className="btn btn-primary btn-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Link>
            </div>
            
            {companyStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 card">
                  <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{companyStats.totalApplications}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Applied</div>
                </div>
                
                <div className="text-center p-4 card">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{companyStats.selectedCount}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Selected</div>
                </div>
                
                <div className="text-center p-4 card">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{companyStats.rejectedCount}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Rejected</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="lg:col-span-1">
          <div className="card-elevated p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Recent Applications
              </h4>
              <Link
                to="/companies"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentCompanies.length > 0 ? (
                recentCompanies.slice(0, 5).map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100 hover:shadow-sm transition-shadow">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {company.name}
                      </p>
                      {company.salary && (
                        <p className="text-xs text-green-600 font-medium">
                          {company.salary}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        company.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                        company.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        company.status === 'INTERVIEW_SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                        company.status === 'INTERVIEW_COMPLETED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {company.status.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No applications yet</p>
                  <Link
                    to="/companies/add"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Add your first application
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/questions/add"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Add New Question</span>
            </div>
          </Link>
          
          <Link
            to="/questions"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Browse Questions</span>
            </div>
          </Link>
          
          <button
            onClick={fetchStats}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Refresh Stats</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

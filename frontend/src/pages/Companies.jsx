import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { companiesAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [searchTerm, statusFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const response = await companiesAPI.getAll(params);
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company application?')) {
      return;
    }

    try {
      await companiesAPI.delete(id);
      toast.success('Company application deleted successfully');
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company application');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SELECTED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_COMPLETED':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Briefcase className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'SELECTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'INTERVIEW_COMPLETED':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFFER_RECEIVED':
        return 'bg-purple-100 text-purple-800';
      case 'OFFER_ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'OFFER_DECLINED':
        return 'bg-orange-100 text-orange-800';
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
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gradient">Job Applications</h1>
          <p className="text-gray-600 mt-2">Track your job applications and interview progress</p>
        </div>
        <Link to="/companies/add" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card-elevated p-6 mb-8 fade-in">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies or feedback..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="INTERVIEW_COMPLETED">Interview Completed</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
            <option value="OFFER_RECEIVED">Offer Received</option>
            <option value="OFFER_ACCEPTED">Offer Accepted</option>
            <option value="OFFER_DECLINED">Offer Declined</option>
          </select>
        </div>
      </div>

      {/* Companies List */}
      {companies.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {searchTerm || statusFilter ? 'No applications found' : 'No applications yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filters' 
              : 'Start tracking your job applications by adding your first one'
            }
          </p>
          <Link to="/companies/add" className="btn btn-primary btn-lg">
            <Plus className="h-5 w-5 mr-2" />
            Add First Application
          </Link>
        </div>
      ) : (
        <div className="list-modern">
          {companies.map((company) => (
            <div key={company.id} className="card-interactive p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      {getStatusIcon(company.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Link
                          to={`/companies/${company.id}`}
                          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {company.name}
                        </Link>
                      </div>

                      <div className="flex items-center space-x-6 mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(company.status)}`}>
                          {company.status.replace('_', ' ').toLowerCase()}
                        </span>

                        {company.salary && (
                          <span className="text-sm text-green-600 font-medium">
                            <Briefcase className="h-4 w-4 mr-1 inline" />
                            {company.salary}
                          </span>
                        )}
                      </div>

                      {company.feedback && (
                        <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-3 rounded-lg">
                          <strong>Feedback:</strong> {company.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/companies/${company.id}/edit`}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteCompany(company.id)}
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

export default Companies;

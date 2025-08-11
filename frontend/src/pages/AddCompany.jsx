import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Building2 } from 'lucide-react';
import { companiesAPI } from '../services/api';
import toast from 'react-hot-toast';

function AddCompany() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      salary: '',
      status: 'APPLIED',
      feedback: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await companiesAPI.create(data);
      toast.success('Company application added successfully!');
      navigate('/companies');
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to add company application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gradient">Add Job Application</h1>
          <p className="text-gray-600 mt-2">Track a new job application</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="card-elevated p-8 fade-in">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Company Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="label" htmlFor="name">
                Company Name *
              </label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="e.g., Google, Microsoft, Apple"
                {...register('name', { required: 'Company name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Salary */}
            <div>
              <label className="label" htmlFor="salary">
                Salary Range
              </label>
              <input
                id="salary"
                type="text"
                className="input"
                placeholder="e.g., $80k - $120k, ₹15L - ₹25L"
                {...register('salary')}
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="label" htmlFor="status">
                Application Status
              </label>
              <select
                id="status"
                className="input"
                {...register('status')}
              >
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

          {/* Feedback */}
          <div className="mt-6">
            <label className="label" htmlFor="feedback">
              Feedback / Notes
            </label>
            <textarea
              id="feedback"
              rows={6}
              className="textarea"
              placeholder="Interview feedback, application notes, experience, follow-ups..."
              {...register('feedback')}
            />
            <p className="text-sm text-gray-500 mt-1">
              Add any relevant feedback, interview experience, or notes about the application process.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Adding...' : 'Add Application'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCompany;

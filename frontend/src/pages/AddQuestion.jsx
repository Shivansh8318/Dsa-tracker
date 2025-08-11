import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { questionsAPI, topicsAPI, tagsAPI } from '../services/api';
import { DIFFICULTY_OPTIONS, DEFAULT_TOPICS, COMMON_SOURCES } from '../utils/constants';
import { formatDateForInput } from '../utils/helpers';
import toast from 'react-hot-toast';

function AddQuestion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      topics: [],
      difficulty: 'Medium',
      source: '',
      link: '',
      dateSolved: '',
      code: '',
      explanation: '',
      tags: []
    }
  });

  const watchedTopics = watch('topics');
  const watchedTags = watch('tags');

  useEffect(() => {
    fetchAvailableData();
  }, []);

  const fetchAvailableData = async () => {
    try {
      const [topicsRes, tagsRes] = await Promise.all([
        topicsAPI.getAll(),
        tagsAPI.getAll()
      ]);
      
      // Combine existing topics with default ones
      const allTopics = [...new Set([...DEFAULT_TOPICS, ...topicsRes.data])].sort();
      setAvailableTopics(allTopics);
      setAvailableTags(tagsRes.data);
    } catch (error) {
      console.error('Error fetching available data:', error);
      setAvailableTopics(DEFAULT_TOPICS);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Format the data
      const formattedData = {
        ...data,
        dateSolved: data.dateSolved ? new Date(data.dateSolved).toISOString() : null,
        topics: data.topics || [],
        tags: data.tags || []
      };

      await questionsAPI.create(formattedData);
      toast.success('Question added successfully!');
      navigate('/questions');
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Failed to add question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTopic = (topic) => {
    if (topic && !watchedTopics.includes(topic)) {
      setValue('topics', [...watchedTopics, topic]);
    }
  };

  const removeTopic = (topicToRemove) => {
    setValue('topics', watchedTopics.filter(topic => topic !== topicToRemove));
  };

  const addNewTopic = () => {
    if (newTopic.trim() && !availableTopics.includes(newTopic.trim())) {
      const topic = newTopic.trim();
      setAvailableTopics([...availableTopics, topic].sort());
      addTopic(topic);
      setNewTopic('');
    } else if (newTopic.trim() && availableTopics.includes(newTopic.trim())) {
      addTopic(newTopic.trim());
      setNewTopic('');
    }
  };

  const addTag = (tag) => {
    if (tag && !watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const addNewTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      const tag = newTag.trim();
      setAvailableTags([...availableTags, tag].sort());
      addTag(tag);
      setNewTag('');
    } else if (newTag.trim() && availableTags.includes(newTag.trim())) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm group mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient mb-3">Add New Question</h1>
          <p className="text-lg text-gray-600">Build your DSA knowledge base one question at a time</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="card-elevated p-8 fade-in">
          {/* Title */}
          <div className="mb-6">
            <label className="label mb-2" htmlFor="title">
              Question Title *
            </label>
            <input
              id="title"
              type="text"
              className={`input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g., Two Sum, Binary Tree Inorder Traversal"
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' }
              })}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Difficulty and Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label mb-2" htmlFor="difficulty">
                Difficulty *
              </label>
              <select
                id="difficulty"
                className={`select ${errors.difficulty ? 'border-red-500' : ''}`}
                {...register('difficulty', { required: 'Difficulty is required' })}
              >
                {DIFFICULTY_OPTIONS.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
              {errors.difficulty && (
                <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>
              )}
            </div>

            <div>
              <label className="label mb-2" htmlFor="source">
                Source Platform
              </label>
              <select
                id="source"
                className="select"
                {...register('source')}
              >
                <option value="">Select a platform</option>
                {COMMON_SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Link and Date Solved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label mb-2" htmlFor="link">
                Problem Link
              </label>
              <input
                id="link"
                type="url"
                className="input"
                placeholder="https://leetcode.com/problems/..."
                {...register('link', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL'
                  }
                })}
              />
              {errors.link && (
                <p className="text-red-500 text-sm mt-1">{errors.link.message}</p>
              )}
            </div>

            <div>
              <label className="label mb-2" htmlFor="dateSolved">
                Date Solved
              </label>
              <input
                id="dateSolved"
                type="date"
                className="input"
                max={formatDateForInput(new Date())}
                {...register('dateSolved')}
              />
            </div>
          </div>

          {/* Topics */}
          <div className="mb-6">
            <label className="label mb-2">Topics</label>
            
            {/* Selected topics */}
            {watchedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {watchedTopics.map(topic => (
                  <span
                    key={topic}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add new topic */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTopic())}
                className="input flex-1"
                placeholder="Add a new topic (e.g., Dynamic Programming)"
              />
              <button
                type="button"
                onClick={addNewTopic}
                className="btn btn-secondary shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Available topics */}
            <div className="flex flex-wrap gap-2">
              {availableTopics
                .filter(topic => !watchedTopics.includes(topic))
                .map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => addTopic(topic)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="label mb-2">Tags</label>
            
            {/* Selected tags */}
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {watchedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add new tag */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
                className="input flex-1"
                placeholder="Add a tag (e.g., interview, practice)"
              />
              <button
                type="button"
                onClick={addNewTag}
                className="btn btn-secondary shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Available tags */}
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableTags
                  .filter(tag => !watchedTags.includes(tag))
                  .map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Code Solution */}
          <div className="mb-6">
            <label className="label mb-2" htmlFor="code">
              C++ Code Solution
            </label>
            <textarea
              id="code"
              rows={10}
              className="textarea font-mono text-sm"
              placeholder="Paste your C++ code solution here..."
              {...register('code')}
            />
            <p className="text-sm text-gray-500 mt-1">
              Add your complete code solution
            </p>
          </div>

          {/* Explanation */}
          <div className="mb-6">
            <label className="label mb-2" htmlFor="explanation">
              Explanation / Solution Notes
            </label>
            <textarea
              id="explanation"
              rows={6}
              className="textarea"
              placeholder="Explain your approach, algorithm, time/space complexity, etc. (Markdown supported)"
              {...register('explanation')}
            />
            <p className="text-sm text-gray-500 mt-1">
              You can use Markdown formatting for better readability
            </p>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Question
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddQuestion;

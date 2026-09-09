import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setCategories } from '../store/appSlice';
import { WysiwygEditor } from '../components/WysiwygEditor';
import api from '../services/api';
import toast from 'react-hot-toast';

interface RequestFormData {
  title: string;
  description: string;
  requiredSkills: string[];
  category: string;
  budget: string;
  budgetType: 'fixed' | 'hourly';
  timelineNumber: string;
  timelineUnit: 'hr' | 'day' | 'week' | 'month';
}

export const RequestAppPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { categories } = useAppSelector((state) => state.apps);
  
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState<RequestFormData>({
    title: '',
    description: '',
    requiredSkills: [],
    category: '',
    budget: '',
    budgetType: 'fixed',
    timelineNumber: '2',
    timelineUnit: 'week',
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.getCategories();
        if (res.data.success) {
          dispatch(setCategories(res.data.categories));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (html: string) => {
    setFormData((prev) => ({
      ...prev,
      description: html,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.budget) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.timelineNumber || formData.timelineNumber === '0') {
      toast.error('Please enter a valid timeline number');
      return;
    }

    try {
      setIsLoading(true);

      // Format timeline as "2 weeks", "1 day", etc.
      const unit = formData.timelineUnit === 'day' ? 'day(s)' 
                 : formData.timelineUnit === 'week' ? 'week(s)' 
                 : formData.timelineUnit === 'month' ? 'month(s)' 
                 : 'hr';
      const timeline = `${formData.timelineNumber} ${unit}`;

      const response = await api.createProjectRequest({
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.requiredSkills,
        category: formData.category,
        budget: parseFloat(formData.budget),
        budgetType: formData.budgetType,
        timeline: timeline,
      });

      if (response.data.success) {
        toast.success('Project request posted successfully!');
        navigate(`/projects/${response.data.project.id}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create request';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-light mb-2">Request a Custom App</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us what app you need, and developers will submit proposals to build it for you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Title */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Project Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  What app do you need? *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., E-commerce Platform, Inventory Management System"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Detailed Description *
                </label>
                <WysiwygEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe the app's purpose, features, and functionality in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    Timeline *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="timelineNumber"
                      value={formData.timelineNumber}
                      onChange={handleChange}
                      required
                      min="1"
                      className="input-field w-24"
                      placeholder="e.g., 2"
                    />
                    <select
                      name="timelineUnit"
                      value={formData.timelineUnit}
                      onChange={handleChange}
                      className="input-field w-40"
                    >
                      <option value="hr">Hour(s)</option>
                      <option value="day">Day(s)</option>
                      <option value="week">Week(s)</option>
                      <option value="month">Month(s)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Budget */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Skills & Budget</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Required Skills/Technologies (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="input-field flex-1"
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill, i) => (
                    <div
                      key={i}
                      className="badge bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(i)}
                        className="hover:opacity-70 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    Budget *
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    Budget Type *
                  </label>
                  <select
                    name="budgetType"
                    value={formData.budgetType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Posting Request...' : 'Post Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-light font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

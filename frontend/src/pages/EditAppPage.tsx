import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { WysiwygEditor } from '../components/WysiwygEditor';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loading } from '../components/Loading';

type EditTab = 'basic' | 'features' | 'pricing' | 'tech' | 'links';

interface PricingOption {
  id: string;
  type: 'one-off' | 'subscription' | 'on-premise' | 'online-deployment' | 'custom';
  amount: string;
  currency: string;
  description: string;
  billingCycle?: 'monthly' | 'yearly' | 'one-time';
}

export const EditAppPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<EditTab>('basic');
  const [techStackInput, setTechStackInput] = useState('');
  const [distributionFormatInput, setDistributionFormatInput] = useState('');
  const [deploymentMethodInput, setDeploymentMethodInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [allDeploymentMethods] = useState<string[]>(['Cloud', 'On-Premise', 'Hybrid', 'Docker', 'Kubernetes']);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    techStack: [] as string[],
    category: [] as string[],
    isFree: true,
    pricingOptions: [] as PricingOption[],
    isSaaS: false,
    isOffline: false,
    githubRepository: '',
    distributionFormat: [] as string[],
    deploymentMethods: [] as string[],
    officialWebsite: '',
    liveDemo: '',
    documentation: '',
    logo: '',
    screenshots: [] as string[],
    tags: [] as string[],
  });

  const [newPricing, setNewPricing] = useState<Partial<PricingOption>>({
    type: 'one-off',
    amount: '',
    currency: '₦',
    billingCycle: 'one-time',
    description: '',
  });

  // Fetch app details
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchApp = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await api.getApp(id);

        if (response.data.success) {
          const app = response.data.app;

          // Check if user owns this app
          if (app.userId !== user?.id) {
            toast.error('You are not authorized to edit this app');
            navigate('/dashboard');
            return;
          }

          setFormData({
            title: app.title || '',
            subtitle: app.subtitle || '',
            description: app.description || '',
            techStack: Array.isArray(app.techStack) ? app.techStack : [],
            category: [app.category?.slug || ''],
            isFree: app.isFree || true,
            pricingOptions: app.pricingOptions || [],
            isSaaS: app.isSaaS || false,
            isOffline: app.isOffline || false,
            githubRepository: app.githubRepository || '',
            distributionFormat: Array.isArray(app.distributionFormat)
              ? app.distributionFormat
              : [app.distributionFormat].filter(Boolean),
            deploymentMethods: Array.isArray(app.deploymentMethods)
              ? app.deploymentMethods
              : app.deploymentMethod
              ? [app.deploymentMethod].filter(Boolean)
              : [],
            officialWebsite: app.officialWebsite || '',
            liveDemo: app.liveDemo || '',
            documentation: app.documentation || '',
            logo: app.logo || '',
            screenshots: Array.isArray(app.screenshots) ? app.screenshots : [],
            tags: Array.isArray(app.tags) ? app.tags : [],
          });
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to load app';
        toast.error(message);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [id, isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addTechStack = () => {
    if (techStackInput.trim()) {
      const newTech = techStackInput.trim();
      if (!formData.techStack.includes(newTech)) {
        setFormData((prev) => ({
          ...prev,
          techStack: [...prev.techStack, newTech],
        }));
      }
      setTechStackInput('');
    }
  };

  const removeTechStack = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index),
    }));
  };

  const addDeploymentMethod = () => {
    if (deploymentMethodInput.trim()) {
      const newMethod = deploymentMethodInput.trim();
      if (!formData.deploymentMethods.includes(newMethod)) {
        setFormData((prev) => ({
          ...prev,
          deploymentMethods: [...prev.deploymentMethods, newMethod],
        }));
      }
      setDeploymentMethodInput('');
    }
  };

  const removeDeploymentMethod = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deploymentMethods: prev.deploymentMethods.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (tagsInput.trim()) {
      const newTag = tagsInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagsInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const addDistributionFormat = () => {
    if (distributionFormatInput.trim() && !formData.distributionFormat.includes(distributionFormatInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        distributionFormat: [...prev.distributionFormat, distributionFormatInput.trim()],
      }));
      setDistributionFormatInput('');
    }
  };

  const removeDistributionFormat = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      distributionFormat: prev.distributionFormat.filter((_, i) => i !== index),
    }));
  };

  const addPricingOption = () => {
    if (newPricing.type && newPricing.amount && newPricing.currency) {
      const pricing: PricingOption = {
        id: Date.now().toString(),
        type: newPricing.type as any,
        amount: newPricing.amount,
        currency: newPricing.currency,
        description: newPricing.description || '',
        billingCycle: newPricing.billingCycle,
      };

      setFormData((prev) => ({
        ...prev,
        pricingOptions: [...prev.pricingOptions, pricing],
      }));

      setNewPricing({
        type: 'one-off',
        amount: '',
        currency: '₦',
        billingCycle: 'one-time',
        description: '',
      });
    } else {
      toast.error('Please fill in pricing details');
    }
  };

  const removePricingOption = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      pricingOptions: prev.pricingOptions.filter((p) => p.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const plainDescription = formData.description.replace(/<[^>]*>/g, '').trim();

    if (!formData.title || formData.category.length === 0 || !plainDescription) {
      toast.error('Please fill in all required fields (Title, Category, Description)');
      return;
    }

    try {
      setIsSaving(true);

      const response = await api.updateApp(id!, {
        ...formData,
        category: formData.category[0],
        deploymentMethod: formData.deploymentMethods, // Convert to backend field name
      });

      if (response.data.success) {
        toast.success('App updated successfully!');
        navigate(`/apps/${id}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update app';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-light mb-8">Edit App</h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'features', label: 'Features' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'tech', label: 'Tech & Tags' },
            { id: 'links', label: 'Links' },
          ].map(({ id: tabId, label }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId as EditTab)}
              className={`pb-3 px-4 font-medium transition border-b-2 ${
                activeTab === tabId
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-light'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="card space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  App Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Enter app title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Subtitle *
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Description * (Use formatting buttons for lists)
                </label>
                <WysiwygEditor value={formData.description} onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  App Logo
                </label>
                {formData.logo && (
                  <img src={formData.logo} alt="Logo preview" className="w-20 h-20 rounded-lg object-cover mb-4 border border-gray-200 dark:border-gray-700" />
                )}
                <input type="text" value={formData.logo} onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))} className="input-field" placeholder="Logo URL" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Categories * (Select one or more)
                </label>
                <select onChange={(e) => e.target.value && setFormData((prev) => ({ ...prev, category: [e.target.value] }))} className="input-field" defaultValue={formData.category[0] || ''}>
                  <option value="">Select Category</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="ai">AI Apps</option>
                  <option value="erp">Company ERPs</option>
                  <option value="social">Social Apps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Distribution Formats (Add one or more)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={distributionFormatInput}
                    onChange={(e) => setDistributionFormatInput(e.target.value)}
                    className="input-field flex-1"
                    placeholder="e.g. Web, Desktop, Mobile..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDistributionFormat())}
                  />
                  <button type="button" onClick={addDistributionFormat} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus size={20} />
                  </button>
                </div>
                {formData.distributionFormat.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.distributionFormat.map((format, index) => (
                      <span key={index} className="badge badge-info flex items-center gap-2">
                        {format}
                        <button type="button" onClick={() => removeDistributionFormat(index)} className="text-white hover:opacity-70">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="card space-y-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isSaaS" checked={formData.isSaaS} onChange={handleChange} className="checkbox" />
                  <span className="text-gray-900 dark:text-light font-medium">SaaS/Cloud-based</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isOffline" checked={formData.isOffline} onChange={handleChange} className="checkbox" />
                  <span className="text-gray-900 dark:text-light font-medium">Works Offline</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="checkbox" />
                  <span className="text-gray-900 dark:text-light font-medium">Free</span>
                </label>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="card space-y-6">
              {!formData.isFree && (
                <>
                  <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                          Pricing Type
                        </label>
                        <select
                          value={newPricing.type || ''}
                          onChange={(e) => setNewPricing((prev) => ({ ...prev, type: e.target.value as any }))}
                          className="input-field"
                        >
                          <option value="one-off">One-Off</option>
                          <option value="subscription">Subscription</option>
                          <option value="on-premise">On-Premise</option>
                          <option value="online-deployment">Online Deployment</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={newPricing.amount}
                          onChange={(e) => setNewPricing((prev) => ({ ...prev, amount: e.target.value }))}
                          className="input-field"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {newPricing.type === 'subscription' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                          Billing Cycle
                        </label>
                        <select
                          value={newPricing.billingCycle || ''}
                          onChange={(e) => setNewPricing((prev) => ({ ...prev, billingCycle: e.target.value as any }))}
                          className="input-field"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                        Description
                      </label>
                      <textarea
                        value={newPricing.description}
                        onChange={(e) => setNewPricing((prev) => ({ ...prev, description: e.target.value }))}
                        className="input-field"
                        placeholder="E.g., Basic features..."
                        rows={3}
                      />
                    </div>

                    <button type="button" onClick={addPricingOption} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Add Pricing Option
                    </button>
                  </div>

                  {formData.pricingOptions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-light mb-3">Added Pricing Options</h3>
                      <div className="space-y-2">
                        {formData.pricingOptions.map((pricing) => (
                          <div key={pricing.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-light">{pricing.type}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {pricing.currency}
                                {pricing.amount} {pricing.billingCycle ? `/ ${pricing.billingCycle}` : ''}
                              </p>
                            </div>
                            <button type="button" onClick={() => removePricingOption(pricing.id)} className="text-red-600 dark:text-red-400 hover:opacity-70">
                              <X size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tech & Tags Tab */}
          {activeTab === 'tech' && (
            <div className="card space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Tech Stack (Add technologies)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    className="input-field flex-1"
                    placeholder="e.g. React, Node.js..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                  />
                  <button type="button" onClick={addTechStack} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus size={20} />
                  </button>
                </div>
                {formData.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((tech, index) => (
                      <span key={index} className="badge badge-primary flex items-center gap-2">
                        {tech}
                        <button type="button" onClick={() => removeTechStack(index)} className="text-white hover:opacity-70">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Deployment Methods (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    list="deploymentList"
                    value={deploymentMethodInput}
                    onChange={(e) => setDeploymentMethodInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeploymentMethod())}
                    className="input-field flex-1"
                    placeholder="e.g. Docker, Kubernetes, Cloud..."
                  />
                  <datalist id="deploymentList">
                    {allDeploymentMethods.map((method) => (
                      <option key={method} value={method} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={addDeploymentMethod}
                    className="btn-secondary flex items-center gap-2"
                    disabled={!deploymentMethodInput.trim()}
                  >
                    <Plus size={18} />
                    Add
                  </button>
                </div>
                {formData.deploymentMethods.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.deploymentMethods.map((method, i) => (
                      <div key={i} className="badge bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 flex items-center gap-2">
                        {method}
                        <button
                          type="button"
                          onClick={() => removeDeploymentMethod(i)}
                          className="text-xs hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Tags (Add relevant tags)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="input-field flex-1"
                    placeholder="e.g. productivity, design..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus size={20} />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="badge badge-secondary flex items-center gap-2">
                        {tag}
                        <button type="button" onClick={() => removeTag(index)} className="text-white hover:opacity-70">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="card space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Official Website
                </label>
                <input
                  type="url"
                  name="officialWebsite"
                  value={formData.officialWebsite}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Live Demo
                </label>
                <input type="url" name="liveDemo" value={formData.liveDemo} onChange={handleChange} className="input-field" placeholder="https://demo.example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  GitHub Repository
                </label>
                <input type="url" name="githubRepository" value={formData.githubRepository} onChange={handleChange} className="input-field" placeholder="https://github.com/..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                  Documentation
                </label>
                <input type="url" name="documentation" value={formData.documentation} onChange={handleChange} className="input-field" placeholder="https://docs.example.com" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-light font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

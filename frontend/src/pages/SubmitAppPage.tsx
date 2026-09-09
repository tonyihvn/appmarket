import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X, DollarSign, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addApp } from '../store/appSlice';
import { WysiwygEditor } from '../components/WysiwygEditor';
import api from '../services/api';
import toast from 'react-hot-toast';

type SubmitTab = 'basic' | 'features' | 'pricing' | 'tech' | 'links';

interface PricingOption {
  id: string;
  type: 'one-off' | 'subscription' | 'on-premise' | 'online-deployment' | 'custom';
  amount: string;
  currency: string;
  description: string;
  billingCycle?: 'monthly' | 'yearly' | 'one-time';
}

export const SubmitAppPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SubmitTab>('basic');
  const [techStackInput, setTechStackInput] = useState('');
  const [deploymentInput, setDeploymentInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [distributionFormatInput, setDistributionFormatInput] = useState('');
  const [allTechStacks, setAllTechStacks] = useState<string[]>([]);
  const [allDeploymentMethods, setAllDeploymentMethods] = useState<string[]>(['Cloud', 'On-Premise', 'Hybrid', 'Docker', 'Kubernetes']);
  const [allTags, setAllTags] = useState<string[]>([]);

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

  // Check authentication and load saved data
  useEffect(() => {
    const savedTechStacks = localStorage.getItem('appTechStacks');
    const savedTags = localStorage.getItem('appTags');
    if (savedTechStacks) setAllTechStacks(JSON.parse(savedTechStacks));
    if (savedTags) setAllTags(JSON.parse(savedTags));

    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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
        
        if (!allTechStacks.includes(newTech)) {
          const updated = [...allTechStacks, newTech];
          setAllTechStacks(updated);
          localStorage.setItem('appTechStacks', JSON.stringify(updated));
        }
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

  const addCategory = (categoryValue: string) => {
    if (categoryValue.trim() && !formData.category.includes(categoryValue)) {
      setFormData((prev) => ({
        ...prev,
        category: [...prev.category, categoryValue],
      }));
    }
  };

  const removeCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.filter((_, i) => i !== index),
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

  const addDeploymentMethod = () => {
    if (deploymentInput.trim()) {
      const newMethod = deploymentInput.trim();
      if (!formData.deploymentMethods.includes(newMethod)) {
        setFormData((prev) => ({
          ...prev,
          deploymentMethods: [...prev.deploymentMethods, newMethod],
        }));
        
        if (!allDeploymentMethods.includes(newMethod)) {
          setAllDeploymentMethods((prev) => [...prev, newMethod]);
        }
      }
      setDeploymentInput('');
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
        
        if (!allTags.includes(newTag)) {
          const updated = [...allTags, newTag];
          setAllTags(updated);
          localStorage.setItem('appTags', JSON.stringify(updated));
        }
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

  const handleDescriptionChange = (html: string) => {
    setFormData((prev) => ({
      ...prev,
      description: html,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Check file size (max 5MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      toast.error(`File size (${fileSizeInMB.toFixed(2)}MB) exceeds 5MB limit`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.uploadLogo(formData);
      
      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          logo: response.data.filePath, // Store the file path, not base64
        }));
        toast.success('Logo uploaded successfully');
      } else {
        toast.error('Failed to upload logo');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    }
  };

  const addPricingOption = () => {
    if (!newPricing.type || !newPricing.amount) {
      toast.error('Please fill in pricing type and amount');
      return;
    }

    const pricing: PricingOption = {
      id: Math.random().toString(36).substr(2, 9),
      type: newPricing.type as PricingOption['type'],
      amount: newPricing.amount,
      currency: newPricing.currency || '₦',
      description: newPricing.description || '',
      billingCycle: newPricing.billingCycle,
    };

    setFormData((prev) => ({
      ...prev,
      pricingOptions: [...prev.pricingOptions, pricing],
      isFree: false,
    }));

    setNewPricing({
      type: 'one-off',
      amount: '',
      currency: '₦',
      billingCycle: 'one-time',
      description: '',
    });
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
      setIsLoading(true);

      const response = await api.createApp({
        ...formData,
        category: formData.category[0], // Send first category to backend
        deploymentMethod: formData.deploymentMethods, // Convert to backend field name
      });

      if (response.data.success) {
        dispatch(addApp(response.data.app));
        toast.success('App submitted successfully!');
        navigate(`/apps/${response.data.app._id}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit app';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-light mb-8">Submit Your App</h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'features', label: 'Features' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'tech', label: 'Tech & Tags' },
            { id: 'links', label: 'Links' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as SubmitTab)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-light'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Basic Information</h2>

              <div className="space-y-4">
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
                    placeholder="e.g. AutoServe POS System"
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
                    placeholder="One-line description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    Detailed Description *
                  </label>
                  <WysiwygEditor
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe your app in detail. You can format text and add lists."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    App Logo
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer flex items-center gap-2">
                      <Upload size={16} />
                      Upload Logo
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {formData.logo && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logo: '' }))}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-light rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="mt-4 w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                      Categories * (Select one or more)
                    </label>
                    <select
                      onChange={(e) => addCategory(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Add Category</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="ai">AI Apps</option>
                      <option value="erp">Company ERPs</option>
                      <option value="social">Social Apps</option>
                      <option value="video">Video</option>
                      <option value="automobile">Automobile</option>
                      <option value="sports">Sports</option>
                      <option value="ministry">Ministry</option>
                      <option value="government">Government</option>
                      <option value="events">Events</option>
                    </select>
                    {formData.category.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.category.map((cat, index) => (
                          <span key={index} className="badge badge-primary flex items-center gap-2">
                            {cat}
                            <button
                              type="button"
                              onClick={() => removeCategory(index)}
                              className="text-white hover:opacity-70"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                      Distribution Formats (Add one or more)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        list="distributionList"
                        value={distributionFormatInput}
                        onChange={(e) => setDistributionFormatInput(e.target.value)}
                        className="input-field flex-1"
                        placeholder="e.g. Web, Desktop, Mobile..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDistributionFormat())}
                      />
                      <button
                        type="button"
                        onClick={addDistributionFormat}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <datalist id="distributionList">
                      <option value="Web App" />
                      <option value="Executable" />
                      <option value="Source Code" />
                      <option value="Hybrid" />
                      <option value="Mobile App" />
                      <option value="API" />
                      <option value="Docker" />
                      <option value="Cloud-based" />
                    </datalist>
                    {formData.distributionFormat.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.distributionFormat.map((format, index) => (
                          <span key={index} className="badge badge-info flex items-center gap-2">
                            {format}
                            <button
                              type="button"
                              onClick={() => removeDistributionFormat(index)}
                              className="text-white hover:opacity-70"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">App Features</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isSaaS"
                      checked={formData.isSaaS}
                      onChange={handleChange}
                      className="w-4 h-4 rounded"
                    />
                    <span className="font-medium text-gray-900 dark:text-light">SaaS Application</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isOffline"
                      checked={formData.isOffline}
                      onChange={handleChange}
                      className="w-4 h-4 rounded"
                    />
                    <span className="font-medium text-gray-900 dark:text-light">Works Offline</span>
                  </label>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    💡 Mark your app as SaaS if it's a cloud-based service, or as offline-capable if it can work without internet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6 flex items-center gap-2">
                <DollarSign size={28} />
                Pricing Options
              </h2>

              <div className="space-y-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-medium text-gray-900 dark:text-light">Free App (No pricing needed)</span>
                </label>

                {!formData.isFree && (
                  <div className="space-y-4 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-light">Add Pricing Option</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                          Pricing Type
                        </label>
                        <select
                          value={newPricing.type}
                          onChange={(e) =>
                            setNewPricing((prev) => ({ ...prev, type: e.target.value as PricingOption['type'] }))
                          }
                          className="input-field"
                        >
                          <option value="one-off">One-Time Purchase</option>
                          <option value="subscription">Subscription</option>
                          <option value="on-premise">On-Premise License</option>
                          <option value="online-deployment">Online Deployment</option>
                          <option value="custom">Custom Pricing</option>
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
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {(newPricing.type === 'subscription' || newPricing.type === 'online-deployment') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                          Billing Cycle
                        </label>
                        <select
                          value={newPricing.billingCycle}
                          onChange={(e) =>
                            setNewPricing((prev) => ({ ...prev, billingCycle: e.target.value as any }))
                          }
                          className="input-field"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    )}

                    {newPricing.type === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                          Custom Pricing Description
                        </label>
                        <textarea
                          value={newPricing.description}
                          onChange={(e) => setNewPricing((prev) => ({ ...prev, description: e.target.value }))}
                          className="input-field"
                          placeholder="e.g., Contact for custom quotes based on business needs"
                          rows={3}
                        />
                      </div>
                    )}

                    {newPricing.type !== 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={newPricing.description}
                          onChange={(e) => setNewPricing((prev) => ({ ...prev, description: e.target.value }))}
                          className="input-field"
                          placeholder="e.g., Includes 24/7 support"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addPricingOption}
                      className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add Pricing Option
                    </button>
                  </div>
                )}

                {!formData.isFree && formData.pricingOptions.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-light mb-3">Pricing Options Added</h3>
                    <div className="space-y-2">
                      {formData.pricingOptions.map((pricing) => (
                        <div
                          key={pricing.id}
                          className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-light capitalize">
                              {pricing.type.replace('-', ' ')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {pricing.currency}
                              {pricing.amount}{' '}
                              {pricing.billingCycle && `/ ${pricing.billingCycle}`}
                            </p>
                            {pricing.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pricing.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removePricingOption(pricing.id)}
                            className="text-red-600 hover:text-red-700 transition"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tech & Tags Tab */}
          {activeTab === 'tech' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Technologies & Tags</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    Tech Stack (Optional)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      list="techStackList"
                      value={techStackInput}
                      onChange={(e) => setTechStackInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                      className="input-field flex-1"
                      placeholder="e.g. React, Node.js, MongoDB..."
                    />
                    <datalist id="techStackList">
                      {allTechStacks.map((tech) => (
                        <option key={tech} value={tech} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      onClick={addTechStack}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((tech, i) => (
                      <div key={i} className="badge bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechStack(i)}
                          className="text-xs hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    Deployment Methods (Optional)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      list="deploymentList"
                      value={deploymentInput}
                      onChange={(e) => setDeploymentInput(e.target.value)}
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
                      disabled={!deploymentInput.trim()}
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
                    Tags (Optional)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      list="tagsList"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="input-field flex-1"
                      placeholder="e.g. productivity, business, finance..."
                    />
                    <datalist id="tagsList">
                      {allTags.map((tag) => (
                        <option key={tag} value={tag} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, i) => (
                      <div key={i} className="badge bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 flex items-center gap-2">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(i)}
                          className="text-xs hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Links & Resources</h2>

              <div className="space-y-4">
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
                    Live Demo Link
                  </label>
                  <input
                    type="url"
                    name="liveDemo"
                    value={formData.liveDemo}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://demo.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    GitHub Repository
                  </label>
                  <input
                    type="url"
                    name="githubRepository"
                    value={formData.githubRepository}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                    Documentation Link
                  </label>
                  <input
                    type="url"
                    name="documentation"
                    value={formData.documentation}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://docs.example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit & Cancel Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-light dark:bg-dark py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isLoading ? 'Submitting...' : 'Submit App'}
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

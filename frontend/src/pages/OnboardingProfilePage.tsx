import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase } from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import api from '../services/api';
import toast from 'react-hot-toast';

export const OnboardingProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'freelancer' | 'company'>('freelancer');

  // Freelancer form state
  const [freelancerForm, setFreelancerForm] = useState({
    fullName: '',
    phone: '',
    personalWebsite: '',
    techStack: '',
    about: '',
    expertise: '',
    portfolio: '',
  });

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    logo: '',
    information: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    expertise: '',
    employees: '',
    founded: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'AppBuilder') {
      navigate('/');
      toast.error('You must register as an AppBuilder');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const handleFreelancerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFreelancerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const response = await api.createFreelancerProfile({
        fullName: freelancerForm.fullName,
        phone: freelancerForm.phone,
        personalWebsite: freelancerForm.personalWebsite || undefined,
        techStack: freelancerForm.techStack.split(',').map((s) => s.trim()),
        about: freelancerForm.about,
        expertise: freelancerForm.expertise.split(',').map((s) => s.trim()),
        portfolio: freelancerForm.portfolio
          ? freelancerForm.portfolio.split(',').map((s) => s.trim())
          : [],
      });

      if (response.data.success) {
        toast.success('Freelancer profile created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create profile';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const response = await api.createCompanyProfile({
        companyName: companyForm.companyName,
        logo: companyForm.logo || undefined,
        information: companyForm.information,
        address: companyForm.address,
        email: companyForm.email,
        phone: companyForm.phone,
        website: companyForm.website || undefined,
        expertise: companyForm.expertise.split(',').map((s) => s.trim()),
        employees: companyForm.employees ? parseInt(companyForm.employees) : undefined,
        founded: companyForm.founded || undefined,
      });

      if (response.data.success) {
        toast.success('Company profile created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create profile';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-light mb-4">
            Complete Your Profile
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Tell us more about yourself or your company
          </p>
        </div>

        {/* Profile Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => setUserType('freelancer')}
            className={`card text-center p-8 cursor-pointer transition ${
              userType === 'freelancer'
                ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-gray-800'
                : 'hover:shadow-lg'
            }`}
          >
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-light mb-2">
              Freelancer
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Independent developer or designer
            </p>
          </button>

          <button
            onClick={() => setUserType('company')}
            className={`card text-center p-8 cursor-pointer transition ${
              userType === 'company'
                ? 'ring-2 ring-purple-600 bg-purple-50 dark:bg-gray-800'
                : 'hover:shadow-lg'
            }`}
          >
            <Building2 className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-light mb-2">
              Company
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Business or organization
            </p>
          </button>
        </div>

        {/* Forms */}
        <div className="card">
          {userType === 'freelancer' ? (
            <form onSubmit={handleSubmitFreelancer} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light">
                Freelancer Profile
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={freelancerForm.fullName}
                  onChange={handleFreelancerChange}
                  required
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={freelancerForm.phone}
                  onChange={handleFreelancerChange}
                  required
                  className="input-field"
                  placeholder="+234 8012345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Personal Website (Optional)
                </label>
                <input
                  type="url"
                  name="personalWebsite"
                  value={freelancerForm.personalWebsite}
                  onChange={handleFreelancerChange}
                  className="input-field"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  name="techStack"
                  value={freelancerForm.techStack}
                  onChange={handleFreelancerChange}
                  required
                  className="input-field"
                  placeholder="React, Node.js, MongoDB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  About You
                </label>
                <textarea
                  name="about"
                  value={freelancerForm.about}
                  onChange={handleFreelancerChange}
                  required
                  rows={4}
                  className="input-field"
                  placeholder="Tell us about yourself and your experience..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Expertise Areas (comma-separated)
                </label>
                <input
                  type="text"
                  name="expertise"
                  value={freelancerForm.expertise}
                  onChange={handleFreelancerChange}
                  required
                  className="input-field"
                  placeholder="Web Development, Mobile Apps, API Design"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Portfolio Links (comma-separated, Optional)
                </label>
                <input
                  type="text"
                  name="portfolio"
                  value={freelancerForm.portfolio}
                  onChange={handleFreelancerChange}
                  className="input-field"
                  placeholder="https://github.com/username, https://project.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitCompany} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light">
                Company Profile
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={companyForm.companyName}
                  onChange={handleCompanyChange}
                  required
                  className="input-field"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  name="logo"
                  value={companyForm.logo}
                  onChange={handleCompanyChange}
                  className="input-field"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Company Information
                </label>
                <textarea
                  name="information"
                  value={companyForm.information}
                  onChange={handleCompanyChange}
                  required
                  rows={4}
                  className="input-field"
                  placeholder="Tell us about your company..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={companyForm.address}
                  onChange={handleCompanyChange}
                  required
                  className="input-field"
                  placeholder="Company address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={companyForm.email}
                  onChange={handleCompanyChange}
                  required
                  className="input-field"
                  placeholder="company@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={companyForm.phone}
                  onChange={handleCompanyChange}
                  required
                  className="input-field"
                  placeholder="+234 8012345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={companyForm.website}
                  onChange={handleCompanyChange}
                  className="input-field"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Expertise Areas (comma-separated)
                </label>
                <input
                  type="text"
                  name="expertise"
                  value={companyForm.expertise}
                  onChange={handleCompanyChange}
                  required
                  className="input-field"
                  placeholder="Software Development, Consulting, IT Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Number of Employees (Optional)
                </label>
                <input
                  type="number"
                  name="employees"
                  value={companyForm.employees}
                  onChange={handleCompanyChange}
                  className="input-field"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                  Year Founded (Optional)
                </label>
                <input
                  type="text"
                  name="founded"
                  value={companyForm.founded}
                  onChange={handleCompanyChange}
                  className="input-field"
                  placeholder="2020"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

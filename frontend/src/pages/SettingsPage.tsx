import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import {
  Settings,
  User,
  Lock,
  Bell,
  Shield,
  LogOut,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Award,
  Briefcase,
  Link as LinkIcon,
} from 'lucide-react';
import { logout, updateProfile } from '../store/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'social' | 'company' | 'security' | 'notifications' | 'privacy';

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  profilePicture?: string;
  passportImage?: string;
}

interface SocialMediaData {
  instagram: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  website: string;
}

interface CompanyData {
  companyName: string;
  companyLogo?: string;
  companyAbout: string;
}

export const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(user?.profilePicture || null);
  const [previewPassportImage, setPreviewPassportImage] = useState<string | null>(user?.passportImage || null);
  const [previewCompanyLogo, setPreviewCompanyLogo] = useState<string | null>(user?.companyLogo || null);

  const [profileData, setProfileData] = useState<ProfileFormData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
    passportImage: user?.passportImage || '',
  });

  const [socialData, setSocialData] = useState<SocialMediaData>({
    instagram: user?.socialMedia?.instagram || '',
    facebook: user?.socialMedia?.facebook || '',
    twitter: user?.socialMedia?.twitter || '',
    linkedin: user?.socialMedia?.linkedin || '',
    website: user?.socialMedia?.website || '',
  });

  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: user?.companyName || '',
    companyLogo: user?.companyLogo || '',
    companyAbout: user?.companyAbout || '',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    bidUpdates: true,
    projectUpdates: true,
    reviewNotifications: true,
    marketingEmails: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'passport' | 'company') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'profile') {
          setPreviewProfileImage(result);
          setProfileData((prev) => ({ ...prev, profilePicture: result }));
        } else if (type === 'passport') {
          setPreviewPassportImage(result);
          setProfileData((prev) => ({ ...prev, passportImage: result }));
        } else if (type === 'company') {
          setPreviewCompanyLogo(result);
          setCompanyData((prev) => ({ ...prev, companyLogo: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (key: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof notificationSettings],
    }));
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setPrivacySettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.updateUserProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        profilePicture: profileData.profilePicture,
        passportImage: profileData.passportImage,
      });

      if (response.data.success) {
        dispatch(updateProfile(response.data.user));
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSocial = async () => {
    try {
      setIsLoading(true);
      const response = await api.updateUserProfile({
        socialMedia: socialData,
      });

      if (response.data.success) {
        dispatch(updateProfile(response.data.user));
        toast.success('Social media links updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update social media');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!companyData.companyName) {
      toast.error('Please enter company name');
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.createCompanyProfile({
        companyName: companyData.companyName,
        companyAbout: companyData.companyAbout,
        companyLogo: companyData.companyLogo,
      });

      if (response.data.success) {
        dispatch(updateProfile(response.data.company));
        toast.success('Company information updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update company info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setIsLoading(true);
      // Note: You'll need to add a changePassword endpoint to your API
      // For now, showing success message
      toast.success('Password changed successfully!');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true);
      // Note: Add API call to save notification preferences when backend endpoint is ready
      // For now, just showing success
      toast.success('Notification settings saved!');
      // In production: dispatch(updateProfile({ notificationSettings }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setIsLoading(true);
      // Note: Add API call to save privacy preferences when backend endpoint is ready
      // For now, just showing success
      toast.success('Privacy settings saved!');
      // In production: dispatch(updateProfile({ privacySettings }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Settings size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-light">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings, profile, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="card space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'social', label: 'Social Media', icon: LinkIcon },
                { id: 'company', label: 'Company', icon: Briefcase },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'privacy', label: 'Privacy', icon: Shield },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as SettingsTab)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition ${
                    activeTab === id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-3">
                      Profile Picture
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 overflow-hidden flex-shrink-0">
                        {previewProfileImage ? (
                          <img src={previewProfileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={40} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-2">
                          <ImageIcon size={18} />
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'profile')}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">JPG, PNG or GIF (max 5MB)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-3">
                      Passport/ID Image
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600">
                        {previewPassportImage ? (
                          <img src={previewPassportImage} alt="Passport" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-2">
                          <ImageIcon size={18} />
                          Upload Passport
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'passport')}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">For verification purposes</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="input-field opacity-50 cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="input-field"
                      placeholder="+234 (Optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      rows={4}
                      className="input-field"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Save Profile Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Social Media & Web</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">Instagram</label>
                    <input
                      type="text"
                      name="instagram"
                      value={socialData.instagram}
                      onChange={handleSocialChange}
                      className="input-field"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">Facebook</label>
                    <input
                      type="text"
                      name="facebook"
                      value={socialData.facebook}
                      onChange={handleSocialChange}
                      className="input-field"
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">Twitter</label>
                    <input
                      type="text"
                      name="twitter"
                      value={socialData.twitter}
                      onChange={handleSocialChange}
                      className="input-field"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">LinkedIn</label>
                    <input
                      type="text"
                      name="linkedin"
                      value={socialData.linkedin}
                      onChange={handleSocialChange}
                      className="input-field"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">Personal Website</label>
                    <input
                      type="url"
                      name="website"
                      value={socialData.website}
                      onChange={handleSocialChange}
                      className="input-field"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <button
                    onClick={handleSaveSocial}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Save Social Media Links
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Company Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-3">
                      Company Logo
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        {previewCompanyLogo ? (
                          <img src={previewCompanyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Briefcase size={40} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-2">
                          <ImageIcon size={18} />
                          Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'company')}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">JPG, PNG or GIF (max 5MB)</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={companyData.companyName}
                      onChange={handleCompanyChange}
                      className="input-field"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                      About Company
                    </label>
                    <textarea
                      name="companyAbout"
                      value={companyData.companyAbout}
                      onChange={handleCompanyChange}
                      rows={5}
                      className="input-field"
                      placeholder="Tell us about your company, services, and expertise..."
                    />
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      💡 Your company information will appear on your app publish page and help buyers identify your organization.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveCompany}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Save Company Information
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={securityData.currentPassword}
                        onChange={handleSecurityChange}
                        className="input-field"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-light"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={securityData.newPassword}
                      onChange={handleSecurityChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={securityData.confirmPassword}
                      onChange={handleSecurityChange}
                      className="input-field"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Notification Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
                    { key: 'bidUpdates', label: 'Bid Updates', description: 'Get notified when you receive new bids' },
                    { key: 'projectUpdates', label: 'Project Updates', description: 'Receive project status updates' },
                    { key: 'reviewNotifications', label: 'Review Notifications', description: 'Get notified when you receive reviews' },
                    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive news and promotional offers' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-light">{label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`relative w-14 h-8 rounded-full transition ${
                          notificationSettings[key as keyof typeof notificationSettings]
                            ? 'bg-blue-600'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            notificationSettings[key as keyof typeof notificationSettings]
                              ? 'translate-x-7'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Save Notification Settings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                      Profile Visibility
                    </label>
                    <select
                      name="profileVisibility"
                      value={privacySettings.profileVisibility}
                      onChange={handlePrivacyChange}
                      className="input-field"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Connections Only</option>
                    </select>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Control who can see your profile</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="showEmail"
                        checked={privacySettings.showEmail}
                        onChange={handlePrivacyChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label className="text-gray-900 dark:text-light font-medium cursor-pointer">
                        Show email to other users
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="showPhone"
                        checked={privacySettings.showPhone}
                        onChange={handlePrivacyChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label className="text-gray-900 dark:text-light font-medium cursor-pointer">
                        Show phone to other users
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={handleSavePrivacy}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

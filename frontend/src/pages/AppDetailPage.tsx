import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Download, Github, Globe, FileText, Play, Share2, Heart, MessageSquare } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setSelectedApp, setLoading, setError } from '../store/appSlice';
import { Loading } from '../components/Loading';
import { AppRequestModal } from '../components/AppRequestModal';
import { ShareModal } from '../components/ShareModal';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AppDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedApp, isLoading } = useAppSelector((state) => state.apps);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);
  const [userAppRequest, setUserAppRequest] = useState<any>(null);
  const [isCheckingRequest, setIsCheckingRequest] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [appRequests, setAppRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Fetch app details
  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;

      try {
        dispatch(setLoading(true));
        const response = await api.getApp(id);

        if (response.data.success) {
          dispatch(setSelectedApp(response.data.app));
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to load app';
        dispatch(setError(message));
        toast.error(message);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchApp();
  }, [id, dispatch]);

  // Check if app is favorited
  useEffect(() => {
    const checkFavorite = async () => {
      if (!id || !isAuthenticated) {
        setIsCheckingFavorite(false);
        return;
      }

      try {
        const response = await api.isFavorited(id);
        setIsFavorite(response.data.isFavorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      } finally {
        setIsCheckingFavorite(false);
      }
    };

    checkFavorite();
  }, [id, isAuthenticated]);

  // Check if user has already submitted a request for this app
  useEffect(() => {
    const checkUserRequest = async () => {
      if (!id || !isAuthenticated || !user?.id) {
        setIsCheckingRequest(false);
        return;
      }

      try {
        setIsCheckingRequest(true);
        const response = await api.getUserAppRequests(1, 50);
        
        // Find if user has already submitted a request for this app
        const existingRequest = response.data.appRequests?.find(
          (req: any) => req.appId === id || req.app?._id === id || req.app?.id === id
        );

        if (existingRequest) {
          setUserAppRequest(existingRequest);
        }
      } catch (error) {
        console.error('Error checking user request:', error);
      } finally {
        setIsCheckingRequest(false);
      }
    };

    checkUserRequest();
  }, [id, isAuthenticated, user?.id]);

  // Fetch app requests for publishers
  useEffect(() => {
    const fetchAppRequests = async () => {
      if (!id || !selectedApp || selectedApp.userId !== user?.id) {
        return;
      }

      try {
        setIsLoadingRequests(true);
        const response = await api.getAppRequests(id, 1, 50);
        setAppRequests(response.data.requests || []);
      } catch (error) {
        console.error('Error fetching app requests:', error);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchAppRequests();
  }, [id, selectedApp, user?.id]);


  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await api.removeFavorite(id!);
        toast.success('Removed from favorites');
      } else {
        await api.addFavorite(id!);
        toast.success('Added to favorites');
      }
      setIsFavorite(!isFavorite);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error updating favorites';
      toast.error(message);
    }
  };

  const handleGetApp = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to request an app');
      navigate('/login');
      return;
    }

    if (selectedApp?.officialWebsite) {
      window.open(selectedApp.officialWebsite, '_blank');
    } else {
      setIsRequestModalOpen(true);
    }
  };

  const handleTryDemo = () => {
    if (!selectedApp?.liveDemo) {
      toast.error('Demo not available for this app');
      return;
    }
    window.open(selectedApp.liveDemo, '_blank');
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleReply = async (requestId: string) => {
    if (!replyMessage.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }

    try {
      setIsSubmittingReply(true);
      const response = await api.replyToAppRequest(requestId, replyMessage);
      
      if (response.data.success) {
        toast.success('Reply sent successfully!');
        setReplyMessage('');
        setReplyingToId(null);
        
        // Refresh app requests
        if (id) {
          const res = await api.getAppRequests(id, 1, 50);
          setAppRequests(res.data.requests || []);
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reply';
      toast.error(message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (isLoading) return <Loading />;
  if (!selectedApp) return <div className="text-center py-12">App not found</div>;

  const app = selectedApp;
  const priceDisplay = app.isFree ? 'FREE' : `₦${app.price?.toLocaleString()}`;
  const safeDescription = app.description
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 items-start">
            <img src={app.logo} alt={app.title} className="w-24 h-24 rounded-lg object-cover" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{app.title}</h1>
              <p className="text-lg text-blue-100 mb-4">{app.subtitle}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="font-semibold">
                    {typeof app.rating === 'number' ? app.rating.toFixed(1) : '0'} ({app.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Download size={20} />
                  <span className="font-semibold">{(app.downloadCount / 1000).toFixed(1)}k downloads</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="badge bg-white/20 text-white">{priceDisplay}</span>
                <span className="badge bg-white/20 text-white">{app.isOffline ? 'Offline' : 'Online'}</span>
                {app.isSaaS && <span className="badge bg-white/20 text-white">SaaS</span>}
              </div>
            </div>

            <button
              onClick={handleToggleFavorite}
              disabled={isCheckingFavorite}
              className={`p-3 rounded-lg transition ${
                isFavorite
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="card mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-4">About</h2>
              <div
                className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 space-y-2"
                dangerouslySetInnerHTML={{ __html: safeDescription }}
              />

              {/* Screenshots */}
              {Array.isArray(app.screenshots) && app.screenshots.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-light mb-4">Screenshots</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {app.screenshots.map((screenshot, i) => (
                      <img
                        key={i}
                        src={screenshot}
                        alt={`Screenshot ${i + 1}`}
                        className="rounded-lg w-full object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-light mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(app.techStack) && app.techStack.map((tech) => (
                    <span key={tech} className="badge">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-light mb-4">Resources</h3>
                <div className="space-y-3">
                  {app.liveDemo && (
                    <a
                      href={app.liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition"
                    >
                      <Play className="text-blue-600 dark:text-blue-400" size={20} />
                      <span className="text-blue-600 dark:text-blue-400 font-medium">Live Demo</span>
                    </a>
                  )}
                  {app.officialWebsite && (
                    <a
                      href={app.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition"
                    >
                      <Globe className="text-blue-600 dark:text-blue-400" size={20} />
                      <span className="text-blue-600 dark:text-blue-400 font-medium">Official Website</span>
                    </a>
                  )}
                  {app.githubRepository && (
                    <a
                      href={app.githubRepository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition"
                    >
                      <Github className="text-blue-600 dark:text-blue-400" size={20} />
                      <span className="text-blue-600 dark:text-blue-400 font-medium">GitHub Repository</span>
                    </a>
                  )}
                  {app.documentation && (
                    <a
                      href={app.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition"
                    >
                      <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                      <span className="text-blue-600 dark:text-blue-400 font-medium">Documentation</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* CTA Card */}
            <div className="card sticky top-20 mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-light mb-6">Get This App</h3>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleTryDemo}
                  disabled={!selectedApp?.liveDemo}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Play size={18} />
                  Try Demo
                </button>
                <button
                  onClick={handleGetApp}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                >
                  Get App
                </button>
                <button
                  onClick={handleShare}
                  className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-light font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>

              {/* Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Distribution</p>
                  <p className="text-gray-900 dark:text-light capitalize">{app.distributionFormat}</p>
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Category</p>
                  <p className="text-gray-900 dark:text-light">{app.category?.name || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Released</p>
                  <p className="text-gray-900 dark:text-light">{new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Request Display */}
      {userAppRequest && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-600 dark:border-blue-400">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-light mb-2">
                  ✓ Your Request
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  You have already submitted a request for this app. Requests can only be submitted once and cannot be edited.
                </p>
              </div>
              <span className={`badge ${userAppRequest.status === 'pending' ? 'badge-warning' : userAppRequest.status === 'approved' ? 'badge-success' : 'badge-error'}`}>
                {userAppRequest.status || 'pending'}
              </span>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-900 dark:text-light whitespace-pre-wrap">{userAppRequest.message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Submitted on {new Date(userAppRequest.createdAt).toLocaleDateString()} at {new Date(userAppRequest.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* App Requests Section - Only for Publisher */}
      {selectedApp && selectedApp.userId === user?.id && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare size={24} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light">
                App Requests ({appRequests.length})
              </h2>
            </div>

            {isLoadingRequests ? (
              <p className="text-gray-600 dark:text-gray-400">Loading requests...</p>
            ) : appRequests.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No requests yet. Users will appear here when they request this app.
              </p>
            ) : (
              <div className="space-y-4">
                {appRequests.map((request: any) => (
                  <div key={request.id || request._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-light">
                            {request.requesterName || request.user?.fullName || 'Anonymous User'}
                          </p>
                          <div className="space-y-1 mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📧 {request.requesterEmail || request.user?.email || 'No email provided'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📱 {request.requesterPhone || 'No phone provided'}
                            </p>
                          </div>
                        </div>
                        <span className={`badge text-xs whitespace-nowrap ${
                          request.status === 'approved'
                            ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                            : request.status === 'rejected'
                            ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100'
                        }`}>
                          {request.status || 'pending'}
                        </span>
                      </div>

                      <div className="my-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">User Message:</p>
                        <p className="text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          {request.message}
                        </p>
                      </div>

                      {request.replyMessage && (
                        <div className="my-4 bg-blue-50 dark:bg-blue-900/20 rounded p-3 border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-2">📤 Your Reply:</p>
                          <p className="text-gray-700 dark:text-gray-300">{request.replyMessage}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Replied on {new Date(request.replyAt).toLocaleDateString()} at{' '}
                            {new Date(request.replyAt).toLocaleTimeString()}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Requested on {new Date(request.createdAt).toLocaleDateString()} at{' '}
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </p>

                      {!request.replyMessage && (
                        <>
                          {replyingToId === (request.id || request._id) ? (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                              <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
                                Send Reply
                              </label>
                              <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type your reply message..."
                                rows={4}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-light placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleReply(request.id || request._id)}
                                  disabled={isSubmittingReply || !replyMessage.trim()}
                                  className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                  {isSubmittingReply ? 'Sending...' : 'Send Reply'}
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingToId(null);
                                    setReplyMessage('');
                                  }}
                                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-light font-semibold rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingToId(request.id || request._id)}
                              className="mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition text-sm"
                            >
                              Reply
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        appTitle={selectedApp?.title || 'App'}
        appUrl={window.location.href}
      />

      {/* App Request Modal */}
      {!userAppRequest && (
        <AppRequestModal
          appId={id!}
          appTitle={selectedApp?.title || ''}
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          onSuccess={() => {
            // Refetch app requests for publisher
            if (selectedApp && selectedApp.userId === user?.id) {
              const refetchRequests = async () => {
                try {
                  const response = await api.getAppRequests(id!, 1, 50);
                  setAppRequests(response.data.requests || []);
                } catch (error) {
                  console.error('Error refetching app requests:', error);
                }
              };
              refetchRequests();
            }

            // Refetch user requests for requester
            const checkUserRequest = async () => {
              if (!id || !isAuthenticated || !user?.id) return;
              try {
                const response = await api.getUserAppRequests(1, 50);
                const existingRequest = response.data.appRequests?.find(
                  (req: any) => req.appId === id || req.app?._id === id || req.app?.id === id
                );
                if (existingRequest) {
                  setUserAppRequest(existingRequest);
                }
              } catch (error) {
                console.error('Error checking user request:', error);
              }
            };
            checkUserRequest();
          }}
        />
      )}
    </div>
  );
};

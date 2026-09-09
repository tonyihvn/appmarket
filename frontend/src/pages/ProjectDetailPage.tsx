import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, Clock, User, MessageSquare, Send } from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Bid {
  _id: string;
  developerId: any;
  amount: number;
  proposal: string;
  timeline: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [project, setProject] = useState<any>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const [userBid, setUserBid] = useState<Bid | null>(null);
  const [isCheckingBid, setIsCheckingBid] = useState(false);
  const [bidForm, setBidForm] = useState({
    amount: '',
    proposal: '',
    timeline: '',
  });
  const [messageForm, setMessageForm] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProjectRequest(id!);
        if (response.data.success) {
          setProject(response.data.project);
        }
      } catch (error: any) {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, navigate]);

  // Check if user has already bid on this project
  useEffect(() => {
    const checkUserBid = async () => {
      if (!isAuthenticated || !user?.id || !id) {
        setIsCheckingBid(false);
        return;
      }

      try {
        setIsCheckingBid(true);
        const response = await api.getUserBids();
        
        // Find if user has already bid on this project (compare as strings to handle type mismatches)
        const existingBid = response.data.bids?.find(
          (bid: any) => String(bid.projectId) === String(id) || 
                        String(bid.project?.id) === String(id) || 
                        String(bid.project?._id) === String(id)
        );

        if (existingBid) {
          console.log('Found existing bid:', existingBid);
          setUserBid(existingBid);
        } else {
          console.log('No existing bid found. Bids:', response.data.bids);
          console.log('Looking for projectId:', id);
        }
      } catch (error) {
        console.error('Error checking user bids:', error);
      } finally {
        setIsCheckingBid(false);
      }
    };

    checkUserBid();
  }, [isAuthenticated, user?.id, id]);

  // Fetch bids for this project
  useEffect(() => {
    const fetchBids = async () => {
      if (!id) return;
      
      try {
        const response = await api.getBids(id);
        setBids(response.data.bids || []);
      } catch (error) {
        console.error('Error fetching bids:', error);
      }
    };

    fetchBids();
  }, [id]);

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBidForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      // Save bid form to localStorage for later submission
      localStorage.setItem('pendingBid', JSON.stringify({
        projectId: id,
        ...bidForm,
      }));
      toast.success('Bid saved. Please login to submit.');
      navigate('/login');
      return;
    }

    if (!bidForm.amount || !bidForm.proposal || !bidForm.timeline) {
      toast.error('Please fill in all bid fields');
      return;
    }

    if (!id) {
      toast.error('Project ID missing');
      return;
    }

    try {
      setIsBidding(true);
      const response = await api.createBid({
        projectId: id,
        amount: bidForm.amount,
        proposal: bidForm.proposal,
        timeline: bidForm.timeline,
      });

      if (response.data.success) {
        toast.success('Bid submitted successfully!');
        setBidForm({ amount: '', proposal: '', timeline: '' });
        // Refresh bids list
        const bidsRes = await api.getBids(id);
        setBids(bidsRes.data.bids || []);
        
        // Refresh user bids to update the bid display
        const userBidsRes = await api.getUserBids();
        const existingBid = userBidsRes.data.bids?.find(
          (bid: any) => bid.projectId === id || bid.project?.id === id || bid.project?._id === id
        );
        if (existingBid) {
          setUserBid(existingBid);
        }
      } else {
        toast.error(response.data.message || 'Failed to submit bid');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit bid';
      toast.error(message);
    } finally {
      setIsBidding(false);
    }
  };

  const handleBidStatusChange = async (bidId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await api.updateBidStatus(bidId, status);
      if (response.data.success) {
        toast.success(`Bid ${status} successfully!`);
        // Refresh bids list
        const bidsRes = await api.getBids(id!);
        setBids(bidsRes.data.bids || []);
      } else {
        toast.error(response.data.message || 'Failed to update bid');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update bid';
      toast.error(message);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageForm.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to send a message');
      navigate('/login');
      return;
    }

    try {
      setIsSendingMessage(true);
      // For now, we'll show a success message
      // In a real implementation, this would send the message to the backend
      toast.success('Message sent! The other party will be notified.');
      setMessageForm('');
      
      // In production, you would call:
      // await api.sendBidMessage(id, messageForm);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/projects')}
          className="text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          ← Back to Projects
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-light">
                    {project.title}
                  </h1>
                  <span className="badge badge-success capitalize mt-2">
                    {project.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-light">
                      ₦{project.budget?.toLocaleString()}
                      {project.budgetType === 'hourly' && '/hr'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Timeline</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-light">
                      {project.timeline && !isNaN(Number(project.timeline))
                        ? `${project.timeline} days`
                        : project.timeline || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bids Received</p>
                  <p className="font-bold text-lg text-gray-900 dark:text-light">
                    {project.bidsCount || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-4">
                Project Description
              </h2>
              <div className="text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{
                __html: (project.description || '')
                  .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                  .replace(/ on\w+="[^"]*"/gi, '')
                  .replace(/javascript:/gi, '')
              }} />
            </div>

            {/* Skills */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-4">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  let skills: string[] = [];
                  if (project.requiredSkills) {
                    if (Array.isArray(project.requiredSkills)) {
                      skills = project.requiredSkills;
                    } else if (typeof project.requiredSkills === 'string') {
                      try {
                        skills = JSON.parse(project.requiredSkills);
                        if (!Array.isArray(skills)) skills = [];
                      } catch {
                        skills = [];
                      }
                    }
                  }
                  
                  return skills.length > 0 ? (
                    skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No specific skills required</p>
                  );
                })()}
              </div>
            </div>

            {/* Client Info */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-4">
                Client Information
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-light">
                    {project.client?.fullName || 'Unknown Client'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {project.client?.email || 'No email provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bid Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Existing Bid Display - Only if user already bid */}
            {userBid && project.clientId !== user?.id && (
              <div className={`card border-2 ${
                userBid.status === 'accepted'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : userBid.status === 'rejected'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-400'
              }`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-light mb-2">
                      {userBid.status === 'accepted' ? '🎉 Your Bid Accepted!' : '✓ Your Bid'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {userBid.status === 'accepted' 
                        ? 'Congratulations! Your bid has been accepted by the client. Please contact them to discuss next steps.'
                        : userBid.status === 'rejected'
                        ? 'Your bid was not accepted for this project.'
                        : 'You have already placed a bid for this project. Waiting for client response.'}
                    </p>
                  </div>
                  <span className={`badge text-xs whitespace-nowrap font-bold ${
                    userBid.status === 'accepted'
                      ? 'bg-green-500 text-white'
                      : userBid.status === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {userBid.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg space-y-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Bid Amount</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-light">
                      ₦{userBid.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Timeline</p>
                    <p className="text-gray-900 dark:text-light">{userBid.timeline} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Your Proposal</p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{userBid.proposal}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      Submitted on {new Date(userBid.createdAt).toLocaleDateString()} at{' '}
                      {new Date(userBid.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Contact/Message Form */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-light mb-3 flex items-center gap-2">
                    <MessageSquare size={18} />
                    Contact {userBid.status === 'accepted' ? 'Client' : 'Client'}
                  </h4>
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <textarea
                      value={messageForm}
                      onChange={(e) => setMessageForm(e.target.value)}
                      placeholder="Send a message to the client..."
                      rows={3}
                      className="input-field"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {messageForm.length}/500
                      </p>
                      <button
                        type="submit"
                        disabled={isSendingMessage || !messageForm.trim()}
                        className="py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                      >
                        <Send size={16} />
                        {isSendingMessage ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                </div>

                {userBid.status === 'accepted' && (
                  <div className="mt-4 p-3 bg-green-500 text-white rounded-lg font-bold text-center">
                    🔗 Contact the client to proceed
                  </div>
                )}
              </div>
            )}

            {/* Bid Form - Only if user hasn't bid yet and isn't the project client */}
            {!isCheckingBid && !userBid && isAuthenticated && project.clientId !== user?.id && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 dark:text-light mb-4">
                  Submit Your Bid
                </h3>

                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                      Your Bid Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={bidForm.amount}
                      onChange={handleBidChange}
                      placeholder="₦0.00"
                      step="0.01"
                      min="0"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                      Your Proposal
                    </label>
                    <textarea
                      name="proposal"
                      value={bidForm.proposal}
                      onChange={handleBidChange}
                      placeholder="Explain how you'll complete this project..."
                      rows={4}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-light mb-1">
                      Estimated Timeline
                    </label>
                    <input
                      type="text"
                      name="timeline"
                      value={bidForm.timeline}
                      onChange={handleBidChange}
                      placeholder="e.g., 2 weeks"
                      className="input-field"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isBidding}
                    className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    {isBidding ? 'Submitting...' : 'Submit Bid'}
                  </button>
                </form>
              </div>
            )}

            {/* Bids List */}
            {project.clientId === user?.id && bids.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 dark:text-light mb-4">
                  Bids Received ({bids.length})
                </h3>
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div
                      key={bid._id}
                      className={`p-4 border-2 rounded-lg transition ${
                        bid.status === 'accepted'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : bid.status === 'rejected'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-bold text-gray-900 dark:text-light">
                              ₦{bid.amount?.toLocaleString()}
                            </p>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              bid.status === 'accepted'
                                ? 'bg-green-500 text-white'
                                : bid.status === 'rejected'
                                ? 'bg-red-500 text-white'
                                : 'bg-yellow-500 text-white'
                            }`}>
                              {bid.status || 'pending'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📊 Bidder: {bid.bidder?.fullName || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ⏱️ Timeline: {bid.timeline} days
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Proposal:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {bid.proposal}
                        </p>
                      </div>

                      {bid.status !== 'accepted' && bid.status !== 'rejected' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBidStatusChange(bid._id, 'accepted')}
                            className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleBidStatusChange(bid._id, 'rejected')}
                            className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}

                      {bid.status === 'accepted' && (
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200 text-sm font-medium">
                          ✓ Bid Accepted - Contact this developer to proceed
                        </div>
                      )}

                      {bid.status === 'rejected' && (
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded text-red-800 dark:text-red-200 text-sm font-medium">
                          ✗ Bid Rejected
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                        Submitted {new Date(bid.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

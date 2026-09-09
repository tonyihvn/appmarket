import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setLoading } from '../store/appSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Loading } from '../components/Loading';

export const ProjectsPage = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setLoadingState] = useState(false);
  const [activeTab, setActiveTab] = useState<'open' | 'bidding' | 'active'>('open');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingState(true);

        let response;
        if (activeTab === 'open') {
          response = await api.getProjectRequests({ limit: 50 });
        } else if (activeTab === 'bidding') {
          response = await api.getUserBids();
        } else {
          response = await api.getUserProjects();
        }

        if (response.data.success) {
          setProjects(response.data.projects || response.data.requests || response.data.bids || []);
        } else if (response.data.projects) {
          setProjects(response.data.projects || []);
        } else if (response.data.requests) {
          setProjects(response.data.requests || []);
        } else if (response.data.bids) {
          setProjects(response.data.bids || []);
        }
      } catch (error: any) {
        console.error('Fetch error:', error);
        const message = error.response?.data?.message || 'Failed to fetch projects';
        toast.error(message);
        setProjects([]);
      } finally {
        setLoadingState(false);
      }
    };

    fetchProjects();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-light">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Find and bid on custom development projects
            </p>
          </div>

          {isAuthenticated && (
            <Link
              to="/request-app"
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Request App
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          {['open', 'bidding', 'active'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-light'
              }`}
            >
              {tab === 'open' && 'Open Projects'}
              {tab === 'bidding' && 'My Bids'}
              {tab === 'active' && 'Active Projects'}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="card text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-light mb-2">
                  No projects found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTab === 'open'
                    ? 'Check back soon for new projects!'
                    : 'You have no projects in this category yet.'}
                </p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="card hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-light">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {project.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                    </div>
                    <span className="badge badge-success capitalize">{project.status}</span>
                  </div>

                  <div className="flex flex-wrap gap-6 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} className="text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Budget</p>
                        <p className="font-bold text-gray-900 dark:text-light">
                          {project.budgetType === 'hourly' ? '₦' : '₦'}{project.budget?.toLocaleString()} {project.budgetType === 'hourly' ? '/hr' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Timeline</p>
                        <p className="font-bold text-gray-900 dark:text-light">
                          {project.timeline && !isNaN(Number(project.timeline))
                            ? `${project.timeline} days`
                            : project.timeline || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Bids</p>
                      <p className="font-bold text-gray-900 dark:text-light">
                        {project.bidsCount || 0} bids
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(Array.isArray(project.requiredSkills) ? project.requiredSkills : [])?.map((skill: string) => (
                      <span
                        key={skill}
                        className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    View & Bid
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

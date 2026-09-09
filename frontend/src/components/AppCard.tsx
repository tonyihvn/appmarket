import { Link } from 'react-router-dom';
import { Star, Download, ExternalLink } from 'lucide-react';
import { App } from '../types';

interface AppCardProps {
  app: App;
}

export const AppCard = ({ app }: AppCardProps) => {
  const priceDisplay = app.isFree ? 'FREE' : (app.price ? `₦${app.price?.toLocaleString()}` : 'Contact for Price');
  const modeType = app.isOffline ? 'Offline' : 'Online';
  const plainDescription = app.description.replace(/<[^>]*>/g, ' ').trim();

  return (
    <Link to={`/apps/${app._id}`}>
      <div className="card h-full hover:shadow-xl transition-all cursor-pointer">
        {/* App Header */}
        <div className="flex gap-4 mb-4">
          <img src={app.logo} alt={app.title} className="w-12 h-12 rounded-lg object-cover" />
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-light line-clamp-1">{app.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{app.subtitle}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{plainDescription}</p>

        {/* Price & Mode */}
        <div className="flex gap-2 mb-4">
          <span className="badge">{priceDisplay}</span>
          <span className="badge badge-success">{modeType}</span>
        </div>

        {/* Tech Stack */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {Array.isArray(app.techStack) && app.techStack.slice(0, 3).map((tech) => (
              <span key={tech} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                {tech}
              </span>
            ))}
            {Array.isArray(app.techStack) && app.techStack.length > 3 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                +{app.techStack.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Rating & Download */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{typeof app.rating === 'number' ? app.rating.toFixed(1) : '0'}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">({app.reviewCount || 0})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Download size={16} />
            <span className="text-sm">{(app.downloadCount / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
            Demo
          </button>
          <button className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-light text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            View
          </button>
          {app.liveDemo && (
            <a
              href={app.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
    </Link>
  );
};

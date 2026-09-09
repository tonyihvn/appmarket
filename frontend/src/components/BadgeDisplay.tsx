import { Award, Star, Shield, Trophy } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  score: number;
  icon?: string;
  earnedDate: string;
}

interface BadgeDisplayProps {
  badges: Badge[];
  totalScore?: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  level?: number;
  showFullDetails?: boolean;
}

const TIER_CONFIG = {
  bronze: {
    color: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-900 dark:text-amber-100',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: <Shield size={24} className="text-amber-600" />,
    label: 'Bronze',
  },
  silver: {
    color: 'bg-slate-100 dark:bg-slate-900/30',
    textColor: 'text-slate-900 dark:text-slate-100',
    borderColor: 'border-slate-200 dark:border-slate-800',
    icon: <Star size={24} className="text-slate-600" />,
    label: 'Silver',
  },
  gold: {
    color: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: <Trophy size={24} className="text-yellow-600" />,
    label: 'Gold',
  },
  platinum: {
    color: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-900 dark:text-purple-100',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: <Award size={24} className="text-purple-600" />,
    label: 'Platinum',
  },
};

export const BadgeDisplay = ({
  badges,
  totalScore = 0,
  tier = 'bronze',
  level = 1,
  showFullDetails = false,
}: BadgeDisplayProps) => {
  const tierConfig = TIER_CONFIG[tier];

  if (!showFullDetails && badges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Tier Display */}
      {showFullDetails && (
        <div className={`${tierConfig.color} border ${tierConfig.borderColor} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {tierConfig.icon}
              <div>
                <p className={`text-sm font-medium ${tierConfig.textColor}`}>Tier</p>
                <p className={`text-xl font-bold ${tierConfig.textColor}`}>
                  {tierConfig.label} • Level {level}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-light">{totalScore}</p>
            </div>
          </div>
        </div>
      )}

      {/* Badges Grid */}
      {badges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-light mb-3 flex items-center gap-2">
            <Award size={18} />
            Badges ({badges.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 group hover:shadow-md transition"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {badge.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                      {badge.name}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-2">
                      {badge.description}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Badges Message */}
      {badges.length === 0 && showFullDetails && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
          <Award size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            No badges earned yet. Complete projects to earn badges!
          </p>
        </div>
      )}
    </div>
  );
};

// Quick badge summary (for cards and lists)
export const BadgeSummary = ({ badges, tier = 'bronze' }: { badges: Badge[]; tier?: string }) => {
  if (badges.length === 0) {
    return null;
  }

  const tierIcon = TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.icon;

  return (
    <div className="flex items-center gap-2">
      {tierIcon && <div className="text-lg">{tierIcon}</div>}
      <div className="flex flex-wrap gap-1">
        {badges.slice(0, 3).map((badge) => (
          <span
            key={badge.id}
            className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded text-xs font-medium"
            title={badge.description}
          >
            {badge.name}
          </span>
        ))}
        {badges.length > 3 && (
          <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-xs font-medium">
            +{badges.length - 3}
          </span>
        )}
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Plus, ChevronDown, X, Building2, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

interface CompanyOption {
  id: string;
  companyName: string;
  companyLogo?: string;
  userId?: string;
  type: 'user' | 'saved'; // 'user' = current user's company, 'saved' = other users' companies
}

interface CompanySelectProps {
  selectedCompanyId?: string;
  onSelect: (companyId: string, companyName: string) => void;
  userCompanies: CompanyOption[];
  savedCompanies?: CompanyOption[];
  onCreateNew?: (companyName: string, companyLogo?: string) => void;
  canCreateNew?: boolean;
}

export const CompanySelector = ({
  selectedCompanyId,
  onSelect,
  userCompanies = [],
  savedCompanies = [],
  onCreateNew,
  canCreateNew = true,
}: CompanySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allCompanies = [...userCompanies, ...(savedCompanies || [])];
  const selectedCompany = allCompanies.find((c) => c.id === selectedCompanyId);

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) {
      toast.error('Please enter company name');
      return;
    }

    try {
      setIsLoading(true);
      if (onCreateNew) {
        await onCreateNew(newCompanyName);
        setNewCompanyName('');
        setShowNewCompanyForm(false);
        toast.success('Company created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCompany = (companyId: string, companyName: string) => {
    onSelect(companyId, companyName);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900 dark:text-light">
        Select Company
      </label>

      {/* Dropdown Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedCompany?.companyLogo ? (
              <img
                src={selectedCompany.companyLogo}
                alt={selectedCompany.companyName}
                className="w-6 h-6 rounded object-cover flex-shrink-0"
              />
            ) : (
              <Building2 size={20} className="text-gray-400 flex-shrink-0" />
            )}
            <span className="text-gray-900 dark:text-light truncate">
              {selectedCompany?.companyName || 'Choose a company...'}
            </span>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {/* Your Companies Section */}
            {userCompanies.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    Your Companies
                  </p>
                </div>
                {userCompanies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company.id, company.companyName)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition ${
                      selectedCompanyId === company.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600'
                        : ''
                    }`}
                  >
                    {company.companyLogo ? (
                      <img
                        src={company.companyLogo}
                        alt={company.companyName}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <Briefcase size={20} className="text-gray-400" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-light">
                        {company.companyName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Your company</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Saved Companies Section */}
            {savedCompanies && savedCompanies.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    Other Companies
                  </p>
                </div>
                {savedCompanies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company.id, company.companyName)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      selectedCompanyId === company.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600'
                        : ''
                    }`}
                  >
                    {company.companyLogo ? (
                      <img
                        src={company.companyLogo}
                        alt={company.companyName}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <Building2 size={20} className="text-gray-400" />
                    )}
                    <p className="font-medium text-gray-900 dark:text-light">
                      {company.companyName}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Create New Company Option */}
            {canCreateNew && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowNewCompanyForm(!showNewCompanyForm)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition font-medium"
                >
                  <Plus size={20} />
                  Create New Company
                </button>
              </div>
            )}

            {/* Empty State */}
            {userCompanies.length === 0 && (!savedCompanies || savedCompanies.length === 0) && (
              <div className="px-4 py-6 text-center">
                <Building2 size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No companies available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Company Form */}
      {showNewCompanyForm && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-light mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-light"
              placeholder="Enter company name"
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowNewCompanyForm(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCompany}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Plus size={18} />
              Create Company
            </button>
          </div>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Select an existing company or create a new one to be announced with your app
      </p>
    </div>
  );
};

# CompanySelector Integration Guide

## Overview
This guide explains how to integrate the `CompanySelector` component into the `SubmitAppPage` to allow app publishers to select or create a company during app submission.

## Files to Modify
- `frontend/src/pages/SubmitAppPage.tsx` - Main integration
- `frontend/src/services/api.ts` - Add company fetch methods (optional)

## Step-by-Step Integration

### 1. Import the CompanySelector Component

Add this import at the top of `SubmitAppPage.tsx`:

```typescript
import { CompanySelector } from '../components/CompanySelector';
```

### 2. Update the formData State Interface

Add company selection to the form state:

```typescript
const [formData, setFormData] = useState({
  title: '',
  subtitle: '',
  description: '',
  techStack: [] as string[],
  category: '',
  price: '',
  isFree: true,
  isSaaS: false,
  isOffline: false,
  githubRepository: '',
  distributionFormat: 'web' as 'executable' | 'web' | 'source' | 'hybrid',
  deploymentMethod: '',
  officialWebsite: '',
  liveDemo: '',
  documentation: '',
  logo: '',
  screenshots: [] as string[],
  tags: [] as string[],
  // NEW: Company Selection
  selectedCompanyId: '',  // ID of selected company
  selectedCompanyName: '', // Name of selected company
});
```

### 3. Add State for User's Companies

Add new state to store user's companies:

```typescript
const [userCompanies, setUserCompanies] = useState<CompanyOption[]>([]);
const [savedCompanies, setSavedCompanies] = useState<CompanyOption[]>([]);
const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
const { user } = useAppSelector((state) => state.auth);
```

**Note**: Import the CompanyOption interface from CompanySelector:
```typescript
interface CompanyOption {
  id: string;
  companyName: string;
  companyLogo?: string;
  userId?: string;
  type: 'user' | 'saved';
}
```

### 4. Load User's Companies on Mount

Add this effect hook to load companies when component mounts:

```typescript
useEffect(() => {
  if (isAuthenticated && user?.id) {
    loadUserCompanies();
  }
}, [isAuthenticated, user?.id]);

const loadUserCompanies = async () => {
  try {
    setIsLoadingCompanies(true);
    // Call API to fetch user's companies
    // const response = await api.getUserCompanies();
    // setUserCompanies(response.data.companies);
    // 
    // Optionally fetch saved companies from other users
    // const savedResponse = await api.getSavedCompanies();
    // setSavedCompanies(savedResponse.data.companies);
  } catch (error) {
    console.error('Failed to load companies:', error);
    // Don't show error toast - companies are optional
  } finally {
    setIsLoadingCompanies(false);
  }
};
```

### 5. Add Company Selection Handler

Add handler for company selection:

```typescript
const handleCompanySelect = (companyId: string, companyName: string) => {
  setFormData((prev) => ({
    ...prev,
    selectedCompanyId: companyId,
    selectedCompanyName: companyName,
  }));
};
```

### 6. Add Company Creation Handler

Add handler for creating new company:

```typescript
const handleCreateCompany = async (
  companyName: string,
  companyLogo?: string
) => {
  try {
    // Call API to create company
    // const response = await api.createCompany({
    //   companyName,
    //   companyLogo,
    // });
    // 
    // Add to userCompanies and select it
    // const newCompany: CompanyOption = {
    //   id: response.data.company.id,
    //   companyName: response.data.company.companyName,
    //   companyLogo: response.data.company.companyLogo,
    //   type: 'user',
    // };
    // setUserCompanies((prev) => [...prev, newCompany]);
    // handleCompanySelect(newCompany.id, newCompany.companyName);
  } catch (error) {
    toast.error('Failed to create company');
  }
};
```

### 7. Add CompanySelector to Form UI

Add this section in the form, likely after the "Basic Information" section:

```typescript
{/* Company Selection */}
<div className="card">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-light mb-6">
    Company Information (Optional)
  </h2>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
    Select or create a company to be announced with your app. This helps build credibility and brand recognition.
  </p>
  
  <CompanySelector
    selectedCompanyId={formData.selectedCompanyId}
    onSelect={handleCompanySelect}
    userCompanies={userCompanies}
    savedCompanies={savedCompanies}
    onCreateNew={handleCreateCompany}
    canCreateNew={true}
  />
  
  {formData.selectedCompanyName && (
    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <p className="text-sm text-green-900 dark:text-green-100">
        ✓ Selected Company: <strong>{formData.selectedCompanyName}</strong>
      </p>
    </div>
  )}
</div>
```

### 8. Update Form Submission

Update the `handleSubmit` function to include company information:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const plainDescription = formData.description.replace(/<[^>]*>/g, '').trim();

  if (!formData.title || !formData.category || formData.techStack.length === 0 || !plainDescription) {
    toast.error('Please fill in all required fields');
    return;
  }

  try {
    setIsLoading(true);

    const response = await api.createApp({
      ...formData,
      price: formData.isFree ? null : parseFloat(formData.price),
      // Include company info in submission
      companyId: formData.selectedCompanyId,
      companyName: formData.selectedCompanyName,
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
```

### 9. Update App Model (Backend)

Ensure the App model includes company fields:

```typescript
// backend/src/models/App.sequelize.ts
export interface IApp {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  description: string;
  // ... other fields ...
  companyId?: string;        // NEW
  companyName?: string;      // NEW (denormalized for quick display)
  publisherCompany?: Company; // NEW (association)
}
```

### 10. Update API Service (Optional)

Add these methods to `frontend/src/services/api.ts` if not already present:

```typescript
// Get user's companies
export const getUserCompanies = () => {
  return instance.get('/companies');
};

// Get all saved companies from other users
export const getSavedCompanies = () => {
  return instance.get('/companies/saved');
};

// Create a new company
export const createCompany = (data: {
  companyName: string;
  companyLogo?: string;
  companyAbout?: string;
}) => {
  return instance.post('/companies', data);
};

// Update app creation to support company
export const createApp = (data: any) => {
  return instance.post('/apps', data);
};
```

## UI Integration Screenshot

The form section should appear like:
```
┌─ Company Information (Optional) ──────────────────┐
│                                                   │
│ Select or create a company to be announced       │
│ with your app. This helps build credibility...   │
│                                                   │
│ ┌─ [Company Logo] Select Company ──────────────┐ │
│ │ Choose a company...              ▼            │ │
│ └────────────────────────────────────────────────┘ │
│                                                   │
│ ✓ Selected Company: TechCorp Inc.                │
│                                                   │
└───────────────────────────────────────────────────┘
```

## Important Notes

1. **Company Selection is Optional**: The form should still submit even if no company is selected.

2. **Company Persistence**: Selected company should NOT be stored in localStorage - it's form state only.

3. **Company Dropdown Performance**: If many companies exist, consider pagination or search in the dropdown.

4. **Company Verification**: Consider adding a badge/checkmark for verified companies.

5. **Company Logo Loading**: Use image preview in dropdown - verify image loads correctly.

## Testing Checklist

- [ ] Can select existing company from dropdown
- [ ] Can create new company inline
- [ ] Selected company displays confirmation
- [ ] Company info included in form submission
- [ ] Form still submits without company selection
- [ ] Company logo displays correctly in dropdown
- [ ] Mobile responsive dropdown layout
- [ ] Dark mode styling correct
- [ ] Loading states handled properly
- [ ] Error messages clear and helpful

## Future Enhancements

1. **Company Verification Badge**: Add verified checkmark for approved companies
2. **Company Search**: Search/filter companies by name if list is large
3. **Company Stats**: Show company info (employee count, founded date) in dropdown
4. **Publisher Announcement**: After selection, show "Published by [Company]" banner
5. **Company Auto-Select**: Remember last selected company for user's next submission

import { Category } from '../types';
import { Link } from 'react-router-dom';

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick?: (categorySlug: string) => void;
}

export const CategoryGrid = ({ categories, onCategoryClick }: CategoryGridProps) => {
  const defaultCategories = [
    { name: 'Finance Apps', slug: 'finance' },
    { name: 'Educational Apps', slug: 'education' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Events', slug: 'events' },
    { name: 'AI Apps', slug: 'ai' },
    { name: 'Government', slug: 'government' },
    { name: 'Company ERPs', slug: 'erp' },
    { name: 'Social Apps', slug: 'social' },
    { name: 'Video', slug: 'video' },
    { name: 'Automobile', slug: 'automobile' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Ministry', slug: 'ministry' },
  ];

  const catList = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {catList.map((category) => (
        <Link
          key={category.slug || category.name}
          to={`/category/${category.slug}`}
          onClick={() => onCategoryClick?.(category.slug || '')}
          className="card text-center hover:scale-105 transition-transform"
        >
          <div className="text-3xl mb-2">{category.name?.[0] || '📦'}</div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-light line-clamp-2">
            {category.name}
          </h3>
          {category.appCount !== undefined && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{category.appCount} apps</p>
          )}
        </Link>
      ))}
    </div>
  );
};

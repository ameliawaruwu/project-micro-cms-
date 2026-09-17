import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { t } = useLanguage();
  const rootLabel = t('nav_dashboard', 'Beranda');

  const hasRootFirst =
    items.length > 0 &&
    (items[0].label.toLowerCase() === 'dashboard' ||
     items[0].label.toLowerCase() === 'beranda');

  const allItems: BreadcrumbItem[] = hasRootFirst
    ? [{ ...items[0], label: rootLabel }, ...items.slice(1)]
    : [{ label: rootLabel, onClick: items[0]?.onClick }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#706866] font-normal py-0.5 mb-1">
      <ol className="flex items-center flex-wrap gap-1.5">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={`breadcrumb-${index}`} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="w-3 h-3 text-[#A8A09D] shrink-0" />}
              {isLast || !item.onClick ? (
                <span
                  className={`truncate max-w-[200px] sm:max-w-[320px] ${
                    isLast ? 'font-medium text-[#241A1A]' : 'text-[#706866]'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-[#706866] hover:text-[#66000E] hover:underline transition truncate max-w-[150px] sm:max-w-[240px] cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

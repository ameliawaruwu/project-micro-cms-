import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#706866] font-medium py-1">
      <ol className="flex items-center flex-wrap gap-1.5">
        <li className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={items[0]?.onClick}
            className="text-[#706866] hover:text-[#66000E] transition cursor-pointer"
            title="Dashboard"
          >
            <span>Dashboard</span>
          </button>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`breadcrumb-${index}`} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-[#A8A09D] shrink-0" />
              {isLast || !item.onClick ? (
                <span
                  className={`truncate max-w-[200px] sm:max-w-[320px] ${
                    isLast ? 'font-semibold text-[#241A1A]' : 'text-[#706866]'
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

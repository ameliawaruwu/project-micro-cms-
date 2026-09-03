import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { ProductTable } from '../../components/products/ProductTable';
import { ProductMobileCard } from '../../components/products/ProductMobileCard';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductListPageProps {
  products: Product[];
  categories: string[];
  onAddProduct: () => void;
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDuplicateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onQuickStockChange: (id: string, delta: number) => void;
}

export const ProductListPage: React.FC<ProductListPageProps> = ({
  products,
  categories,
  onAddProduct,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  onQuickStockChange,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#1F1F1F] tracking-tight">{t('products_title', 'Produk')}</h1>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <ProductTable
          products={filteredProducts}
          categories={categories}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onAddProduct={onAddProduct}
          onViewProduct={onViewProduct}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onQuickStockChange={onQuickStockChange}
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <ProductMobileCard
          products={filteredProducts}
          onAddProduct={onAddProduct}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onQuickStockChange={onQuickStockChange}
        />
      </div>
    </div>
  );
};


import React from 'react';
import { CmsProduct } from '../../../cms/mockCmsData';
import { useCmsStore } from '../../../cms/useCmsStore';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';
import { InlineEditableImage } from '../../../components/layout-editor/InlineEditableImage';

interface ProductCardProps {
  product: CmsProduct;
  options?: any;
}

export const CuteProductCard: React.FC<ProductCardProps> = ({ product, options = {} }) => {
  const updateProduct = useCmsStore(state => state.updateProduct);

  const showPrice = options.showPrice !== false;
  const showCategory = options.showCategory !== false;
  const showBadge = options.showBadge !== false;
  const showRating = options.showRating !== false;
  const showAddToCart = options.showAddToCart !== false;
  const showStockBadge = options.showStockBadge !== false;

  return (
    <div className="group block font-['Outfit',sans-serif]">
      <div className="bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-4 border-[#FFF5F7] flex flex-col h-full justify-between">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#FFF5F7] mb-4 border-2 border-white shadow-inner">
            <InlineEditableImage
              src={product.image || 'https://via.placeholder.com/400'}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              onUpdateImage={(newUrl) => updateProduct({ ...product, image: newUrl })}
            />
            {showBadge && product.isNew && (
              <div className="absolute top-2 left-2 bg-[#FFD1DC] text-[#FF85A1] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border-2 border-white shadow-sm rotate-[-5deg]">
                Baru! ✨
              </div>
            )}
            {showStockBadge && product.stock !== undefined && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                Stok {product.stock}
              </div>
            )}
          </div>
          
          <div className="px-2 text-center pb-2">
            {showCategory && (
              <div className="bg-[#FFF5F7] text-[#FF85A1] text-[10px] font-bold px-2.5 py-1 rounded-full inline-block mb-2">
                <InlineEditableText
                  tagName="span"
                  value={product.categoryName || 'Kategori'}
                  onSave={(val) => updateProduct({ ...product, categoryName: val })}
                />
              </div>
            )}

            <h3 className="text-base font-black text-gray-800 line-clamp-1 mb-1">
              <InlineEditableText
                tagName="span"
                value={product.name}
                onSave={(val) => updateProduct({ ...product, name: val })}
              />
            </h3>

            {showRating && (
              <div className="flex items-center justify-center gap-1 mb-1 text-amber-400 text-xs font-bold">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                <span className="text-gray-400 text-[10px] ml-1">(5.0)</span>
              </div>
            )}

            {showPrice && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="text-lg font-black text-[#FF85A1]">
                  <span>Rp </span>
                  <InlineEditableText
                    tagName="span"
                    value={product.price.toLocaleString('id-ID')}
                    onSave={(val) => {
                      const num = parseInt(val.replace(/\D/g, ''));
                      if (!isNaN(num)) updateProduct({ ...product, price: num });
                    }}
                    className="inline-block"
                  />
                </p>
              </div>
            )}
          </div>
        </div>

        {showAddToCart && (
          <div className="pt-2">
            <button
              type="button"
              className="w-full py-2 bg-[#FF85A1] text-white font-black text-xs rounded-full hover:bg-[#FF6B8B] transition shadow-xs cursor-pointer"
            >
              + Beli Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

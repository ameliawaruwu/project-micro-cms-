import React from 'react';
import { CmsProduct } from '../../../cms/mockCmsData';
import { useCmsStore } from '../../../cms/useCmsStore';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';
import { InlineEditableImage } from '../../../components/layout-editor/InlineEditableImage';

interface ProductCardProps {
  product: CmsProduct;
  options?: any;
  readonly?: boolean;
}

export const NatureProductCard: React.FC<ProductCardProps> = ({ product, options = {}, readonly = false }) => {
  const updateProduct = useCmsStore(state => state.updateProduct);

  const showPrice = options.showPrice !== false;
  const showCategory = options.showCategory !== false;
  const showBadge = options.showBadge !== false;
  const showRating = options.showRating !== false;
  const showAddToCart = options.showAddToCart !== false;
  const showStockBadge = options.showStockBadge !== false;

  return (
    <div className="group block font-serif">
      <div className={`bg-white rounded-2xl p-3 shadow-xs border border-[#E8E4DB] flex flex-col h-full justify-between transition-all duration-300 ${readonly ? '' : 'hover:shadow-lg hover:-translate-y-1'}`}>
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F9F6F0] mb-3.5 border border-[#E8E4DB]/60">
            <InlineEditableImage
              src={product.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onUpdateImage={(newUrl) => updateProduct({ ...product, image: newUrl })}
              readonly={readonly}
            />
            {showBadge && product.isNew && (
              <div className="absolute top-2 left-2 bg-[#2C3B2D] text-[#F9F6F0] text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                Segar 🌿
              </div>
            )}
            {showStockBadge && product.stock !== undefined && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white font-sans text-[9px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xs">
                Stok {product.stock}
              </div>
            )}
          </div>
          
          <div className="px-1 text-center pb-2">
            {showCategory && (
              <div className="bg-[#F0F4EF] text-[#3B4D3C] font-sans text-[10px] font-medium px-2.5 py-0.5 rounded-md inline-block mb-1.5 border border-[#E0E8DF]">
                <InlineEditableText
                  tagName="span"
                  value={product.categoryName || 'Sayur & Buah'}
                  readonly={readonly}
                  onSave={(val) => updateProduct({ ...product, categoryName: val })}
                />
              </div>
            )}

            <h3 className="text-sm sm:text-base font-serif font-bold text-[#2C3B2D] line-clamp-1 mb-1 group-hover:text-[#166534] transition-colors">
              <InlineEditableText
                tagName="span"
                value={product.name}
                readonly={readonly}
                onSave={(val) => updateProduct({ ...product, name: val })}
              />
            </h3>

            {showRating && (
              <div className="flex items-center justify-center gap-1 mb-2 font-sans text-xs text-[#706866]">
                <span className="text-amber-500 text-sm">★</span>
                <span className="font-semibold text-[#2C3B2D]">5.0</span>
                <span className="text-[11px] text-[#8C8481]">(Teruji Alami)</span>
              </div>
            )}

            {showPrice && (
              <div className="font-sans font-bold text-sm sm:text-base text-[#166534] mb-3">
                <InlineEditableText
                  tagName="span"
                  value={`Rp ${product.price.toLocaleString('id-ID')}`}
                  readonly={readonly}
                  onSave={(val) => {
                    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                    if (!isNaN(num)) updateProduct({ ...product, price: num });
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {showAddToCart && (
          <button 
            type="button"
            className="w-full py-2 sm:py-2.5 px-3 bg-[#2C3B2D] hover:bg-[#1E2A1F] text-[#F9F6F0] font-sans text-xs font-medium rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
          >
            <span>+ Beli Sekarang</span>
          </button>
        )}
      </div>
    </div>
  );
};

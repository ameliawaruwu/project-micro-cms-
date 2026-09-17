import React from 'react';
import { CmsProduct } from '../../../cms/mockCmsData';
import { useCmsStore } from '../../../cms/useCmsStore';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';
import { InlineEditableImage } from '../../../components/layout-editor/InlineEditableImage';

interface ProductCardProps {
  product: CmsProduct;
}

export const CuteProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const updateProduct = useCmsStore(state => state.updateProduct);

  return (
    <div className="group block font-['Outfit',sans-serif]">
      <div className="bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-4 border-[#FFF5F7]">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#FFF5F7] mb-4 border-2 border-white shadow-inner">
          <InlineEditableImage
            src={product.image || product.imageUrl || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
            onSave={(newUrl) => updateProduct({ ...product, image: newUrl, imageUrl: newUrl })}
          />
          {product.isNew && (
            <div className="absolute top-2 left-2 bg-[#FFD1DC] text-[#FF85A1] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border-2 border-white shadow-sm rotate-[-5deg]">
              Baru! ✨
            </div>
          )}
        </div>
        
        <div className="px-2 text-center pb-2">
          <div className="bg-[#FFF5F7] text-[#FF85A1] text-[10px] font-bold px-2 py-1 rounded-full inline-block mb-2">
            <InlineEditableText
              tagName="span"
              value={product.categoryName || product.category || 'Kategori'}
              onSave={(val) => updateProduct({ ...product, categoryName: val })}
            />
          </div>
          <h3 className="text-base font-black text-gray-800 line-clamp-1 mb-1">
            <InlineEditableText
              tagName="span"
              value={product.name}
              onSave={(val) => updateProduct({ ...product, name: val })}
            />
          </h3>
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg font-black text-[#FF85A1]">
              <InlineEditableText
                tagName="span"
                value={String(product.price)}
                onSave={(val) => {
                  const num = parseInt(val.replace(/\D/g, ''));
                  if (!isNaN(num)) updateProduct({ ...product, price: num });
                }}
                className="inline-block"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

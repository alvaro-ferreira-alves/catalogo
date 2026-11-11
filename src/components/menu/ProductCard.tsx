import { useState } from 'react';
import { Product } from '@/types/menu';

interface ProductCardProps {
  product: Product;
  disabled?: boolean;
  onClick?: () => void;
}

export function ProductCard({ product, disabled, onClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const flavors = product.product_flavors || [];
  const flavorCount = flavors.length;
  const firstFlavor = flavors[0]?.flavor;

  const subtitle =
    flavorCount > 0
      ? `${flavorCount} ${flavorCount > 1 ? 'sabores' : 'sabor'}`
      : product.description || product.model || '';

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`group rounded-2xl sm:rounded-3xl border border-border/70 overflow-hidden bg-card hover:shadow-md transition-all flex flex-col ${
        !disabled ? 'cursor-pointer' : 'opacity-70 cursor-not-allowed'
      }`}
    >
      {/* Área da Imagem com fundo suave conforme layout */}
      <div className="relative aspect-square w-full bg-[#FAF7F2] dark:bg-muted/20 p-1 sm:p-2 flex items-center justify-center overflow-hidden">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted/50 flex flex-col items-center justify-center text-muted-foreground/60">
            <span className="text-xs font-bold uppercase tracking-wider">{product.brand || 'POD'}</span>
            <span className="text-[10px] font-medium text-muted-foreground/80">{product.model || ''}</span>
          </div>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 bg-card space-y-1">
        <div>
          <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {subtitle && (
            <p className="text-xs text-muted-foreground truncate mt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        <div className="pt-1">
          <span className="text-lg sm:text-xl font-extrabold text-primary">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

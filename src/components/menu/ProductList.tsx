import { useState } from 'react';
import { Product, Category } from '@/types/menu';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  searchTerm?: string;
  disabled?: boolean;
}

export function ProductList({
  products,
  selectedCategory,
  searchTerm = '',
  disabled,
}: ProductListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filtragem por categoria
  let filtered = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  // Filtragem por busca (busca por nome, marca, modelo ou sabor)
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(term);
      const descMatch = p.description?.toLowerCase().includes(term);
      const brandMatch = p.brand?.toLowerCase().includes(term);
      const modelMatch = p.model?.toLowerCase().includes(term);
      const flavorMatch = p.product_flavors?.some((f) =>
        f.flavor.toLowerCase().includes(term)
      );
      return nameMatch || descMatch || brandMatch || modelMatch || flavorMatch;
    });
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-sm">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5 pb-24">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            disabled={disabled}
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>

      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </>
  );
}

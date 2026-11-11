import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MenuHeader } from '@/components/menu/MenuHeader';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { ProductList } from '@/components/menu/ProductList';
import { FloatingCartButton } from '@/components/cart/FloatingCartButton';
import { CartSheet } from '@/components/cart/CartSheet';
import { CheckoutSheet } from '@/components/cart/CheckoutSheet';
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner';
import { useStoreSettings, isStoreOpen } from '@/hooks/useStoreSettings';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { CartProvider } from '@/contexts/CartContext';

function MenuContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { data: settings, isLoading: settingsLoading } = useStoreSettings();
  const { data: categories = [] } = useCategories(true);
  const { data: products = [] } = useProducts(true);

  const storeOpen = isStoreOpen(settings);

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Cabeçalho com Nome da Loja, Horários e Botão de Compartilhar */}
        <MenuHeader settings={settings} isLoading={settingsLoading} />

        {/* Campo de Busca de Produtos */}
        <div className="relative w-full my-2.5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-full border-border/80 bg-background text-sm placeholder:text-muted-foreground focus-visible:ring-primary shadow-xs"
          />
        </div>

        {/* Abas de Categorias / Marcas */}
        {categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {/* Banner de Loja Fechada */}
        {!storeOpen && !settingsLoading && (
          <StoreClosedBanner settings={settings} />
        )}

        {/* Grade de Produtos */}
        <div className="mt-4">
          <ProductList
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
            disabled={!storeOpen}
          />
        </div>
      </div>

      {/* Botão Flutuante e Modais de Carrinho / Checkout */}
      <FloatingCartButton onClick={() => setCartOpen(true)} />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
        disabled={!storeOpen}
      />

      <CheckoutSheet
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        storeSettings={settings}
      />
    </div>
  );
}

export default function Index() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
}

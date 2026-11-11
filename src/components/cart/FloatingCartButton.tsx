import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface FloatingCartButtonProps {
  onClick: () => void;
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const { totalItems, totalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto animate-slide-up">
      <Button
        onClick={onClick}
        className="w-full h-14 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-between px-6"
        size="lg"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-card text-primary text-xs font-bold flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="font-medium">Ver Carrinho</span>
        </div>
        <span className="font-bold">{formatPrice(totalPrice)}</span>
      </Button>
    </div>
  );
}

import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
  disabled?: boolean;
}

export function CartSheet({ open, onOpenChange, onCheckout, disabled }: CartSheetProps) {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Seu carrinho está vazio</p>
            <p className="text-sm text-muted-foreground">Adicione produtos para fazer seu pedido</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}_${item.flavor || ''}_${index}`}
                  className="flex gap-3 animate-fade-in"
                >
                  {item.product.image_url && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{item.product.name}</h4>
                    {item.flavor && (
                      <p className="text-xs font-semibold text-primary mt-0.5">
                        Sabor: {item.flavor}
                      </p>
                    )}
                    {item.addons && item.addons.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        + {item.addons.map((a) => a.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-foreground/80 font-semibold mt-0.5">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1, undefined, item.flavor)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1, undefined, item.flavor)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive ml-auto"
                        onClick={() => removeItem(item.product.id, undefined, item.flavor)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
              </div>

              <Button
                className="w-full h-12"
                size="lg"
                onClick={onCheckout}
                disabled={disabled}
              >
                Finalizar Pedido
              </Button>

              {disabled && (
                <p className="text-sm text-center text-destructive">
                  A loja está fechada no momento
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

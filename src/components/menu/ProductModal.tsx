import { useState, useEffect } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Product, Addon } from '@/types/menu';
import { useCart } from '@/contexts/CartContext';
import { useCategories } from '@/hooks/useCategories';
import { useAvailableAddons } from '@/hooks/useAddons';
import { useProductFlavors } from '@/hooks/useProductFlavors';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  // Guarda a contagem de cada sabor: { [flavorId]: count }
  const [flavorCounts, setFlavorCounts] = useState<Record<string, number>>({});
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());
  const { addItem } = useCart();

  // Busca os sabores do produto
  const { data: flavors = [], isLoading: flavorsLoading } = useProductFlavors(product?.id);

  // Categoria / Marca do produto
  const { data: categories } = useCategories(false);
  const categoryName = categories?.find((c) => c.id === product?.category_id)?.name ?? product?.brand ?? '';
  const isPratoFeito = categoryName.toLowerCase().includes('prato feito');

  // Adicionais (para compatibilidade com Prato Feito se houver)
  const { data: availableAddons, isLoading: addonsLoading } = useAvailableAddons();

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedAddonIds(new Set());
      setFlavorCounts({});
      setImageError(false);
    }
  }, [open]);

  if (!product) return null;

  const hasFlavors = flavors.length > 0;
  const totalSelectedFlavors = Object.values(flavorCounts).reduce((acc, c) => acc + c, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedAddons: Addon[] = availableAddons
    .filter((a) => selectedAddonIds.has(a.id))
    .map((a) => ({ id: a.id, name: a.name, price: a.price }));

  const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const unitTotal = product.price + addonsTotal;

  // Adicionar sabor
  const handleAddFlavor = (flavorId: string) => {
    if (quantity === 1) {
      // Se a quantidade total é 1, clicar em um sabor simplesmente o seleciona
      setFlavorCounts({ [flavorId]: 1 });
      return;
    }

    // Se já selecionou todos os sabores da quantidade atual, aumenta a quantidade total junto
    if (totalSelectedFlavors >= quantity) {
      setQuantity((q) => q + 1);
    }

    setFlavorCounts((prev) => ({
      ...prev,
      [flavorId]: (prev[flavorId] || 0) + 1,
    }));
  };

  // Remover sabor
  const handleRemoveFlavor = (flavorId: string) => {
    setFlavorCounts((prev) => {
      const current = prev[flavorId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[flavorId];
        return next;
      }
      return {
        ...prev,
        [flavorId]: current - 1,
      };
    });

    if (quantity > 1 && totalSelectedFlavors === quantity) {
      setQuantity((q) => Math.max(1, q - 1));
    }
  };

  // Ajuste da quantidade total no rodapé
  const handleIncreaseQuantity = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity <= 1) return;
    const newQty = quantity - 1;
    setQuantity(newQty);

    // Se os sabores selecionados ultrapassarem a nova quantidade, remove um
    if (totalSelectedFlavors > newQty) {
      setFlavorCounts((prev) => {
        const entries = Object.entries(prev);
        if (entries.length === 0) return prev;
        const [lastId, lastCount] = entries[entries.length - 1];
        if (lastCount <= 1) {
          const next = { ...prev };
          delete next[lastId];
          return next;
        }
        return { ...prev, [lastId]: lastCount - 1 };
      });
    }
  };

  // Adicionar ao carrinho
  const handleAdd = () => {
    if (hasFlavors && totalSelectedFlavors < quantity) {
      const missing = quantity - totalSelectedFlavors;
      toast.error(`Por favor, escolha mais ${missing} sabor${missing > 1 ? 'es' : ''}`);
      return;
    }

    if (hasFlavors) {
      Object.entries(flavorCounts).forEach(([flavorId, count]) => {
        const flavorObj = flavors.find((f) => f.id === flavorId);
        if (flavorObj && count > 0) {
          addItem(
            product,
            count,
            isPratoFeito && selectedAddons.length > 0 ? selectedAddons : undefined,
            flavorObj.flavor,
            flavorObj.id
          );
        }
      });
    } else {
      addItem(
        product,
        quantity,
        isPratoFeito && selectedAddons.length > 0 ? selectedAddons : undefined
      );
    }

    toast.success(`${quantity}x ${product.name} adicionado ao carrinho`);
    onOpenChange(false);
  };

  const isComplete = !hasFlavors || totalSelectedFlavors === quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-x-0 bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 w-full max-w-full sm:max-w-[440px] overflow-hidden p-0 border-none bg-background rounded-t-[28px] sm:rounded-3xl shadow-2xl fixed data-[state=closed]:translate-y-full sm:data-[state=closed]:translate-y-[-50%] sm:data-[state=closed]:scale-95 duration-300 [&>button:last-child]:hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
        
        {/* Botão fechar (X) circular no canto superior direito */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm shadow-md border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-all active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full max-w-full">
          <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden">
            {/* Imagem do Produto adaptável para mobile */}
            {product.image_url && !imageError ? (
              <div className="relative w-full h-44 sm:h-52 bg-[#FAF7F2] dark:bg-muted/20 overflow-hidden flex items-center justify-center">
                <img
                  src={product.image_url}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-200"
                />
              </div>
            ) : (
              <div className="w-full h-10" />
            )}

            <div className="p-4 sm:p-5 pt-3 space-y-4 pb-6 w-full max-w-full box-border">
              {/* Informações: Categoria/Marca, Nome e Preço */}
              <DialogHeader className="text-left space-y-1">
                {categoryName && (
                  <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {categoryName}
                  </span>
                )}
                <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground">
                  {product.name}
                </DialogTitle>
                <div className="text-xl font-bold text-primary pt-0.5">
                  {formatPrice(product.price)}
                </div>
                {product.description && (
                  <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
                    {product.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Seção Escolha os Sabores */}
              {hasFlavors && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">
                      {quantity > 1 ? 'Escolha os sabores' : 'Escolha o sabor'}
                    </label>
                    {quantity > 1 && (
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full transition-colors',
                          totalSelectedFlavors === quantity
                            ? 'bg-primary/15 text-primary font-semibold'
                            : 'bg-muted text-muted-foreground font-medium'
                        )}
                      >
                        {totalSelectedFlavors}/{quantity} selecionado{quantity > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {flavorsLoading ? (
                    <p className="text-xs text-muted-foreground py-1">Carregando sabores...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {flavors.map((fl) => {
                        const count = flavorCounts[fl.id] || 0;
                        const isSelected = count > 0;

                        // Se a quantidade for 1, mantém a simplicidade de 1 clique
                        if (quantity === 1) {
                          return (
                            <button
                              key={fl.id}
                              type="button"
                              onClick={() => handleAddFlavor(fl.id)}
                              className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium transition-all select-none',
                                isSelected
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'bg-muted/80 text-foreground hover:bg-muted'
                              )}
                            >
                              {fl.flavor}
                            </button>
                          );
                        }

                        // Se a quantidade for maior que 1, permite selecionar múltiplos sabores
                        if (isSelected) {
                          return (
                            <div
                              key={fl.id}
                              className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow-sm transition-all select-none"
                            >
                              <button
                                type="button"
                                onClick={() => handleRemoveFlavor(fl.id)}
                                aria-label={`Remover ${fl.flavor}`}
                                className="w-5 h-5 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center transition-colors active:scale-95"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-bold text-xs px-0.5">{count}x</span>
                              <button
                                type="button"
                                onClick={() => handleAddFlavor(fl.id)}
                                aria-label={`Adicionar mais ${fl.flavor}`}
                                className="w-5 h-5 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center transition-colors active:scale-95"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <span className="ml-1">{fl.flavor}</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={fl.id}
                            type="button"
                            onClick={() => handleAddFlavor(fl.id)}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-all bg-muted/80 text-foreground hover:bg-muted active:scale-95 select-none"
                          >
                            + {fl.flavor}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Seção de Adicionais */}
              {isPratoFeito && (
                <div className="mt-4 pt-2">
                  <p className="text-sm font-semibold mb-2">Adicionais</p>
                  {addonsLoading ? (
                    <p className="text-xs text-muted-foreground">Carregando adicionais...</p>
                  ) : availableAddons.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum adicional disponível.</p>
                  ) : (
                    <div className="space-y-2">
                      {availableAddons.map((addon) => (
                        <div key={addon.id} className="flex items-center gap-3">
                          <Checkbox
                            id={`addon-${addon.id}`}
                            checked={selectedAddonIds.has(addon.id)}
                            onCheckedChange={() => toggleAddon(addon.id)}
                          />
                          <label
                            htmlFor={`addon-${addon.id}`}
                            className="flex-1 text-sm cursor-pointer select-none flex items-center justify-between"
                          >
                            <span>{addon.name}</span>
                            {addon.price > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +{formatPrice(addon.price)}
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Rodapé com seletor de quantidade e botão Adicionar */}
          <div className="shrink-0 p-3 sm:p-4 pt-2.5 border-t bg-background pb-[calc(1rem+env(safe-area-inset-bottom))] w-full">
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              {/* Seletor de quantidade arredondado e compacto no mobile */}
              <div className="flex items-center justify-between rounded-full border border-border bg-background px-1 sm:px-1.5 py-0.5 h-11 sm:h-12 w-24 sm:w-28 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted text-foreground"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>

                <span className="font-semibold text-sm sm:text-base w-5 sm:w-6 text-center select-none">
                  {quantity}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted text-foreground"
                  onClick={handleIncreaseQuantity}
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Botão Adicionar grande arredondado, 100% responsivo sem estourar */}
              <Button
                onClick={handleAdd}
                className={cn(
                  'flex-1 min-w-0 h-11 sm:h-12 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-all shadow-sm flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4',
                  !isComplete
                    ? 'bg-primary/70 hover:bg-primary/80 text-primary-foreground'
                    : 'bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.99]'
                )}
              >
                {!isComplete ? (
                  <span className="truncate">
                    {totalSelectedFlavors === 0
                      ? 'Escolha o sabor'
                      : `Faltam ${quantity - totalSelectedFlavors}`}
                  </span>
                ) : (
                  <>
                    <span className="truncate">Adicionar</span>
                    <span>•</span>
                    <span className="shrink-0">{formatPrice(unitTotal * quantity)}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

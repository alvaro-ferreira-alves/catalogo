import { useState } from 'react';
import { MessageCircle, User, CreditCard, FileText, MapPin, Truck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useDeliveryZones } from '@/hooks/useDeliveryZones';
import { StoreSettings } from '@/types/menu';
import { toast } from 'sonner';

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeSettings: StoreSettings | undefined;
}

const ALL_PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX' },
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'cartao_credito', label: 'Cartão de Crédito' },
  { id: 'cartao_debito', label: 'Cartão de Débito' },
];

export function CheckoutSheet({ open, onOpenChange, storeSettings }: CheckoutSheetProps) {
  const { items, totalPrice, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const { data: deliveryZones = [] } = useDeliveryZones();

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'retirada'>('delivery');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [complement, setComplement] = useState('');
  const [changeAmount, setChangeAmount] = useState('');

  // Taxa de entrega vem do bairro selecionado
  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const deliveryFee = deliveryType === 'delivery' ? (selectedZone?.fee ?? 0) : 0;
  const grandTotal = totalPrice + deliveryFee;

  const paymentMethods = ALL_PAYMENT_METHODS.filter(
    (m) => !storeSettings?.accepted_payment_methods || storeSettings.accepted_payment_methods.includes(m.id)
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const generateWhatsAppMessage = () => {
    const itemsList = items
      .map((item) => {
        const lineTotal = (item.product.price + (item.addons ?? []).reduce((s, a) => s + a.price, 0)) * item.quantity;
        const flavorSuffix = item.flavor ? ` (${item.flavor})` : '';
        let line = `* ${item.quantity}x ${item.product.name}${flavorSuffix} - ${formatPrice(lineTotal)}`;
        if (item.addons && item.addons.length > 0) {
          line += `\n${item.addons.map((a) => `  + ${a.name}`).join('\n')}`;
        }
        return line;
      })
      .join('\n');

    const paymentLabel = paymentMethods.find((p) => p.id === paymentMethod)?.label || paymentMethod;
    let paymentString = paymentLabel;
    if (paymentMethod === 'dinheiro' && deliveryType === 'delivery' && changeAmount) {
      paymentString += ` (Troco para R$ ${changeAmount})`;
    }

    let message = `*NOVO PEDIDO*\n`;
    message += `*Cliente:* ${customerName}\n`;
    message += `*Modalidade:* ${deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}\n`;
    if (deliveryType === 'delivery') {
      const bairro = selectedZone?.name ?? '';
      message += `*Endereço:* ${street}, ${houseNumber} - ${bairro}${complement ? ` (${complement})` : ''}\n`;
      message += `*Taxa de Entrega (${bairro}):* ${formatPrice(deliveryFee)}\n`;
    }
    message += `\n*Itens:*\n${itemsList}\n\n`;
    message += `*Pagamento:* ${paymentString}\n\n`;
    message += `*Subtotal:* ${formatPrice(totalPrice)}\n`;
    message += `==================\n\n`;
    message += `*Total:* ${formatPrice(grandTotal)}\n`;

    if (notes) message += `\n*Observações:* ${notes}\n`;
    if (storeSettings?.default_message) message += `\n${storeSettings.default_message}`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Por favor, informe seu nome');
      return;
    }

    if (!storeSettings?.whatsapp_number) {
      toast.error('Número do WhatsApp não configurado');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!street.trim() || !houseNumber.trim()) {
        toast.error('Por favor, preencha a Rua e o Número');
        return;
      }
      if (!selectedZoneId) {
        toast.error('Por favor, selecione o bairro de entrega');
        return;
      }
    }

    setIsSubmitting(true);

    let finalNotes = notes.trim();
    if (paymentMethod === 'dinheiro' && deliveryType === 'delivery' && changeAmount) {
      finalNotes += finalNotes ? `\nTroco para: R$ ${changeAmount}` : `Troco para: R$ ${changeAmount}`;
    }

    try {
      try {
        await createOrder.mutateAsync({
          customerName: customerName.trim(),
          customerPhone: '',
          paymentMethod,
          notes: finalNotes || undefined,
          items,
          total: grandTotal,
          deliveryType,
          deliveryAddress: deliveryType === 'delivery' ? {
            street: street.trim(),
            number: houseNumber.trim(),
            neighborhood: selectedZone?.name ?? '',
            complement: complement.trim(),
          } : null,
        });
      } catch (dbError: any) {
        console.error('Error creating order in DB:', dbError);
        toast.error(`Aviso: Erro ao salvar no banco (${dbError?.message || 'erro'}), mas o pedido será enviado ao WhatsApp!`, { duration: 5000 });
      }

      let whatsappNumber = storeSettings.whatsapp_number.replace(/\D/g, '');
      if (whatsappNumber.startsWith('55') && whatsappNumber.length >= 12) {
        whatsappNumber = whatsappNumber.substring(2);
      }
      if (whatsappNumber.startsWith('0')) {
        whatsappNumber = whatsappNumber.substring(1);
      }
      whatsappNumber = `55${whatsappNumber}`;

      const message = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

      clearCart();
      onOpenChange(false);
      setCustomerName('');
      setStreet('');
      setHouseNumber('');
      setSelectedZoneId('');
      setComplement('');
      setNotes('');
      setChangeAmount('');
      setPaymentMethod('pix');

      toast.success('Preparando para enviar pelo WhatsApp...');

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Fatal error in checkout:', error);
      toast.error(`Erro fatal: ${error?.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Finalizar Pedido
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 py-4">
          <div className="flex-1 overflow-y-auto px-1 space-y-6">

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Seu Nome *
              </Label>
              <Input
                id="name"
                placeholder="Digite seu nome"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            {/* Tipo de entrega */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Tipo de Entrega *
              </Label>
              <RadioGroup
                value={deliveryType}
                onValueChange={(val) => {
                  setDeliveryType(val as 'delivery' | 'retirada');
                  setSelectedZoneId('');
                }}
                className="grid grid-cols-2 gap-2"
              >
                <div>
                  <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                  <Label htmlFor="delivery" className="flex items-center justify-center rounded-lg border-2 border-input bg-card p-3 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-sm">
                    Entrega
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="retirada" id="retirada" className="peer sr-only" />
                  <Label htmlFor="retirada" className="flex items-center justify-center rounded-lg border-2 border-input bg-card p-3 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-sm">
                    Retirada
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Endereço (apenas entrega) */}
            {deliveryType === 'delivery' && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  <span>Endereço de Entrega *</span>
                </div>

                {/* Bairro — select dinâmico */}
                <div className="space-y-1.5">
                  <Label htmlFor="zone">Bairro *</Label>
                  <select
                    id="zone"
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    required
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Selecione o bairro...</option>
                    {deliveryZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} — {formatPrice(zone.fee)}
                      </option>
                    ))}
                  </select>
                  {selectedZone && (
                    <p className="text-xs text-muted-foreground">
                      Taxa de entrega para <strong>{selectedZone.name}</strong>: {formatPrice(selectedZone.fee)}
                    </p>
                  )}
                </div>

                {/* Rua + Número */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Input placeholder="Nome da rua" value={street} onChange={(e) => setStreet(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Input placeholder="Número" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Input placeholder="Complemento" value={complement} onChange={(e) => setComplement(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Pagamento */}
            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Forma de Pagamento *
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-2 gap-2"
              >
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                    <Label
                      htmlFor={method.id}
                      className="flex items-center justify-center rounded-lg border-2 border-input bg-card p-3 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-sm"
                    >
                      {method.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {paymentMethod === 'dinheiro' && deliveryType === 'delivery' && (
                <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                  <Label htmlFor="changeAmount">Precisa de troco para quanto?</Label>
                  <Input
                    id="changeAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 50"
                    value={changeAmount}
                    onChange={(e) => setChangeAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Deixe em branco se não precisar de troco</p>
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observações (opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ex: casa amarela, portão preto..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Rodapé com totais */}
          <div className="shrink-0 border-t border-border pt-4 mt-4 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Taxa de Entrega{selectedZone ? ` (${selectedZone.name})` : ''}</span>
                  <span>{selectedZone ? formatPrice(deliveryFee) : '—'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">{formatPrice(grandTotal)}</span>
            </div>

            <Button
              type="submit"
              className="w-full h-12 gap-2"
              size="lg"
              disabled={isSubmitting}
            >
              <MessageCircle className="h-5 w-5" />
              {isSubmitting ? 'Enviando...' : 'Enviar pelo WhatsApp'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

import { useState, useEffect } from 'react';
import { Store, Phone, Clock, MessageSquare, Save, Truck, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { toast } from 'sonner';

const ALL_PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX' },
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'cartao_credito', label: 'Cartão de Crédito' },
  { id: 'cartao_debito', label: 'Cartão de Débito' },
];

export default function AdminSettings() {
  const { data: settings, isLoading } = useStoreSettings();
  const updateSettings = useUpdateStoreSettings();

  const [storeName, setStoreName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [defaultMessage, setDefaultMessage] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [acceptedPayments, setAcceptedPayments] = useState<string[]>(['pix', 'dinheiro', 'cartao_credito', 'cartao_debito']);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name);
      setWhatsappNumber(settings.whatsapp_number);
      setOpenTime(settings.open_time.slice(0, 5));
      setCloseTime(settings.close_time.slice(0, 5));
      setIsOpen(settings.is_open);
      setDefaultMessage(settings.default_message || '');
      setDeliveryFee(String(settings.delivery_fee ?? 0));
      setAcceptedPayments(settings.accepted_payment_methods ?? ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito']);
    }
  }, [settings]);

  const togglePayment = (id: string) => {
    setAcceptedPayments((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (!storeName.trim()) { toast.error('Nome da loja é obrigatório'); return; }
    if (!whatsappNumber.trim()) { toast.error('Número do WhatsApp é obrigatório'); return; }
    if (acceptedPayments.length === 0) { toast.error('Selecione ao menos uma forma de pagamento'); return; }

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        store_name: storeName.trim(),
        whatsapp_number: whatsappNumber.replace(/\D/g, ''),
        open_time: openTime + ':00',
        close_time: closeTime + ':00',
        is_open: isOpen,
        default_message: defaultMessage.trim() || null,
        delivery_fee: parseFloat(deliveryFee) || 0,
        accepted_payment_methods: acceptedPayments,
      });
      toast.success('Configurações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Configurações">
        <Card className="animate-pulse">
          <CardContent className="pt-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-10 bg-muted rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados da Loja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Dados da Loja
            </CardTitle>
            <CardDescription>Informações básicas do seu estabelecimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nome da Loja *</Label>
              <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: Burger House" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> WhatsApp *
              </Label>
              <Input id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="5511999999999" required />
              <p className="text-xs text-muted-foreground">Inclua código do país (55) e DDD. Ex: 5511999999999</p>
            </div>
          </CardContent>
        </Card>

        {/* Horário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Horário de Funcionamento
            </CardTitle>
            <CardDescription>Defina quando sua loja aceita pedidos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label htmlFor="isOpen" className="font-medium">Loja aberta</Label>
                <p className="text-sm text-muted-foreground">Desative para bloquear novos pedidos</p>
              </div>
              <Switch id="isOpen" checked={isOpen} onCheckedChange={setIsOpen} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Abre às</Label>
                <Input id="openTime" type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Fecha às</Label>
                <Input id="closeTime" type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Entrega */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Delivery
            </CardTitle>
            <CardDescription>Configure a taxa de entrega cobrada dos clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
              <Input
                id="deliveryFee"
                type="number"
                min="0"
                step="0.50"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Informe 0 para entrega grátis. A taxa será exibida e somada ao total no checkout.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Formas de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Formas de Pagamento
            </CardTitle>
            <CardDescription>Selecione quais formas serão exibidas no checkout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ALL_PAYMENT_METHODS.map((method) => (
              <div key={method.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`pay-${method.id}`}
                  checked={acceptedPayments.includes(method.id)}
                  onCheckedChange={() => togglePayment(method.id)}
                />
                <Label htmlFor={`pay-${method.id}`} className="cursor-pointer font-normal flex-1">
                  {method.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mensagem Padrão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Mensagem Padrão
            </CardTitle>
            <CardDescription>Texto que aparece no final da mensagem do WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={defaultMessage}
              onChange={(e) => setDefaultMessage(e.target.value)}
              placeholder="Ex: Obrigado pela preferência! 🙏"
              rows={3}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={updateSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </form>
    </AdminLayout>
  );
}

import { useState } from 'react';
import { Clock, User, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useOrders, useOrderItems, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Order } from '@/types/menu';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'novo', label: 'Novo', color: 'bg-info text-info-foreground' },
  { value: 'em_preparo', label: 'Em Preparo', color: 'bg-warning text-warning-foreground' },
  { value: 'finalizado', label: 'Finalizado', color: 'bg-success text-success-foreground' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-destructive text-destructive-foreground' },
];

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const { data: items = [] } = useOrderItems(order.id);
  const updateStatus = useUpdateOrderStatus();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status: newStatus });
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const statusConfig = statusOptions.find((s) => s.value === order.status) || statusOptions[0];

  return (
    <Card className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold">{order.customer_name}</span>
                {order.customer_phone && (
                  <span className="text-sm text-muted-foreground mr-1">{order.customer_phone}</span>
                )}
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(order.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  {order.payment_method}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-primary">{formatPrice(order.total)}</p>
              <Select value={order.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[130px] h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-2">
              {open ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" /> Menos detalhes
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" /> Ver detalhes
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-border pt-4">
            <h4 className="font-medium mb-2">Itens do Pedido</h4>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="text-muted-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Observações:</p>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useOrders();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(() => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  });

  const dateFilteredOrders = orders.filter((o) => {
    if (!dateFilter) return true;
    const orderDate = new Date(o.created_at);
    const localYMD = orderDate.getFullYear() + '-' + String(orderDate.getMonth() + 1).padStart(2, '0') + '-' + String(orderDate.getDate()).padStart(2, '0');
    return localYMD === dateFilter;
  });

  const filteredOrders = dateFilteredOrders.filter((o) => statusFilter === 'all' || o.status === statusFilter);

  const newCount = dateFilteredOrders.filter((o) => o.status === 'novo').length;
  const preparingCount = dateFilteredOrders.filter((o) => o.status === 'em_preparo').length;

  return (
    <AdminLayout title="Pedidos">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-info/10 text-info">
              {newCount} novos
            </Badge>
            <Badge variant="secondary" className="bg-warning/10 text-warning">
              {preparingCount} em preparo
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[150px]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-5 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-48" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {statusFilter === 'all' ? 'Nenhum pedido ainda' : 'Nenhum pedido com este status'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

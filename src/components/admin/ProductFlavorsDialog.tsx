import { useState } from 'react';
import { Plus, Trash2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Product, ProductFlavor } from '@/types/menu';
import {
  useAdminProductFlavors,
  useCreateFlavor,
  useUpdateFlavor,
  useDeleteFlavor,
} from '@/hooks/useProductFlavors';
import { toast } from 'sonner';

interface ProductFlavorsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductFlavorsDialog({ product, open, onOpenChange }: ProductFlavorsDialogProps) {
  const { data: flavors = [], isLoading } = useAdminProductFlavors(product?.id);
  const createFlavor = useCreateFlavor();
  const updateFlavor = useUpdateFlavor();
  const deleteFlavor = useDeleteFlavor();

  // Estado do formulário de novo sabor
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newFlavorQuantity, setNewFlavorQuantity] = useState('10');

  // Estado de edição de sabores existentes
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  if (!product) return null;

  const totalStock = flavors.reduce((sum, f) => sum + (f.quantity || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlavorName.trim()) {
      toast.error('Informe o nome do sabor');
      return;
    }

    const qty = parseInt(newFlavorQuantity, 10);
    const quantity = isNaN(qty) || qty < 0 ? 0 : qty;

    try {
      await createFlavor.mutateAsync({
        product_id: product.id,
        flavor: newFlavorName.trim(),
        quantity,
        active: true,
      });
      toast.success(`Sabor "${newFlavorName.trim()}" cadastrado!`);
      setNewFlavorName('');
      setNewFlavorQuantity('10');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar sabor');
    }
  };

  const handleStartEdit = (fl: ProductFlavor) => {
    setEditingId(fl.id);
    setEditName(fl.flavor);
    setEditQuantity(String(fl.quantity));
  };

  const handleSaveEdit = async (fl: ProductFlavor) => {
    if (!editName.trim()) {
      toast.error('O nome do sabor não pode ser vazio');
      return;
    }

    const qty = parseInt(editQuantity, 10);
    const quantity = isNaN(qty) || qty < 0 ? 0 : qty;

    try {
      await updateFlavor.mutateAsync({
        id: fl.id,
        product_id: product.id,
        flavor: editName.trim(),
        quantity,
      });
      toast.success('Sabor atualizado com sucesso!');
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar sabor');
    }
  };

  const handleToggleActive = async (fl: ProductFlavor) => {
    try {
      await updateFlavor.mutateAsync({
        id: fl.id,
        product_id: product.id,
        active: !fl.active,
      });
      toast.success(fl.active ? `Sabor "${fl.flavor}" desativado` : `Sabor "${fl.flavor}" ativado`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar status');
    }
  };

  const handleDelete = async (fl: ProductFlavor) => {
    if (!confirm(`Tem certeza que deseja excluir o sabor "${fl.flavor}"?`)) return;

    try {
      await deleteFlavor.mutateAsync({ id: fl.id, product_id: product.id });
      toast.success(`Sabor "${fl.flavor}" excluído!`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir sabor');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Cabeçalho */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-bold font-heading">
              Sabores: {product.name}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Cadastre os sabores disponíveis e gerencie as quantidades em estoque para este modelo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Card Formulário de Cadastro Rápido de Sabor */}
          <Card className="p-4 bg-muted/30 border-dashed">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-primary" /> Cadastrar Novo Sabor
            </h4>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="flavor-name" className="text-xs">
                    Nome do Sabor *
                  </Label>
                  <Input
                    id="flavor-name"
                    value={newFlavorName}
                    onChange={(e) => setNewFlavorName(e.target.value)}
                    placeholder="Ex: Uva Gelada, Menta, Morango..."
                    className="h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="flavor-qty" className="text-xs">
                    Qtd em Estoque
                  </Label>
                  <Input
                    id="flavor-qty"
                    type="number"
                    min="0"
                    value={newFlavorQuantity}
                    onChange={(e) => setNewFlavorQuantity(e.target.value)}
                    placeholder="10"
                    className="h-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full sm:w-auto font-medium"
                disabled={createFlavor.isPending}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {createFlavor.isPending ? 'Cadastrando...' : 'Adicionar Sabor'}
              </Button>
            </form>
          </Card>

          {/* Lista de Sabores Cadastrados */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Sabores Cadastrados ({flavors.length})
              </h4>
              <Badge variant="outline" className="font-normal text-xs">
                Estoque Total: <strong className="ml-1 text-primary">{totalStock} un</strong>
              </Badge>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Carregando sabores...</p>
            ) : flavors.length === 0 ? (
              <div className="text-center py-8 border rounded-xl border-dashed bg-muted/10">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-medium">
                  Nenhum sabor cadastrado ainda
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use o formulário acima para adicionar os sabores disponíveis deste pod.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {flavors.map((fl) => {
                  const isEditing = editingId === fl.id;

                  return (
                    <div
                      key={fl.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-colors gap-2.5 ${
                        fl.active ? 'bg-card' : 'bg-muted/40 opacity-70'
                      }`}
                    >
                      {/* Lado Esquerdo: Nome e Qtd ou Campos de Edição */}
                      {isEditing ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nome do sabor"
                            className="sm:col-span-2 h-8 text-sm"
                            autoFocus
                          />
                          <Input
                            type="number"
                            min="0"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            placeholder="Qtd"
                            className="h-8 text-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="truncate">
                            <span className="font-medium text-sm text-foreground block truncate">
                              {fl.flavor}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Estoque: <strong className="text-foreground">{fl.quantity} un</strong>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Lado Direito: Ações */}
                      <div className="flex items-center gap-2 justify-end shrink-0">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => handleSaveEdit(fl)}
                              disabled={updateFlavor.isPending}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" /> Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs"
                              onClick={() => setEditingId(null)}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 mr-1">
                              <span className="text-[11px] text-muted-foreground">
                                {fl.active ? 'Ativo' : 'Pausado'}
                              </span>
                              <Switch
                                checked={fl.active}
                                onCheckedChange={() => handleToggleActive(fl)}
                                aria-label="Ativar/Desativar sabor"
                              />
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => handleStartEdit(fl)}
                            >
                              Editar
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(fl)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

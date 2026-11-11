import { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Category } from '@/types/menu';
import { toast } from 'sonner';

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);

  const resetForm = () => {
    setName('');
    setSortOrder(categories.length);
    setActive(true);
    setEditingCategory(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setSortOrder(categories.length);
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSortOrder(category.sort_order);
    setActive(category.active);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: name.trim(),
          sort_order: sortOrder,
          active,
        });
        toast.success('Categoria atualizada!');
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          sort_order: sortOrder,
          active,
        });
        toast.success('Categoria criada!');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      await deleteCategory.mutateAsync(id);
      toast.success('Categoria excluída!');
    } catch (error) {
      toast.error('Erro ao excluir categoria');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        active: !category.active,
      });
      toast.success(category.active ? 'Categoria desativada' : 'Categoria ativada');
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
    }
  };

  return (
    <AdminLayout title="Categorias">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">{categories.length} categorias</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" /> Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Lanches, Bebidas..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Ordem de exibição</Label>
                  <Input
                    id="order"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Categoria ativa</Label>
                  <Switch
                    id="active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-32" />
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
            <Button variant="link" onClick={handleOpenCreate}>
              Criar primeira categoria
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <Card key={category.id} className="p-4 flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    <Badge variant={category.active ? 'default' : 'secondary'}>
                      {category.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Ordem: {category.sort_order}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(category)}
                >
                  {category.active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductFlavorsDialog } from '@/components/admin/ProductFlavorsDialog';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, uploadProductImage } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Product } from '@/types/menu';
import { toast } from 'sonner';

export default function AdminProducts() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [flavorProduct, setFlavorProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setImageUrl('');
    setActive(true);
    setEditingProduct(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(String(product.price));
    setCategoryId(product.category_id || '');
    setImageUrl(product.image_url || '');
    setActive(product.active);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
      toast.success('Imagem enviada!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const priceNum = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Preço inválido');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          name: name.trim(),
          description: description.trim() || null,
          price: priceNum,
          category_id: categoryId || null,
          image_url: imageUrl || null,
          active,
        });
        toast.success('Produto atualizado!');
      } else {
        await createProduct.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          price: priceNum,
          category_id: categoryId || undefined,
          image_url: imageUrl || undefined,
          active,
        });
        toast.success('Produto criado!');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Produto excluído!');
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        active: !product.active,
      });
      toast.success(product.active ? 'Produto desativado' : 'Produto ativado');
    } catch (error) {
      toast.error('Erro ao atualizar produto');
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Sem categoria';
    return categories.find((c) => c.id === categoryId)?.name || 'Sem categoria';
  };

  return (
    <AdminLayout title="Produtos">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">{products.length} produtos</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" /> Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: X-Burger Especial"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ingredientes e detalhes do produto"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço *</Label>
                    <Input
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="29.90"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={categoryId || "none"} onValueChange={(val) => setCategoryId(val === "none" ? "" : val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Imagem</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {imageUrl ? (
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4 mr-1" /> Trocar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        'Enviando...'
                      ) : (
                        <>
                          <ImageIcon className="h-6 w-6 mr-2" /> Adicionar Imagem
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Produto ativo</Label>
                  <Switch
                    id="active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                </div>

                {editingProduct && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => {
                      setFlavorProduct(editingProduct);
                      setDialogOpen(false);
                    }}
                  >
                    <Sparkles className="h-4 w-4" /> Gerenciar Sabores deste Produto
                  </Button>
                )}

                <Button type="submit" className="w-full">
                  {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-32" />
                    <div className="h-4 bg-muted rounded w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum produto cadastrado</p>
            <Button variant="link" onClick={handleOpenCreate}>
              Criar primeiro produto
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <Card key={product.id} className="p-4 flex items-center gap-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{product.name}</span>
                    <Badge variant={product.active ? 'default' : 'secondary'}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                    <span className="font-semibold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <span>•</span>
                    <span>{getCategoryName(product.category_id)}</span>
                  </div>
                </div>

                {/* Botão para gerenciar sabores */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 gap-1.5 text-xs font-medium border-primary/30 hover:border-primary text-foreground shrink-0"
                  onClick={() => setFlavorProduct(product)}
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Sabores</span>
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4">
                    {product.product_flavors?.length ?? 0}
                  </Badge>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(product)}
                  title={product.active ? 'Desativar produto' : 'Ativar produto'}
                >
                  {product.active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(product)}
                  title="Editar produto"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(product.id)}
                  title="Excluir produto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Gerenciamento de Sabores */}
        <ProductFlavorsDialog
          product={flavorProduct}
          open={!!flavorProduct}
          onOpenChange={(open) => !open && setFlavorProduct(null)}
        />
      </div>
    </AdminLayout>
  );
}

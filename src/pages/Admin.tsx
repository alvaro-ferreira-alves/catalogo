import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Tag, ShoppingCart, Settings, LogOut, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useOrders } from '@/hooks/useOrders';

export default function Admin() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: orders = [] } = useOrders();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const newOrders = orders.filter((o) => o.status === 'novo').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold">Painel Admin</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => window.open('/', '_blank')}>
              <ExternalLink className="h-4 w-4 mr-1" /> Ver Cardápio
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-primary">{products.length}</p>
              <p className="text-sm text-muted-foreground">Produtos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-primary">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Categorias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-primary">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Pedidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-warning">{newOrders}</p>
              <p className="text-sm text-muted-foreground">Novos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/admin/products">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Package className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Produtos & Sabores</CardTitle>
                <CardDescription>Gerenciar produtos, modelos, estoque e sabores</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/categories">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Tag className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Organizar categorias do menu</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <ShoppingCart className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Pedidos</CardTitle>
                <CardDescription>Acompanhar e gerenciar pedidos</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Settings className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Configurações</CardTitle>
                <CardDescription>Configurar loja e WhatsApp</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}

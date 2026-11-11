import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/menu';

export function useProducts(activeOnly = false, categoryId?: string) {
  return useQuery({
    queryKey: ['products', activeOnly, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (activeOnly) {
        query = query.eq('active', true);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: products, error } = await query;
      if (error) throw error;

      // Busca todos os sabores separadamente (evita problema de FK não registrada no schema)
      const { data: flavors } = await (supabase as any)
        .from('product_flavors')
        .select('*')
        .eq('active', true)
        .order('flavor', { ascending: true });

      // Junta os sabores aos produtos
      const productsWithFlavors = (products || []).map((product: any) => ({
        ...product,
        product_flavors: (flavors || []).filter(
          (f: any) => f.product_id === product.id
        ),
      }));

      return productsWithFlavors as Product[];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: { name: string; price: number; description?: string; image_url?: string; category_id?: string; active?: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          price: product.price,
          description: product.description ?? null,
          image_url: product.image_url ?? null,
          category_id: product.category_id ?? null,
          active: product.active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', product.id!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function uploadProductImage(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (uploadError) {
      reject(uploadError);
      return;
    }

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    resolve(data.publicUrl);
  });
}

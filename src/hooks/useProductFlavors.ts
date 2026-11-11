import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductFlavor } from '@/types/menu';

/**
 * Busca os sabores ativos de um produto para a vitrine
 */
export function useProductFlavors(productId: string | undefined) {
  return useQuery({
    queryKey: ['product_flavors', productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from('product_flavors' as any)
        .select('*')
        .eq('product_id', productId)
        .eq('active', true)
        .order('flavor', { ascending: true });

      if (error) {
        console.error('Erro ao buscar sabores:', error);
        return [];
      }
      return (data ?? []) as ProductFlavor[];
    },
    enabled: !!productId,
  });
}

/**
 * Busca TODOS os sabores de um produto para o painel administrativo (ativos e inativos)
 */
export function useAdminProductFlavors(productId: string | undefined) {
  return useQuery({
    queryKey: ['admin_product_flavors', productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from('product_flavors' as any)
        .select('*')
        .eq('product_id', productId)
        .order('flavor', { ascending: true });

      if (error) throw error;
      return (data ?? []) as ProductFlavor[];
    },
    enabled: !!productId,
  });
}

/**
 * Cadastrar novo sabor
 */
export function useCreateFlavor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      product_id,
      flavor,
      quantity = 0,
      active = true,
    }: {
      product_id: string;
      flavor: string;
      quantity?: number;
      active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('product_flavors' as any)
        .insert({
          product_id,
          flavor: flavor.trim(),
          quantity,
          active,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProductFlavor;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin_product_flavors', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['product_flavors', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Atualizar sabor (nome, quantidade ou status ativo)
 */
export function useUpdateFlavor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      product_id,
      flavor,
      quantity,
      active,
    }: {
      id: string;
      product_id: string;
      flavor?: string;
      quantity?: number;
      active?: boolean;
    }) => {
      const updates: any = {};
      if (flavor !== undefined) updates.flavor = flavor.trim();
      if (quantity !== undefined) updates.quantity = quantity;
      if (active !== undefined) updates.active = active;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('product_flavors' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProductFlavor;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin_product_flavors', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['product_flavors', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Excluir sabor
 */
export function useDeleteFlavor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, product_id }: { id: string; product_id: string }) => {
      const { error } = await supabase
        .from('product_flavors' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin_product_flavors', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['product_flavors', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

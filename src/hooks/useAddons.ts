import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/menu';

/**
 * Fetches all products belonging to a category named "Adicionais"
 * and returns them as available addons.
 *
 * This relies on the existing "Adicionais" category in the products table
 * — no new Supabase tables are needed.
 */
export function useAvailableAddons(): { data: Product[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['addons'],
    queryFn: async () => {
      // 1. Find the category whose name is "Adicionais"
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', 'adicionais')
        .limit(1);

      if (catError) throw catError;
      if (!categories || categories.length === 0) return [] as Product[];

      const addonCategoryId = categories[0].id;

      // 2. Fetch active products of that category
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', addonCategoryId)
        .eq('active', true)
        .order('name', { ascending: true });

      if (prodError) throw prodError;
      return (products ?? []) as Product[];
    },
  });

  return { data: data ?? [], isLoading };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StoreSettings } from '@/types/menu';

export function useStoreSettings() {
  return useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as StoreSettings;
    },
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<StoreSettings>) => {
      const { data, error } = await supabase
        .from('store_settings')
        .update(settings)
        .eq('id', settings.id!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    },
  });
}

export function isStoreOpen(settings: StoreSettings | undefined): boolean {
  if (!settings) return false;
  if (!settings.is_open) return false;

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  
  return currentTime >= settings.open_time.slice(0, 5) && 
         currentTime <= settings.close_time.slice(0, 5);
}

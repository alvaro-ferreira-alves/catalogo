import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  active: boolean;
}

export function useDeliveryZones() {
  return useQuery({
    queryKey: ['delivery_zones'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('delivery_zones')
        .select('id, name, fee, active')
        .eq('active', true)
        .order('fee', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as DeliveryZone[];
    },
  });
}

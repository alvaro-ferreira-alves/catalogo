import { StoreSettings } from '@/types/menu';

interface StoreClosedBannerProps {
  settings: StoreSettings | undefined;
}

export function StoreClosedBanner({ settings }: StoreClosedBannerProps) {
  if (!settings) return null;

  return (
    <div className="w-full my-3 px-4 py-3 rounded-2xl border border-red-200 bg-red-50/80 dark:border-destructive/30 dark:bg-destructive/10 text-red-600 dark:text-destructive text-xs sm:text-sm">
      <span>Estamos fechados agora — você ainda pode montar seu pedido.</span>
    </div>
  );
}

import { Clock, Share2 } from 'lucide-react';
import { StoreSettings } from '@/types/menu';
import { isStoreOpen } from '@/hooks/useStoreSettings';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MenuHeaderProps {
  settings: StoreSettings | undefined;
  isLoading: boolean;
}

export function MenuHeader({ settings, isLoading }: MenuHeaderProps) {
  const storeOpen = isStoreOpen(settings);

  const handleShare = () => {
    const shareData = {
      title: settings?.store_name || 'Catálogo Digital',
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  if (isLoading) {
    return (
      <header className="pt-5 pb-2 animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-2" />
        <div className="h-4 bg-muted rounded w-36" />
      </header>
    );
  }

  const openTime = settings?.open_time?.slice(0, 5) || '08:00';
  const closeTime = settings?.close_time?.slice(0, 5) || '22:00';

  return (
    <header className="pt-5 pb-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            {settings?.store_name || 'Distribuidora Express'}
          </h1>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-0.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className={storeOpen ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
              {storeOpen ? 'Aberto' : 'Fechado'}
            </span>
            <span>•</span>
            <span>hoje {openTime}–{closeTime}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          aria-label="Compartilhar"
          className="h-9 w-9 rounded-full border-border/80 text-foreground/80 hover:text-foreground hover:bg-muted shrink-0"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

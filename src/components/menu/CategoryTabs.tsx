import { Category } from '@/types/menu';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryTabs({ categories, selectedCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <div className="w-full my-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={cn(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all select-none',
            selectedCategory === null
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'border border-border/80 bg-background text-foreground/80 hover:bg-muted/60'
          )}
        >
          Todos
        </button>

        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap select-none',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border/80 bg-background text-foreground/80 hover:bg-muted/60'
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TopCategory {
  category_id: string;
  category_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface CategoryFilterProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
}

export function CategoryFilter({ selectedCategoryId, onCategoryChange }: CategoryFilterProps) {
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopCategories();
  }, []);

  const fetchTopCategories = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_top_categories_by_sales', { limit_count: 10 });

      if (error) throw error;
      setTopCategories(data || []);
    } catch (error) {
      console.error('Error fetching top categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full mb-6">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Categorías</h3>
        <Badge variant="secondary" className="text-xs">
          Top 10 más vendidas
        </Badge>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Button
            variant={!selectedCategoryId ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(undefined)}
            className="shrink-0"
          >
            Todas
          </Button>
          
          {topCategories.map((category) => (
            <Button
              key={category.category_id}
              variant={selectedCategoryId === category.category_id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.category_id)}
              className="shrink-0 flex flex-col h-auto py-2 px-3"
            >
              <span className="text-sm font-medium">{category.category_name}</span>
              <span className="text-xs text-muted-foreground">
                {category.total_quantity} vendidos
              </span>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
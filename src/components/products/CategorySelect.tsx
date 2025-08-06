import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface CategorySelectProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function CategorySelect({ 
  value, 
  onValueChange, 
  label = "Categoría", 
  placeholder = "Seleccionar categoría",
  required = false 
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveCategories();
  }, []);

  const fetchActiveCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="category-select">{label}</Label>
      <Select 
        value={value || "none"} 
        onValueChange={(val) => onValueChange(val === "none" ? undefined : val)}
        disabled={loading}
      >
        <SelectTrigger id="category-select">
          <SelectValue placeholder={loading ? "Cargando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="none">Sin categoría</SelectItem>
          )}
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
              {category.description && (
                <span className="text-muted-foreground ml-2">
                  - {category.description}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
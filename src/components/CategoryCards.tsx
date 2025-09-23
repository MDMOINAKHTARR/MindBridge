import { Heart, Brain, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name_en: string;
  name_hi: string;
  slug: string;
}

interface CategoryCardsProps {
  categories: Category[];
  selectedLanguage: 'en' | 'hi';
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  resourceCounts: Record<string, number>;
}

export const CategoryCards = ({ 
  categories, 
  selectedLanguage, 
  selectedCategory, 
  onCategorySelect,
  resourceCounts 
}: CategoryCardsProps) => {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'relaxation': return <Heart className="w-8 h-8" />;
      case 'study-stress': return <Brain className="w-8 h-8" />;
      case 'sleep': return <Moon className="w-8 h-8" />;
      default: return <Heart className="w-8 h-8" />;
    }
  };

  const getCategoryColor = (slug: string) => {
    switch (slug) {
      case 'relaxation': return 'border-wellness-safe/20 hover:border-wellness-safe bg-wellness-safe/5 hover:bg-wellness-safe/10';
      case 'study-stress': return 'border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary/10';
      case 'sleep': return 'border-secondary/20 hover:border-secondary bg-secondary/5 hover:bg-secondary/10';
      default: return 'border-muted hover:border-primary bg-muted/10 hover:bg-primary/5';
    }
  };

  const getCategoryDescription = (slug: string, language: 'en' | 'hi') => {
    const descriptions = {
      'relaxation': {
        en: 'Mindfulness exercises, breathing techniques, and relaxation methods',
        hi: 'माइंडफुलनेस अभ्यास, सांस की तकनीक, और विश्राम के तरीके'
      },
      'study-stress': {
        en: 'Exam pressure management, study techniques, and stress relief',
        hi: 'परीक्षा दबाव प्रबंधन, अध्ययन तकनीक, और तनाव से राहत'
      },
      'sleep': {
        en: 'Sleep hygiene tips, bedtime routines, and rest improvement',
        hi: 'नींद की स्वच्छता के सुझाव, सोने का समय, और आराम में सुधार'
      }
    };
    return descriptions[slug as keyof typeof descriptions]?.[language] || '';
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {categories.map((category) => (
        <Card
          key={category.id}
          className={`p-6 cursor-pointer transition-all duration-300 border-2 ${
            selectedCategory === category.id
              ? 'border-primary bg-primary/10 shadow-card scale-105'
              : getCategoryColor(category.slug)
          }`}
          onClick={() => onCategorySelect(category.id)}
        >
          <div className="text-center">
            <div className={`inline-flex p-4 rounded-full mb-4 ${
              selectedCategory === category.id ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {getCategoryIcon(category.slug)}
            </div>
            
            <h3 className="font-semibold text-lg mb-2">
              {selectedLanguage === 'hi' ? category.name_hi : category.name_en}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {getCategoryDescription(category.slug, selectedLanguage)}
            </p>
            
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                {resourceCounts[category.id] || 0} resources
              </Badge>
              {category.slug === 'relaxation' && (
                <Badge className="bg-wellness-safe/10 text-wellness-safe border-wellness-safe/20 text-xs">
                  हिंदी
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
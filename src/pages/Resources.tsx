import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Search, Trophy, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CategoryCards } from "@/components/CategoryCards";
import { ResourceCard } from "@/components/ResourceCard";

interface ResourceCategory {
  id: string;
  name_en: string;
  name_hi: string;
  slug: string;
}

interface Resource {
  id: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  content_en?: string;
  content_hi?: string;
  type: 'video' | 'pdf' | 'audio' | 'article';
  category_id: string;
  duration_minutes?: number;
  file_url?: string;
  thumbnail_url?: string;
  is_featured: boolean;
  view_count: number;
  helpful_count?: number;
  not_helpful_count?: number;
}

const Resources = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const { toast } = useToast();
  
  // Gamification state
  const [earnedBadges, setEarnedBadges] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('resourceBadges') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    fetchCategories();
    fetchResources();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('resource_categories')
      .select('*')
      .order('name_en');

    if (error) {
      toast({
        title: "Error loading categories",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCategories(data || []);
    }
  };

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('view_count', { ascending: false });

    if (error) {
      toast({
        title: "Error loading resources",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setResources(data?.map(item => ({
        ...item,
        type: item.type as 'video' | 'pdf' | 'audio' | 'article'
      })) || []);
    }
  };

  const updateViewCount = async (resourceId: string) => {
    // First get current view count
    const { data: currentResource } = await supabase
      .from('resources')
      .select('view_count')
      .eq('id', resourceId)
      .single();

    if (currentResource) {
      const { error } = await supabase
        .from('resources')
        .update({ view_count: currentResource.view_count + 1 })
        .eq('id', resourceId);

      if (!error) {
        setResources(prev => prev.map(r => 
          r.id === resourceId ? { ...r, view_count: r.view_count + 1 } : r
        ));
      }
    }
  };

  const awardBadge = () => {
    const badgeCount = Object.values(earnedBadges).filter(Boolean).length;
    const newBadgeId = `knowledge-seeker-${Date.now()}`;
    const updated = { ...earnedBadges, [newBadgeId]: true };
    setEarnedBadges(updated);
    localStorage.setItem('resourceBadges', JSON.stringify(updated));
    localStorage.setItem('badgesCount', String(badgeCount + 1));
    
    toast({ 
      title: 'Badge earned! 📖', 
      description: 'Knowledge Seeker +1 for engaging with content.' 
    });
  };

  // Filter resources based on category and search
  const filteredResources = resources.filter(resource => {
    const categoryMatch = selectedCategory === 'all' || resource.category_id === selectedCategory;
    const searchMatch = searchTerm === '' || 
      resource.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.title_hi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description_hi.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  // Calculate resource counts per category
  const resourceCounts = categories.reduce((acc, category) => {
    acc[category.id] = resources.filter(r => r.category_id === category.id).length;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    return selectedLanguage === 'hi' ? category.name_hi : category.name_en;
  };

  const badgeCount = Object.values(earnedBadges).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-6xl mx-auto pt-12">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Psychoeducational Hub
            </h1>
            
            {badgeCount > 0 && (
              <Badge className="bg-wellness-safe/10 text-wellness-safe border-wellness-safe/20 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                {badgeCount} Badge{badgeCount !== 1 ? 's' : ''} Earned
              </Badge>
            )}
          </div>
          
          <p className="text-muted-foreground max-w-3xl">
            {selectedLanguage === 'en' 
              ? 'Explore our curated collection of wellness resources designed to support your mental health journey. All content is available in multiple languages and formats.'
              : 'अपनी मानसिक स्वास्थ्य यात्रा का समर्थन करने के लिए डिज़ाइन किए गए हमारे कल्याण संसाधनों के क्यूरेटेड संग्रह का अन्वेषण करें। सभी सामग्री कई भाषाओं और प्रारूपों में उपलब्ध है।'
            }
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'hi')}
              className="bg-white border-2 border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={selectedLanguage === 'en' ? 'Search resources...' : 'संसाधन खोजें...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-primary"
              />
            </div>
          </div>

          {/* Reset Button */}
          {(selectedCategory !== 'all' || searchTerm) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Category Selection */}
        <CategoryCards
          categories={categories}
          selectedLanguage={selectedLanguage}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          resourceCounts={resourceCounts}
        />

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {selectedCategory === 'all' 
                ? (selectedLanguage === 'en' ? 'All Resources' : 'सभी संसाधन')
                : getCategoryName(selectedCategory)
              }
            </h2>
            <Badge variant="outline">
              {filteredResources.length} {selectedLanguage === 'en' ? 'resources found' : 'संसाधन मिले'}
            </Badge>
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                selectedLanguage={selectedLanguage}
                categoryName={getCategoryName(resource.category_id)}
                onViewUpdate={updateViewCount}
                onBadgeEarned={awardBadge}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {selectedLanguage === 'en' ? 'No resources found' : 'कोई संसाधन नहीं मिला'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedLanguage === 'en' 
                  ? 'Try adjusting your search terms or browse different categories.'
                  : 'अपने खोज शब्दों को समायोजित करने या विभिन्न श्रेणियों को ब्राउज़ करने का प्रयास करें।'
                }
              </p>
              <Button onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}>
                {selectedLanguage === 'en' ? 'Browse All Resources' : 'सभी संसाधन ब्राउज़ करें'}
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        <Card className="p-6 bg-gradient-wellness/10 border-0 shadow-soft">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-1">{resources.length}</div>
              <div className="text-sm text-muted-foreground">
                {selectedLanguage === 'en' ? 'Total Resources' : 'कुल संसाधन'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-wellness-safe mb-1">{categories.length}</div>
              <div className="text-sm text-muted-foreground">
                {selectedLanguage === 'en' ? 'Categories' : 'श्रेणियां'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary mb-1">
                {resources.reduce((sum, r) => sum + r.view_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedLanguage === 'en' ? 'Total Views' : 'कुल दृश्य'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-wellness-warning mb-1">{badgeCount}</div>
              <div className="text-sm text-muted-foreground">
                {selectedLanguage === 'en' ? 'Badges Earned' : 'अर्जित बैज'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Resources;
import { useState, useEffect } from "react";
import { ArrowLeft, Play, FileText, Volume2, Globe, Clock, Heart, Download, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

const Resources = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const { toast } = useToast();

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

  const filteredResources = resources.filter(resource => {
    const categoryMatch = selectedCategory === 'all' || resource.category_id === selectedCategory;
    return categoryMatch;
  });

  const getTitle = (resource: Resource) => {
    return selectedLanguage === 'hi' ? resource.title_hi : resource.title_en;
  };

  const getDescription = (resource: Resource) => {
    return selectedLanguage === 'hi' ? resource.description_hi : resource.description_en;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    return selectedLanguage === 'hi' ? category.name_hi : category.name_en;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'audio': return <Volume2 className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-primary/10 text-primary';
      case 'audio': return 'bg-wellness-safe/10 text-wellness-safe';
      case 'pdf': return 'bg-secondary/10 text-secondary';
      case 'article': return 'bg-wellness-warning/10 text-wellness-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-6xl mx-auto pt-12">
        <Link to="/booking" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            Psychoeducational Hub
          </h1>
          <p className="text-muted-foreground">
            Explore our collection of wellness resources designed to support your mental health journey.
          </p>
        </div>

        {/* Language & Category Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'hi')}
              className="bg-white border-2 border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="bg-white border border-border">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {selectedLanguage === 'hi' ? category.name_hi : category.name_en}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="p-6 shadow-soft border-0 hover:shadow-card transition-all duration-300 group cursor-pointer"
                  onClick={() => updateViewCount(resource.id)}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getCategoryColor(resource.type)}`}>
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex items-center gap-2">
                  {resource.is_featured && (
                    <Badge className="bg-wellness-warning/10 text-wellness-warning border-wellness-warning/20">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {resource.type.toUpperCase()}
                  </Badge>
                  {resource.duration_minutes && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {resource.duration_minutes}m
                    </div>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {getTitle(resource)}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {getDescription(resource)}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(resource.type)} variant="outline">
                    {getCategoryName(resource.category_id)}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {resource.view_count}
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="group-hover:text-primary">
                  {resource.file_url ? (
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Access
                    </div>
                  ) : (
                    'View Content'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Stress-Busting Challenges */}
        <Card className="p-8 shadow-card border-0 bg-gradient-wellness/10">
          <h2 className="text-2xl font-bold mb-6 text-center">🎮 Stress-Busting Challenges</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-soft hover:shadow-card transition-all">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">💃🕺</div>
                <h3 className="font-semibold text-lg">Dance It Out</h3>
              </div>
              <p className="text-muted-foreground text-sm text-center mb-4">
                Take a 3-5 minute dance break! Pick your favorite track and move your body to release stress and boost energy.
              </p>
              <div className="space-y-2 mb-4">
                <Button variant="outline" size="sm" className="w-full">🎵 Lo-fi Beats</Button>
                <Button variant="outline" size="sm" className="w-full">🎭 Bollywood Hits</Button>
                <Button variant="outline" size="sm" className="w-full">🎤 K-pop Energy</Button>
              </div>
              <Button variant="wellness" size="sm" className="w-full">
                Start Dancing! 🎶
              </Button>
            </Card>

            <Card className="p-6 border-0 shadow-soft hover:shadow-card transition-all">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">📔</div>
                <h3 className="font-semibold text-lg">Journal Quest</h3>
              </div>
              <p className="text-muted-foreground text-sm text-center mb-4">
                Daily 1-minute journaling with creative prompts to help you reflect and process your thoughts.
              </p>
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-center">Today's Prompt:</p>
                <p className="text-sm text-muted-foreground text-center italic">
                  "If stress was an animal today, which one would it be and why?"
                </p>
              </div>
              <Button variant="secondary" size="sm" className="w-full">
                Start Writing 🌟
              </Button>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Resources;
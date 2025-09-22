import { useState, useEffect } from "react";
import { ArrowLeft, Play, FileText, Volume2, Globe, Clock, Heart, Download, Eye, Award } from "lucide-react";
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
  const [earnedBadges, setEarnedBadges] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('resourceBadges') || '{}'); } catch { return {}; }
  });
  const [topChallenges, setTopChallenges] = useState<Array<{ name: string; count: number }>>([]);
  // Dance challenge state
  const [danceRunning, setDanceRunning] = useState(false);
  const [danceSeconds, setDanceSeconds] = useState(0);
  const [danceTrack, setDanceTrack] = useState<string>('Lo-fi Beats');
  const [danceAudioUrl, setDanceAudioUrl] = useState<string>('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  // Journal challenge state
  const [journalRunning, setJournalRunning] = useState(false);
  const [journalSeconds, setJournalSeconds] = useState(0);
  const [journalText, setJournalText] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchResources();
    loadTopChallenges();
    let danceTimer: number | undefined;
    let journalTimer: number | undefined;
    if (danceRunning) {
      danceTimer = window.setInterval(() => setDanceSeconds((s) => s + 1), 1000);
    }
    if (journalRunning) {
      journalTimer = window.setInterval(() => setJournalSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (danceTimer) window.clearInterval(danceTimer);
      if (journalTimer) window.clearInterval(journalTimer);
    };
  }, []);

  useEffect(() => {
    if (danceRunning && danceSeconds >= 60) {
      // complete dance
      setDanceRunning(false);
      incrementChallenge('Dance It Out');
      toast({ title: 'Nice moves! 💃🕺', description: 'Dance challenge completed. Badge progress updated.' });
    }
  }, [danceRunning, danceSeconds]);

  useEffect(() => {
    if (journalRunning && journalSeconds >= 60) {
      setJournalRunning(false);
      incrementChallenge('Journal Quest');
      toast({ title: 'Well done! ✍️', description: '1-minute journaling done. You can save your note now.' });
    }
  }, [journalRunning, journalSeconds]);

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

  const loadTopChallenges = () => {
    try {
      const counts = JSON.parse(localStorage.getItem('challengeCounts') || '{}') as Record<string, number>;
      const top = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      setTopChallenges(top);
    } catch {
      setTopChallenges([]);
    }
  };

  const incrementChallenge = (name: string) => {
    const key = 'challengeCounts';
    const counts = (() => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } })();
    counts[name] = (counts[name] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(counts));
    loadTopChallenges();
  };

  const selectDanceTrack = (label: string) => {
    setDanceTrack(label);
    // Map labels to demo audio URLs
    const map: Record<string, string> = {
      'Lo-fi Beats': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'Bollywood Hits': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'K-pop Energy': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    };
    setDanceAudioUrl(map[label] || map['Lo-fi Beats']);
  };

  const startDance = () => {
    setDanceSeconds(0);
    setDanceRunning(true);
  };

  const stopDance = () => {
    setDanceRunning(false);
  };

  const startJournal = () => {
    setJournalSeconds(0);
    setJournalRunning(true);
  };

  const saveJournal = () => {
    const entries = (() => { try { return JSON.parse(localStorage.getItem('journalEntries') || '[]'); } catch { return []; } })();
    entries.push({ ts: new Date().toISOString(), text: journalText });
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    awardBadge('journal-badge');
    setJournalText('');
    toast({ title: 'Saved', description: 'Your journal entry has been saved locally.' });
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

  const awardBadge = (resourceId: string) => {
    const updated = { ...earnedBadges, [resourceId]: true };
    setEarnedBadges(updated);
    localStorage.setItem('resourceBadges', JSON.stringify(updated));
    // track gamification summary
    const count = Object.values(updated).filter(Boolean).length;
    localStorage.setItem('badgesCount', String(count));
    toast({ title: 'Badge earned!', description: '📖 Knowledge Seeker +1 for completing a resource.' });
  };

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
                  onClick={() => { updateViewCount(resource.id); }}>
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
                  {earnedBadges[resource.id] && (
                    <Badge className="bg-wellness-safe/10 text-wellness-safe border-wellness-safe/20 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Badge
                    </Badge>
                  )}
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
                {resource.file_url ? (
                  <a
                    href={resource.file_url}
                    download
                    onClick={(e) => { e.stopPropagation(); awardBadge(resource.id); }}
                    className="text-sm underline text-primary inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                ) : (
                  <Button size="sm" variant="ghost" className="group-hover:text-primary" onClick={(e) => { e.stopPropagation(); awardBadge(resource.id); }}>
                    View Content
                  </Button>
                )}
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
                <Button variant={danceTrack==='Lo-fi Beats'? 'wellness':'outline'} size="sm" className="w-full" onClick={() => selectDanceTrack('Lo-fi Beats')}>🎵 Lo-fi Beats</Button>
                <Button variant={danceTrack==='Bollywood Hits'? 'wellness':'outline'} size="sm" className="w-full" onClick={() => selectDanceTrack('Bollywood Hits')}>🎭 Bollywood Hits</Button>
                <Button variant={danceTrack==='K-pop Energy'? 'wellness':'outline'} size="sm" className="w-full" onClick={() => selectDanceTrack('K-pop Energy')}>🎤 K-pop Energy</Button>
              </div>
              <audio src={danceAudioUrl} controls className="w-full mb-3" onPlay={startDance} onPause={stopDance} />
              <div className="text-xs text-muted-foreground text-center mb-3">Timer: {Math.min(danceSeconds,60)}s / 60s</div>
              {!danceRunning ? (
                <Button variant="wellness" size="sm" className="w-full" onClick={() => { startDance(); toast({ title: 'Challenge started!', description: 'Good vibes incoming 🎶' }); }}>
                  Start Dancing! 🎶
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={stopDance}>Pause</Button>
              )}
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
              {!journalRunning ? (
                <Button variant="secondary" size="sm" className="w-full mb-3" onClick={startJournal}>
                  Start 1-min Writing 🌟
                </Button>
              ) : (
                <div className="text-xs text-muted-foreground text-center mb-3">Timer: {Math.min(journalSeconds,60)}s / 60s</div>
              )}
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full p-3 border rounded-md min-h-[100px]"
              />
              <div className="flex gap-2 mt-3">
                <Button variant="wellness" size="sm" className="flex-1" onClick={saveJournal} disabled={!journalText.trim()}>
                  Save Entry
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setJournalText('')}>
                  Clear
                </Button>
              </div>
            </Card>
          </div>

          {topChallenges.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-center mb-3">Top 3 challenges completed this week</h3>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                {topChallenges.map((c) => (
                  <div key={c.name} className="px-3 py-1 bg-white/60 rounded-md shadow-soft">
                    {c.name}: {c.count}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Resources;
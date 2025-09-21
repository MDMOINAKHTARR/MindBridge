import { useState } from "react";
import { ArrowLeft, Play, FileText, Volume2, Globe, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'audio';
  duration: string;
  category: 'relaxation' | 'study' | 'sleep';
  language: 'en' | 'hi';
  thumbnail?: string;
}

const resources: Resource[] = [
  {
    id: '1',
    title: '5-Minute Mindfulness Meditation',
    description: 'A gentle guided meditation to help you find calm and center yourself.',
    type: 'video',
    duration: '5 min',
    category: 'relaxation',
    language: 'en'
  },
  {
    id: '2',
    title: 'Progressive Muscle Relaxation',
    description: 'Learn to release physical tension and stress from your body.',
    type: 'audio',
    duration: '12 min',
    category: 'relaxation',
    language: 'en'
  },
  {
    id: '3',
    title: 'Effective Study Techniques Guide',
    description: 'Evidence-based strategies to improve your learning and retention.',
    type: 'pdf',
    duration: '8 min read',
    category: 'study',
    language: 'en'
  },
  {
    id: '4',
    title: 'मानसिक शांति के लिए ध्यान',
    description: 'मन की शांति और एकाग्रता के लिए सरल ध्यान तकनीक।',
    type: 'video',
    duration: '7 min',
    category: 'relaxation',
    language: 'hi'
  },
  {
    id: '5',
    title: 'Sleep Hygiene for Students',
    description: 'Tips and techniques for better sleep quality and consistent sleep schedule.',
    type: 'video',
    duration: '6 min',
    category: 'sleep',
    language: 'en'
  },
  {
    id: '6',
    title: 'Breathing Exercises for Anxiety',
    description: 'Simple breathing techniques you can use anywhere to manage anxiety.',
    type: 'audio',
    duration: '10 min',
    category: 'relaxation',
    language: 'en'
  }
];

const Resources = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'relaxation' | 'study' | 'sleep'>('all');

  const filteredResources = resources.filter(resource => {
    const languageMatch = resource.language === selectedLanguage;
    const categoryMatch = selectedCategory === 'all' || resource.category === selectedCategory;
    return languageMatch && categoryMatch;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'audio': return <Volume2 className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'relaxation': return 'bg-wellness-safe/10 text-wellness-safe';
      case 'study': return 'bg-primary/10 text-primary';
      case 'sleep': return 'bg-secondary/10 text-secondary';
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

          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
            <TabsList className="bg-white border border-border">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="relaxation">Relaxation</TabsTrigger>
              <TabsTrigger value="study">Study Stress</TabsTrigger>
              <TabsTrigger value="sleep">Sleep</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="p-6 shadow-soft border-0 hover:shadow-card transition-all duration-300 group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getCategoryColor(resource.category)}`}>
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {resource.type.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {resource.duration}
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {resource.description}
              </p>

              <div className="flex items-center justify-between">
                <Badge className={getCategoryColor(resource.category)} variant="outline">
                  {resource.category}
                </Badge>
                <Button size="sm" variant="ghost" className="group-hover:text-primary">
                  Access Resource
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
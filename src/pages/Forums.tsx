import { useState, useEffect } from "react";
import { ArrowLeft, Plus, MessageCircle, Users, Pin, Lock, ThumbsUp, Globe, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ForumCategory {
  id: string;
  name_en: string;
  name_hi: string;
  description_en: string;
  description_hi: string;
  slug: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  upvotes: number;
  view_count: number;
  created_at: string;
  user_id: string;
  category_id: string;
}

const Forums = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    is_anonymous: false,
    category_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
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

  const fetchPosts = async () => {
    let query = supabase
      .from('forum_posts')
      .select('*')
      .eq('is_moderated', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPosts(data || []);
    }
  };

  const createPost = async () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('forum_posts')
      .insert([{
        ...newPost,
        user_id: 'anonymous-user' // For demo purposes
      }]);

    if (error) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post created successfully!",
      });
      setShowNewPostDialog(false);
      setNewPost({ title: '', content: '', is_anonymous: false, category_id: '' });
      fetchPosts();
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-6xl mx-auto pt-12">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Peer Support Forums
            </h1>
            <p className="text-muted-foreground">
              Connect with fellow students and share your experiences in a safe, moderated environment.
            </p>
          </div>

          <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    value={newPost.category_id}
                    onChange={(e) => setNewPost({ ...newPost, category_id: e.target.value })}
                    className="w-full mt-1 bg-white border-2 border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {selectedLanguage === 'hi' ? category.name_hi : category.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="What's on your mind?"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your thoughts, experiences, or ask for support..."
                    rows={6}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={newPost.is_anonymous}
                    onCheckedChange={(checked) => setNewPost({ ...newPost, is_anonymous: checked })}
                  />
                  <Label htmlFor="anonymous">Post anonymously</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={createPost} className="flex-1">
                    Create Post
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Controls */}
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

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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

        {/* Forum Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <Card key={category.id} className="p-4 shadow-soft border-0 hover:shadow-card transition-all cursor-pointer"
                  onClick={() => setSelectedCategory(category.id)}>
              <h3 className="font-semibold text-lg mb-2">
                {selectedLanguage === 'hi' ? category.name_hi : category.name_en}
              </h3>
              <p className="text-muted-foreground text-sm">
                {selectedLanguage === 'hi' ? category.description_hi : category.description_en}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <MessageCircle className="w-3 h-3" />
                {posts.filter(p => p.category_id === category.id).length} posts
              </div>
            </Card>
          ))}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="p-6 shadow-soft border-0 hover:shadow-card transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {post.is_pinned && <Pin className="w-4 h-4 text-primary" />}
                  {post.is_locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  <Badge variant="outline" className="text-xs">
                    {categories.find(c => c.id === post.category_id)?.[selectedLanguage === 'hi' ? 'name_hi' : 'name_en']}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(post.created_at)}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-3 hover:text-primary transition-colors cursor-pointer">
                {post.title}
              </h3>

              <p className="text-muted-foreground mb-4 line-clamp-3">
                {post.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {post.is_anonymous ? 'Anonymous' : 'Student'}
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {post.upvotes}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.view_count} views
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Discussion
                </Button>
              </div>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to start a conversation in this category!
              </p>
              <Button onClick={() => setShowNewPostDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forums;
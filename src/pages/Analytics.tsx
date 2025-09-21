import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Users, MessageSquare, Calendar, Eye, AlertTriangle, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalAssessments: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
  };
  totalBookings: number;
  activeUsers: number;
  chatInteractions: number;
  crisisDetections: number;
  averageSessionDuration: number;
  resourceViews: number;
}

interface TrendData {
  date: string;
  assessments: number;
  bookings: number;
  chats: number;
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalAssessments: 0,
    riskDistribution: { low: 0, moderate: 0, high: 0 },
    totalBookings: 0,
    activeUsers: 0,
    chatInteractions: 0,
    crisisDetections: 0,
    averageSessionDuration: 0,
    resourceViews: 0
  });
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
    generateMockTrendData();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Fetch assessment results
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessment_results')
        .select('score, risk_level, completed_at');

      if (assessmentsError) throw assessmentsError;

      // Fetch chat interactions
      const { data: chats, error: chatsError } = await supabase
        .from('chat_interactions')
        .select('message_count, crisis_keywords_detected, session_duration_minutes, created_at');

      if (chatsError) throw chatsError;

      // Fetch user sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('page_views, features_used, session_start, session_end');

      if (sessionsError) throw sessionsError;

      // Calculate analytics
      const totalAssessments = assessments?.length || 0;
      const riskDistribution = {
        low: assessments?.filter(a => a.risk_level === 'low').length || 0,
        moderate: assessments?.filter(a => a.risk_level === 'moderate').length || 0,
        high: assessments?.filter(a => a.risk_level === 'high').length || 0
      };

      const chatInteractions = chats?.length || 0;
      const crisisDetections = chats?.filter(c => c.crisis_keywords_detected).length || 0;
      
      const avgDuration = chats?.reduce((acc, chat) => 
        acc + (chat.session_duration_minutes || 0), 0) / (chats?.length || 1);

      setAnalytics({
        totalAssessments,
        riskDistribution,
        totalBookings: 47, // Mock data
        activeUsers: sessions?.length || 0,
        chatInteractions,
        crisisDetections,
        averageSessionDuration: Math.round(avgDuration),
        resourceViews: 234 // Mock data
      });

    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateMockTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: TrendData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        assessments: Math.floor(Math.random() * 20) + 5,
        bookings: Math.floor(Math.random() * 15) + 2,
        chats: Math.floor(Math.random() * 30) + 10
      });
    }
    
    setTrendData(data);
  };

  const getRiskColor = (level: 'low' | 'moderate' | 'high') => {
    switch (level) {
      case 'low': return 'text-wellness-safe';
      case 'moderate': return 'text-wellness-warning';
      case 'high': return 'text-wellness-danger';
    }
  };

  const getRiskPercentage = (count: number) => {
    return analytics.totalAssessments > 0 
      ? Math.round((count / analytics.totalAssessments) * 100) 
      : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-7xl mx-auto pt-12">
        <Link to="/admin" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time insights and trends for institutional mental health planning.
          </p>
        </div>

        {/* Time Range Selector */}
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)} className="mb-8">
          <TabsList className="bg-white border border-border">
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
            <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="secondary">+12% vs last period</Badge>
            </div>
            <h3 className="text-2xl font-bold">{analytics.totalAssessments}</h3>
            <p className="text-muted-foreground">Total Assessments</p>
          </Card>

          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
              <Badge variant="secondary">+8% vs last period</Badge>
            </div>
            <h3 className="text-2xl font-bold">{analytics.totalBookings}</h3>
            <p className="text-muted-foreground">Counseling Bookings</p>
          </Card>

          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-wellness-safe/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-wellness-safe" />
              </div>
              <Badge variant="secondary">+23% vs last period</Badge>
            </div>
            <h3 className="text-2xl font-bold">{analytics.chatInteractions}</h3>
            <p className="text-muted-foreground">Chat Sessions</p>
          </Card>

          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-wellness-danger/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-wellness-danger" />
              </div>
              <Badge variant="destructive">{analytics.crisisDetections} detected</Badge>
            </div>
            <h3 className="text-2xl font-bold">{analytics.crisisDetections}</h3>
            <p className="text-muted-foreground">Crisis Interventions</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Distribution */}
          <Card className="p-6 shadow-soft border-0">
            <h3 className="text-xl font-semibold mb-6">Mental Health Risk Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-wellness-safe rounded-full"></div>
                  <span>Low Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {analytics.riskDistribution.low} ({getRiskPercentage(analytics.riskDistribution.low)}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={getRiskPercentage(analytics.riskDistribution.low)} 
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-wellness-warning rounded-full"></div>
                  <span>Moderate Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {analytics.riskDistribution.moderate} ({getRiskPercentage(analytics.riskDistribution.moderate)}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={getRiskPercentage(analytics.riskDistribution.moderate)} 
                className="h-2"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-wellness-danger rounded-full"></div>
                  <span>High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {analytics.riskDistribution.high} ({getRiskPercentage(analytics.riskDistribution.high)}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={getRiskPercentage(analytics.riskDistribution.high)} 
                className="h-2"
              />
            </div>
          </Card>

          {/* Additional Metrics */}
          <Card className="p-6 shadow-soft border-0">
            <h3 className="text-xl font-semibold mb-6">Platform Engagement</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Active Users</span>
                </div>
                <span className="font-semibold">{analytics.activeUsers}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-secondary" />
                  <span>Resource Views</span>
                </div>
                <span className="font-semibold">{analytics.resourceViews}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-wellness-safe" />
                  <span>Avg. Session Duration</span>
                </div>
                <span className="font-semibold">{analytics.averageSessionDuration} min</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Trends Chart Placeholder */}
        <Card className="p-6 shadow-soft border-0">
          <h3 className="text-xl font-semibold mb-6">Usage Trends</h3>
          <div className="h-64 bg-gradient-subtle rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Interactive charts showing assessment trends, booking patterns, and platform usage over time.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {trendData.length} data points collected over {timeRange}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
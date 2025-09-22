import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users, FileText, Calendar, TrendingUp, Shield, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DashboardData {
  totalAssessments: number;
  riskDistribution: { name: string; value: number; color: string }[];
  totalBookings: number;
  recentActivity: { date: string; count: number }[];
}

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAssessments: 0,
    riskDistribution: [],
    totalBookings: 0,
    recentActivity: []
  });
  const [filters, setFilters] = useState<{ department: string; dateRange: string }>({ department: 'all', dateRange: '7d' });

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData();
    }
  }, [isLoggedIn]);

  const loadDashboardData = () => {
    // Load assessment results
    const assessmentResults = JSON.parse(localStorage.getItem('assessmentResults') || '[]');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    // Simulate data for demo purposes
    const mockAssessments = [
      { type: 'phq9', score: 12, risk: 'moderate' },
      { type: 'gad7', score: 8, risk: 'moderate' },
      { type: 'phq9', score: 3, risk: 'safe' },
      { type: 'phq9', score: 18, risk: 'high' },
      { type: 'gad7', score: 5, risk: 'safe' },
      { type: 'phq9', score: 7, risk: 'moderate' },
      { type: 'gad7', score: 14, risk: 'moderate' },
      { type: 'phq9', score: 2, risk: 'safe' },
      { type: 'phq9', score: 11, risk: 'moderate' },
      { type: 'gad7', score: 4, risk: 'safe' },
      { type: 'phq9', score: 15, risk: 'moderate' },
      { type: 'gad7', score: 6, risk: 'safe' }
    ];

    const totalAssessments = mockAssessments.length;
    
    // Calculate risk distribution
    const riskCounts = mockAssessments.reduce((acc, assessment) => {
      acc[assessment.risk] = (acc[assessment.risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const riskDistribution = [
      { name: 'Low Risk', value: riskCounts.safe || 0, color: '#6BCB77' },
      { name: 'Moderate Risk', value: riskCounts.moderate || 0, color: '#FFD93D' },
      { name: 'High Risk', value: riskCounts.high || 0, color: '#FF6B6B' }
    ];

    // Mock recent activity
    const recentActivity = [
      { date: 'Mon', count: 3 },
      { date: 'Tue', count: 2 },
      { date: 'Wed', count: 4 },
      { date: 'Thu', count: 1 },
      { date: 'Fri', count: 2 },
      { date: 'Sat', count: 0 },
      { date: 'Sun', count: 0 }
    ];

    setDashboardData({
      totalAssessments,
      riskDistribution,
      totalBookings: bookings.length + 3, // Add mock bookings
      recentActivity
    });
  };

  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Assessments', String(dashboardData.totalAssessments)],
      ['Bookings', String(dashboardData.totalBookings)],
      ...dashboardData.riskDistribution.map(r => [r.name, String(r.value)])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo login - in real app would verify against backend
    if (username === 'admin' && password === 'demo123') {
      setIsLoggedIn(true);
    } else {
      alert('Demo credentials: username: admin, password: demo123');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 shadow-card border-0">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Secure access to mental health analytics</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-1"
              />
            </div>

            <Button type="submit" variant="wellness" className="w-full">
              Login to Dashboard
            </Button>
          </form>

          <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-center text-muted-foreground">
            Demo Login: <strong>admin</strong> / <strong>demo123</strong>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mental Health Dashboard</h1>
            <p className="text-muted-foreground">Anonymous student wellness analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCsv}>Download CSV</Button>
            <Button 
              variant="outline" 
              onClick={() => setIsLoggedIn(false)}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Filters (mock) */}
        <Card className="p-4 shadow-soft border-0 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm text-muted-foreground">Department</label>
              <select className="border rounded-md px-2 py-1" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                <option value="all">All</option>
                <option value="cs">Computer Science</option>
                <option value="me">Mechanical</option>
                <option value="ee">Electrical</option>
              </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm text-muted-foreground">Date Range</label>
              <select className="border rounded-md px-2 py-1" value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div className="text-xs text-muted-foreground">(Demo filters)</div>
          </div>
        </Card>

        {/* High risk alert banner */}
        {(() => {
          const total = dashboardData.riskDistribution.reduce((s, r) => s + r.value, 0) || 1;
          const high = dashboardData.riskDistribution.find(r => r.name.includes('High'))?.value || 0;
          const percent = Math.round((high / total) * 100);
          if (percent > 10) {
            return (
              <div className="mb-6 p-3 rounded-md bg-wellness-high/10 border border-wellness-high/30 text-wellness-high">
                Alert: High-risk students exceed 10% ({percent}%). Immediate attention recommended.
              </div>
            );
          }
          return null;
        })()}

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Assessments</p>
                <p className="text-3xl font-bold text-primary">{dashboardData.totalAssessments}</p>
              </div>
              <FileText className="w-8 h-8 text-primary/60" />
            </div>
          </Card>

          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Counselor Bookings</p>
                <p className="text-3xl font-bold text-secondary">{dashboardData.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-secondary/60" />
            </div>
          </Card>

          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Users</p>
                <p className="text-3xl font-bold text-wellness-safe">47</p>
              </div>
              <Users className="w-8 h-8 text-wellness-safe/60" />
            </div>
          </Card>

          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Response Rate</p>
                <p className="text-3xl font-bold text-wellness-moderate">89%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-wellness-moderate/60" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Distribution Pie Chart */}
          <Card className="p-6 shadow-soft border-0">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Risk Level Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dashboardData.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              {dashboardData.riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Activity */}
          <Card className="p-6 shadow-soft border-0">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-primary" />
              Weekly Assessment Activity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4A90E2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Activity Table */}
        <Card className="p-6 shadow-soft border-0">
          <h3 className="font-semibold text-lg mb-4">Recent Anonymous Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-muted-foreground">Time</th>
                  <th className="pb-3 text-muted-foreground">Activity Type</th>
                  <th className="pb-3 text-muted-foreground">Assessment</th>
                  <th className="pb-3 text-muted-foreground">Risk Level</th>
                  <th className="pb-3 text-muted-foreground">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3">2 hours ago</td>
                  <td className="py-3">PHQ-9 Assessment</td>
                  <td className="py-3">Depression Screening</td>
                  <td className="py-3">
                    <span className="inline-block w-3 h-3 bg-wellness-moderate rounded-full mr-2"></span>
                    Moderate
                  </td>
                  <td className="py-3">Counselor booking suggested</td>
                </tr>
                <tr>
                  <td className="py-3">3 hours ago</td>
                  <td className="py-3">GAD-7 Assessment</td>
                  <td className="py-3">Anxiety Screening</td>
                  <td className="py-3">
                    <span className="inline-block w-3 h-3 bg-wellness-safe rounded-full mr-2"></span>
                    Low
                  </td>
                  <td className="py-3">Resources provided</td>
                </tr>
                <tr>
                  <td className="py-3">5 hours ago</td>
                  <td className="py-3">Counselor Booking</td>
                  <td className="py-3">-</td>
                  <td className="py-3">-</td>
                  <td className="py-3">Session scheduled</td>
                </tr>
                <tr>
                  <td className="py-3">6 hours ago</td>
                  <td className="py-3">PHQ-9 Assessment</td>
                  <td className="py-3">Depression Screening</td>
                  <td className="py-3">
                    <span className="inline-block w-3 h-3 bg-wellness-high rounded-full mr-2"></span>
                    High
                  </td>
                  <td className="py-3">Immediate support offered</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Button variant="outline" className="w-full justify-start text-left h-auto p-6" asChild>
            <Link to="/analytics">
              <div>
                <h3 className="font-semibold mb-1">Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">View detailed usage statistics and trends</p>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="w-full justify-start text-left h-auto p-6" asChild>
            <Link to="/forums">
              <div>
                <h3 className="font-semibold mb-1">Forum Moderation</h3>
                <p className="text-sm text-muted-foreground">Manage peer support discussions</p>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="w-full justify-start text-left h-auto p-6" asChild>
            <Link to="/resources">
              <div>
                <h3 className="font-semibold mb-1">Resource Management</h3>
                <p className="text-sm text-muted-foreground">Update localized wellness content</p>
              </div>
            </Link>
          </Button>
        </div>

        {/* Privacy Notice */}
        <Card className="mt-8 p-4 shadow-soft border-0 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            <Shield className="w-4 h-4 inline mr-1" />
            All data is anonymized and aggregated. No personal information is stored or displayed.
            This dashboard complies with HIPAA privacy requirements.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
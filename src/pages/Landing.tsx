import { useState } from "react";
import { Globe, ArrowRight, Shield, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-wellness.jpg";

const Landing = () => {
  const [language, setLanguage] = useState("en");
  const [mood, setMood] = useState<string | null>(null);
  const { toast } = useToast();
  

  const translations = {
    en: {
      title: "Your Mental Wellness Journey Starts Here",
      subtitle: "Safe, confidential support designed specifically for students. Get personalized guidance, connect with counselors, and access wellness resources anytime.",
      guestButton: "Continue as Guest",
      signInButton: "Sign in with Email",
      features: {
        safe: "Safe & Confidential",
        support: "24/7 Support",
        community: "Student Community"
      },
      safeDesc: "Your privacy is our priority with secure, anonymous assessments",
      supportDesc: "Access wellness resources and crisis support whenever you need",
      communityDesc: "Connect with peers and professional counselors who understand"
    },
    hi: {
      title: "आपकी मानसिक स्वास्थ्य यात्रा यहाँ शुरू होती है",
      subtitle: "छात्रों के लिए विशेष रूप से डिज़ाइन किया गया सुरक्षित, गोपनीय समर्थन। व्यक्तिगत मार्गदर्शन प्राप्त करें।",
      guestButton: "अतिथि के रूप में जारी रखें",
      signInButton: "ईमेल से साइन इन करें",
      features: {
        safe: "सुरक्षित और गोपनीय",
        support: "24/7 सहायता",
        community: "छात्र समुदाय"
      },
      safeDesc: "सुरक्षित, अज्ञात मूल्यांकन के साथ आपकी गोपनीयता हमारी प्राथमिकता है",
      supportDesc: "जब भी आपको जरूरत हो कल्याण संसाधन और संकट सहायता प्राप्त करें",
      communityDesc: "समझने वाले साथियों और पेशेवर परामर्शदाताओं से जुड़ें"
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleMoodSelect = (emoji: string) => {
    setMood(emoji);
    localStorage.setItem('moodToday', emoji);
    // append to history
    try {
      const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
      history.push({ ts: new Date().toISOString(), mood: emoji });
      localStorage.setItem('moodHistory', JSON.stringify(history));
    } catch {}
    toast({ title: 'Mood saved', description: `Logged "${emoji}" for today.` });
  };

  const moodSuggestion = (() => {
    if (mood === '😊') {
      return {
        title: 'Great to hear! Keep the momentum going',
        desc: 'Try a quick challenge or explore a new resource.',
        primary: { label: 'Explore Resources', href: '/resources' },
        secondary: { label: 'Start a Challenge', href: '/resources' }
      };
    }
    if (mood === '😐') {
      return {
        title: 'Feeling neutral? A short reset can help',
        desc: 'Try a 2-min breathing exercise or browse calming tips.',
        primary: { label: 'Open AI Chat (Breathing)', href: '/chat' },
        secondary: { label: 'Browse Resources', href: '/resources' }
      };
    }
    if (mood === '😔') {
      return {
        title: 'We’re here for you',
        desc: 'Consider a quick assessment or connect with a counselor.',
        primary: { label: 'Take Assessment', href: '/assessment' },
        secondary: { label: 'Book Counselor', href: '/booking' }
      };
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg">MindBridge</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block">Anonymous Mode – no personal data stored</div>
          <Globe className="w-4 h-4 text-muted-foreground" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-none text-sm focus:outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                {t.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="wellness" size="lg" className="group">
                <Link to="/assessment">
                  {t.guestButton}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link to="/resources">
                  Explore Resources
                </Link>
              </Button>

              <Button asChild variant="secondary" size="lg">
                <Link to="/forums">
                  Join Community
                </Link>
              </Button>
            </div>

            {/* Mood nudge */}
            <div className="mt-6">
              <p className="text-sm mb-2">How are you feeling today?</p>
              <div className="flex gap-2">
                {['😊','😐','😔'].map((emoji) => (
                  <button key={emoji} className={`text-2xl rounded-md px-3 py-1 border ${mood===emoji? 'border-primary' : 'border-transparent'} hover:border-primary`}
                    onClick={() => handleMoodSelect(emoji)}>
                    {emoji}
                  </button>
                ))}
              </div>
              {moodSuggestion && (
                <Card className="mt-4 p-4 border-0 shadow-soft">
                  <h4 className="font-semibold mb-1">{moodSuggestion.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{moodSuggestion.desc}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild variant="wellness">
                      <Link to={moodSuggestion.primary.href}>{moodSuggestion.primary.label}</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to={moodSuggestion.secondary.href}>{moodSuggestion.secondary.label}</Link>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-wellness rounded-3xl opacity-20 blur-3xl"></div>
            <img 
              src={heroImage} 
              alt="Mental wellness illustration"
              className="relative rounded-3xl shadow-card w-full"
            />
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card className="p-6 text-center space-y-4 border-0 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{t.features.safe}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.safeDesc}
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4 border-0 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="w-12 h-12 bg-secondary-light rounded-xl flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg">{t.features.support}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.supportDesc}
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4 border-0 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{t.features.community}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.communityDesc}
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Landing;
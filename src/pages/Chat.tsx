import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Phone, AlertCircle, Heart, Smile, Headphones, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  mediaUrl?: string;
  mediaType?: 'gif' | 'audio' | 'video';
}

const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hopeless', 'worthless', 'die'];

const botResponses = {
  greeting: {
    text: "Hi there! I'm here to provide you with some helpful coping strategies and support. How are you feeling today?",
    suggestions: ["I'm feeling anxious", "I'm stressed about studies", "I'm feeling low", "I can't sleep well"]
  },
  anxiety: {
    text: "I understand that feeling anxious can be overwhelming. Let's try a simple breathing exercise together. Would you like me to guide you through it?",
    suggestions: ["Yes, let's try breathing", "What other techniques help?", "Tell me about mindfulness"]
  },
  stress: {
    text: "Study stress is very common among students. Here are some strategies that might help: taking regular breaks, organizing your schedule, and practicing self-care. Which would you like to explore?",
    suggestions: ["Study techniques", "Time management", "Self-care tips", "Taking breaks"]
  },
  depression: {
    text: "I hear that you're going through a difficult time. It's important to know that you're not alone. Small steps can make a big difference. Would you like some gentle suggestions?",
    suggestions: ["Daily routine tips", "Mood boosting activities", "Talk to someone", "Professional help"]
  },
  sleep: {
    text: "Good sleep is crucial for mental health. Here are some sleep hygiene tips: consistent bedtime, limiting screen time before bed, creating a calm environment. What's your biggest sleep challenge?",
    suggestions: ["Can't fall asleep", "Wake up frequently", "Sleep schedule is off", "Racing thoughts"]
  },
  breathing: {
    text: "Great choice! Let's try a 1-minute guided breathing. Press Play and follow the calm rhythm: in (4), hold (7), out (8).",
    suggestions: ["That helped!", "Can we do it again?", "What other techniques help?", "I feel calmer"],
  }
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Personalize first suggestions using last assessment
    const lastAssessment = (() => {
      try { return JSON.parse(localStorage.getItem('assessmentResults') || 'null'); } catch { return null; }
    })();
    const personalized = { ...botResponses.greeting } as { text: string; suggestions: string[] };
    if (lastAssessment?.type === 'phq9') {
      personalized.suggestions = ["I can't sleep well", "I'm feeling low", "I'm stressed about studies", "I'm feeling anxious"];
    } else if (lastAssessment?.type === 'gad7') {
      personalized.suggestions = ["I'm feeling anxious", "Trouble relaxing", "I'm stressed about studies", "I can't sleep well"];
    }
    return [{
      id: '1',
      text: personalized.text,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: personalized.suggestions
    }];
  });
  const [input, setInput] = useState('');
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [isBreathingPlaying, setIsBreathingPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectCrisisKeywords = (text: string) => {
    return crisisKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const getBotResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      return botResponses.anxiety;
    }
    if (lowerMessage.includes('stress') || lowerMessage.includes('study') || lowerMessage.includes('exam')) {
      return botResponses.stress;
    }
    if (lowerMessage.includes('sad') || lowerMessage.includes('low') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
      return botResponses.depression;
    }
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia')) {
      return botResponses.sleep;
    }
    if (lowerMessage.includes('breathing') || lowerMessage.includes('breath')) {
      return botResponses.breathing;
    }
    
    return {
      text: "Thank you for sharing that with me. I'm here to help. What specific area would you like support with today?",
      suggestions: ["Stress management", "Anxiety help", "Sleep problems", "Feeling down", "Study tips"]
    };
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Check for crisis keywords
    if (detectCrisisKeywords(input)) {
      setShowCrisisAlert(true);
    }

    // Generate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: botResponse.suggestions
      };
      setMessages(prev => [...prev, botMessage]);

      // If breathing, append multimedia message (calming GIF + Play guide button)
      if (botResponse === botResponses.breathing) {
        const mediaMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: 'Follow along with this calming visual. You can also press Play for a 1-minute audio guide.',
          sender: 'bot',
          timestamp: new Date(),
          mediaUrl: 'https://media.giphy.com/media/l0Exk8EUzSLsrErEQ/giphy.gif',
          mediaType: 'gif'
        };
        setMessages(prev => [...prev, mediaMessage]);
      }
    }, 1000);

    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const startBreathingGuide = async () => {
    try {
      setIsBreathingPlaying(true);
      const utterances = [
        'Breathe in... two, three, four.',
        'Hold... two, three, four, five, six, seven.',
        'Breathe out... two, three, four, five, six, seven, eight.'
      ];
      const speak = (text: string) => new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        u.onend = () => resolve();
        window.speechSynthesis.speak(u);
      });
      const start = Date.now();
      while (Date.now() - start < 60000) {
        for (const line of utterances) {
          // stop if user navigates
          if (!isBreathingPlaying) break;
          // eslint-disable-next-line no-await-in-loop
          await speak(line);
        }
        if (!isBreathingPlaying) break;
      }
    } catch (e) {
      // noop
    } finally {
      setIsBreathingPlaying(false);
    }
  };

  const stopBreathingGuide = () => {
    setIsBreathingPlaying(false);
    try { window.speechSynthesis.cancel(); } catch {}
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/assessment" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-secondary" />
            <span className="font-semibold">AI Support Chat</span>
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Crisis Alert */}
      {showCrisisAlert && (
        <div className="p-4 bg-wellness-high/10 border-b border-wellness-high/20">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-wellness-high/30 bg-wellness-high/5">
              <AlertCircle className="h-4 w-4 text-wellness-high" />
              <AlertDescription className="text-wellness-high">
                <strong>Crisis Support Available:</strong> If you're having thoughts of self-harm, please reach out immediately.
                <div className="flex items-center gap-4 mt-2">
                  <Button size="sm" variant="outline" className="border-wellness-high text-wellness-high hover:bg-wellness-high/10">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Helpline: 1-800-273-8255
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href="tel:18002738255">
                      <Phone className="w-4 h-4 mr-2" /> Quick Call (Demo)
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/booking">Book Emergency Session</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {message.sender === 'bot' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-wellness rounded-full flex items-center justify-center">
                      <Smile className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">AI Assistant</span>
                  </div>
                )}
                
                <Card className={`p-3 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground shadow-soft' 
                    : 'bg-white shadow-soft border-0'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  {message.mediaType === 'gif' && message.mediaUrl && (
                    <img src={message.mediaUrl} alt="calming visual" className="mt-3 rounded-md" />
                  )}
                </Card>

                {message.suggestions && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs h-8"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 rounded-xl border-2 focus:border-primary"
            />
            <Button onClick={handleSendMessage} size="icon" className="rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Headphones className="w-3 h-3" />
              <button
                className="underline hover:text-foreground"
                onClick={isBreathingPlaying ? stopBreathingGuide : startBreathingGuide}
              >
                {isBreathingPlaying ? 'Stop 1-min Breathing Guide' : 'Play 1-min Breathing Guide'}
              </button>
              <a href="https://www.nhs.uk/live-well/exercise/breathing-exercises-for-stress/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                Learn more <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This is an AI assistant providing general support. For urgent help, please contact emergency services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
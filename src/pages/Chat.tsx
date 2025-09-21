import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Phone, AlertCircle, Heart, Smile } from "lucide-react";
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
    text: "Great choice! Let's do the 4-7-8 breathing technique: Breathe in for 4 counts, hold for 7 counts, breathe out for 8 counts. Ready? Breathe in... 1, 2, 3, 4... Hold... 1, 2, 3, 4, 5, 6, 7... And out... 1, 2, 3, 4, 5, 6, 7, 8. How did that feel?",
    suggestions: ["That helped!", "Can we do it again?", "What other techniques help?", "I feel calmer"]
  }
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: botResponses.greeting.text,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: botResponses.greeting.suggestions
    }
  ]);
  const [input, setInput] = useState('');
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
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
    }, 1000);

    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
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
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This is an AI assistant providing general support. For urgent help, please contact emergency services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
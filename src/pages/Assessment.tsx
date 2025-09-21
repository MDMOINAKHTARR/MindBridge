import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

// PHQ-9 Questions
const phq9Questions = [
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?", 
  "Trouble falling/staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself or that you are a failure?",
  "Trouble concentrating on things?",
  "Moving or speaking slowly, or being fidgety/restless?",
  "Thoughts that you would be better off dead?"
];

// GAD-7 Questions  
const gad7Questions = [
  "Feeling nervous, anxious, or on edge?",
  "Not being able to stop or control worrying?",
  "Worrying too much about different things?",
  "Trouble relaxing?",
  "Being so restless that it is hard to sit still?",
  "Becoming easily annoyed or irritable?",
  "Feeling afraid, as if something awful might happen?"
];

const responseOptions = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several days" },
  { value: "2", label: "More than half the days" },
  { value: "3", label: "Nearly every day" }
];

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentType, setAssessmentType] = useState<'phq9' | 'gad7' | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const questions = assessmentType === 'phq9' ? phq9Questions : gad7Questions;
  const totalQuestions = questions.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateResults = () => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + parseInt(value), 0);
    const maxScore = assessmentType === 'phq9' ? 27 : 21;
    
    // Store results for display
    localStorage.setItem('assessmentResults', JSON.stringify({
      type: assessmentType,
      score: totalScore,
      maxScore,
      timestamp: new Date().toISOString()
    }));
    
    setShowResults(true);
  };

  const getResultStatus = () => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + parseInt(value), 0);
    
    if (assessmentType === 'phq9') {
      if (totalScore <= 4) return { level: 'safe', text: 'Minimal Depression', color: 'wellness-safe' };
      if (totalScore <= 9) return { level: 'moderate', text: 'Mild Depression', color: 'wellness-moderate' };
      if (totalScore <= 14) return { level: 'moderate', text: 'Moderate Depression', color: 'wellness-moderate' };
      return { level: 'high', text: 'Severe Depression', color: 'wellness-high' };
    } else {
      if (totalScore <= 4) return { level: 'safe', text: 'Minimal Anxiety', color: 'wellness-safe' };
      if (totalScore <= 9) return { level: 'moderate', text: 'Mild Anxiety', color: 'wellness-moderate' };
      if (totalScore <= 14) return { level: 'moderate', text: 'Moderate Anxiety', color: 'wellness-moderate' };
      return { level: 'high', text: 'Severe Anxiety', color: 'wellness-high' };
    }
  };

  const ResultIcon = ({ level }: { level: string }) => {
    switch (level) {
      case 'safe': return <CheckCircle className="w-12 h-12 text-wellness-safe" />;
      case 'moderate': return <AlertTriangle className="w-12 h-12 text-wellness-moderate" />;
      case 'high': return <AlertCircle className="w-12 h-12 text-wellness-high" />;
      default: return <CheckCircle className="w-12 h-12 text-wellness-safe" />;
    }
  };

  if (!assessmentType) {
    return (
      <div className="min-h-screen bg-gradient-background p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Mental Health Assessment</h1>
            <p className="text-muted-foreground">
              Take a quick, confidential assessment to understand your current wellness state
            </p>
          </div>

          <div className="grid gap-6">
            <Card 
              className="p-6 cursor-pointer border-2 hover:border-primary transition-colors shadow-soft hover:shadow-card"
              onClick={() => setAssessmentType('phq9')}
            >
              <h3 className="font-semibold text-lg mb-2">Depression Screening (PHQ-9)</h3>
              <p className="text-muted-foreground text-sm">
                A brief questionnaire to assess symptoms of depression over the past 2 weeks
              </p>
            </Card>

            <Card 
              className="p-6 cursor-pointer border-2 hover:border-primary transition-colors shadow-soft hover:shadow-card"
              onClick={() => setAssessmentType('gad7')}
            >
              <h3 className="font-semibold text-lg mb-2">Anxiety Screening (GAD-7)</h3>
              <p className="text-muted-foreground text-sm">
                A brief questionnaire to assess symptoms of anxiety over the past 2 weeks
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const result = getResultStatus();
    const totalScore = Object.values(answers).reduce((sum, value) => sum + parseInt(value), 0);

    return (
      <div className="min-h-screen bg-gradient-background p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <Card className="p-8 text-center shadow-card border-0">
            <div className="mb-6">
              <ResultIcon level={result.level} />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Assessment Complete</h2>
            
            <div className="mb-6">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium bg-${result.color}/10 text-${result.color}`}>
                {result.text}
              </div>
              <p className="text-muted-foreground mt-2">
                Score: {totalScore} / {assessmentType === 'phq9' ? 27 : 21}
              </p>
            </div>

            <div className="space-y-4 text-left bg-muted/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold">Recommended Next Steps:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {result.level === 'safe' && (
                  <>
                    <li>• Continue with your current wellness practices</li>
                    <li>• Explore our mindfulness resources</li>
                    <li>• Connect with our supportive community</li>
                  </>
                )}
                {result.level === 'moderate' && (
                  <>
                    <li>• Consider speaking with a counselor</li>
                    <li>• Try our guided coping strategies</li>
                    <li>• Book a wellness session</li>
                  </>
                )}
                {result.level === 'high' && (
                  <>
                    <li>• We recommend speaking with a professional immediately</li>
                    <li>• Book an urgent counseling session</li>
                    <li>• Access crisis support resources</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="wellness" className="flex-1">
                <Link to="/chat">Start AI Support Chat</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/booking">Book Counselor</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-2xl mx-auto pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="inline-flex items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          <div className="text-center">
            <h2 className="font-semibold">
              {assessmentType === 'phq9' ? 'Depression Screening' : 'Anxiety Screening'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Question {currentStep + 1} of {totalQuestions}
            </p>
          </div>
          
          <div className="w-20"></div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="p-8 shadow-card border-0">
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-2">
              Over the last 2 weeks, how often have you been bothered by:
            </h3>
            <p className="text-lg text-foreground font-medium">
              {questions[currentStep]}
            </p>
          </div>

          <RadioGroup 
            value={answers[currentStep] || ""} 
            onValueChange={handleAnswerChange}
            className="space-y-4"
          >
            {responseOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-end mt-8">
            <Button 
              onClick={handleNext}
              disabled={!answers[currentStep]}
              className="group"
            >
              {currentStep === totalQuestions - 1 ? 'Complete Assessment' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Assessment;
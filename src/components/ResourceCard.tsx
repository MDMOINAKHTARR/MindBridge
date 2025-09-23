import { useState } from "react";
import { Play, FileText, Volume2, Clock, Eye, Download, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaPlayer } from "./MediaPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  helpful_count?: number;
  not_helpful_count?: number;
}

interface ResourceCardProps {
  resource: Resource;
  selectedLanguage: 'en' | 'hi';
  categoryName: string;
  onViewUpdate: (resourceId: string) => void;
  onBadgeEarned: () => void;
}

export const ResourceCard = ({ resource, selectedLanguage, categoryName, onViewUpdate, onBadgeEarned }: ResourceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const { toast } = useToast();

  const getTitle = () => selectedLanguage === 'hi' ? resource.title_hi : resource.title_en;
  const getDescription = () => selectedLanguage === 'hi' ? resource.description_hi : resource.description_en;
  const getContent = () => selectedLanguage === 'hi' ? resource.content_hi : resource.content_en;

  const getResourceIcon = () => {
    switch (resource.type) {
      case 'video': return <Play className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'audio': return <Volume2 className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = () => {
    switch (resource.type) {
      case 'video': return 'bg-primary/10 text-primary border-primary/20';
      case 'audio': return 'bg-wellness-safe/10 text-wellness-safe border-wellness-safe/20';
      case 'pdf': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'article': return 'bg-wellness-warning/10 text-wellness-warning border-wellness-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleViewResource = () => {
    if (!isExpanded) {
      onViewUpdate(resource.id);
      onBadgeEarned();
    }
    setIsExpanded(!isExpanded);
  };

  const handleFeedback = async (rating: number) => {
    try {
      const { error } = await supabase
        .from('resource_feedback')
        .insert({
          resource_id: resource.id,
          rating: rating,
          user_id: null // Guest user
        });

      if (error) throw error;

      setFeedbackGiven(true);
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our resources.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (resource.file_url) {
      window.open(resource.file_url, '_blank');
      onBadgeEarned();
    }
  };

  return (
    <Card className="shadow-soft border-0 hover:shadow-card transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${getCategoryColor()}`}>
            {getResourceIcon()}
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

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {getTitle()}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
          {getDescription()}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor()} variant="outline">
              {categoryName}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              {resource.view_count}
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="wellness" 
            onClick={handleViewResource}
          >
            {isExpanded ? 'Hide' : 'View'} Content
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Media Player for video/audio */}
            {(resource.type === 'video' || resource.type === 'audio') && resource.file_url && (
              <MediaPlayer
                url={resource.file_url}
                type={resource.type}
                title={getTitle()}
                thumbnail={resource.thumbnail_url}
                onPlay={() => onBadgeEarned()}
                onDownload={handleDownload}
              />
            )}

            {/* PDF Download */}
            {resource.type === 'pdf' && resource.file_url && (
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  {getTitle()} - PDF Document
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button size="sm" variant="wellness" onClick={() => window.open(resource.file_url, '_blank')}>
                    View Online
                  </Button>
                </div>
              </div>
            )}

            {/* Text Content */}
            {getContent() && (
              <div className="bg-primary-light rounded-lg p-4">
                <p className="text-sm leading-relaxed text-primary">
                  {getContent()}
                </p>
              </div>
            )}

            {/* Feedback Section */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Was this helpful?</p>
              {!feedbackGiven ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFeedback(1)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes ({resource.helpful_count || 0})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFeedback(-1)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No ({resource.not_helpful_count || 0})
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-wellness-safe">
                  <ThumbsUp className="w-4 h-4" />
                  Thank you for your feedback!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
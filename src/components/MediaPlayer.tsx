import { useState, useRef } from "react";
import { Play, Pause, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaPlayerProps {
  url: string;
  type: 'video' | 'audio';
  title: string;
  thumbnail?: string;
  onPlay?: () => void;
  onDownload?: () => void;
}

export const MediaPlayer = ({ url, type, title, thumbnail, onPlay, onDownload }: MediaPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
        onPlay?.();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMediaEnded = () => {
    setIsPlaying(false);
  };

  if (type === 'video') {
    return (
      <div className="relative rounded-lg overflow-hidden bg-muted">
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          className="w-full aspect-video object-cover"
          poster={thumbnail}
          onEnded={handleMediaEnded}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="wellness"
            size="lg"
            onClick={togglePlay}
            className="bg-black/50 hover:bg-black/70 text-white border-0 shadow-lg"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2">
          {onDownload && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDownload}
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <Button
          variant="wellness"
          size="lg"
          onClick={togglePlay}
          className="rounded-full w-12 h-12 flex items-center justify-center"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Volume2 className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            onEnded={handleMediaEnded}
            className="w-full"
            controls
          >
            <source src={url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        {onDownload && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
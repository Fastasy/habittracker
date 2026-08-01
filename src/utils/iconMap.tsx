import React from 'react';
import {
  Flame, BookOpen, Terminal, Dumbbell, Droplet, Moon, Heart, Zap,
  Briefcase, Coffee, Music, Smile, Star, Target, CheckCircle2,
  ListChecks, PenTool, Layout
} from 'lucide-react';

export const emojiToIcon = (emoji: string, className?: string): React.ReactNode => {
  const props = { className: className || "w-5 h-5" };
  
  switch (emoji) {
    case '🏃': case '🏋️': case '💪': return <Dumbbell {...props} />;
    case '📚': case '📖': case '📝': return <BookOpen {...props} />;
    case '💻': case '⌨️': case '🖥️': return <Terminal {...props} />;
    case '💧': case '🚰': return <Droplet {...props} />;
    case '😴': case '🌙': return <Moon {...props} />;
    case '❤️': case '💖': return <Heart {...props} />;
    case '⚡': case '🔥': return <Flame {...props} />;
    case '💼': case '🏢': return <Briefcase {...props} />;
    case '☕': case '🍵': return <Coffee {...props} />;
    case '🎵': case '🎸': return <Music {...props} />;
    case '🎯': return <Target {...props} />;
    case '⭐': case '🌟': return <Star {...props} />;
    case '😊': case '😁': return <Smile {...props} />;
    case '🎨': return <PenTool {...props} />;
    default: return <Layout {...props} />;
  }
};

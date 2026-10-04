import React from 'react';
import {
  Flame, BookOpen, Terminal, Dumbbell, Droplet, Moon, Heart, Zap,
  Briefcase, Coffee, Music, Smile, Star, Target, CheckCircle2,
  ListChecks, PenTool, Layout, Activity, Utensils, Edit3, Leaf, Bike,
  Sparkles, Pill, Brain, Sunrise, HeartHandshake, Wind
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
    case '🧘': return <Wind {...props} />;
    case '🥗': return <Utensils {...props} />;
    case '✍️': return <Edit3 {...props} />;
    case '🌿': return <Leaf {...props} />;
    case '🚴': return <Bike {...props} />;
    case '🧹': return <Sparkles {...props} />;
    case '💊': return <Pill {...props} />;
    case '🫁': return <Activity {...props} />;
    case '🧠': return <Brain {...props} />;
    case '🌅': return <Sunrise {...props} />;
    case '🙏': return <HeartHandshake {...props} />;
    default: return <Layout {...props} />;
  }
};

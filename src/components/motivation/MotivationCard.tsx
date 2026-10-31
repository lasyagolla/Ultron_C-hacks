import React, { useState } from 'react';
import { Heart, ThumbsDown, Star, Sparkles, RefreshCw } from 'lucide-react';
import { MotivationCardItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

const INITIAL_CARDS: MotivationCardItem[] = [
  {
    id: 'mc_1',
    quote: "You don't need to finish everything at once. Consistent, gentle presence beats rushed perfection.",
    author: "Bloom Reflection",
    tone: "Gentle and reassuring",
    theme: "Sustainable Pacing"
  },
  {
    id: 'mc_2',
    quote: "Protecting your 8 hours of sleep is not time lost—it is the bedrock on which your focus is built.",
    author: "Cognitive Science Note",
    tone: "Direct and practical",
    theme: "Rest Protection"
  },
  {
    id: 'mc_3',
    quote: "Small daily steps in mathematics or coding compound exponentially over a semester.",
    author: "Learning Pathways",
    tone: "Energetic and ambitious",
    theme: "Growth Compound"
  },
  {
    id: 'mc_4',
    quote: "Notice when tension rises in your shoulders. Pause, breathe, and reset before the next assignment.",
    author: "Well-being Check-in",
    tone: "Reflective and thoughtful",
    theme: "Mindful Reset"
  }
];

export const MotivationCard: React.FC = () => {
  const { motivationPref, saveMotivation } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbackAnim, setFeedbackAnim] = useState<'liked' | 'dismissed' | null>(null);

  const card = INITIAL_CARDS[currentIndex % INITIAL_CARDS.length];

  const handleLike = () => {
    setFeedbackAnim('liked');
    setTimeout(() => {
      setFeedbackAnim(null);
      setCurrentIndex((prev) => (prev + 1) % INITIAL_CARDS.length);
      if (motivationPref) {
        saveMotivation({
          ...motivationPref,
          likedCards: Array.from(new Set([...(motivationPref.likedCards || []), card.id]))
        });
      }
    }, 300);
  };

  const handleDismiss = () => {
    setFeedbackAnim('dismissed');
    setTimeout(() => {
      setFeedbackAnim(null);
      setCurrentIndex((prev) => (prev + 1) % INITIAL_CARDS.length);
      if (motivationPref) {
        saveMotivation({
          ...motivationPref,
          dismissedCards: Array.from(new Set([...(motivationPref.dismissedCards || []), card.id]))
        });
      }
    }, 300);
  };

  const handleSaveFavorite = () => {
    if (motivationPref) {
      const currentFavs = motivationPref.savedFavorites || [];
      const isFav = currentFavs.includes(card.id);
      const nextFavs = isFav ? currentFavs.filter(id => id !== card.id) : [...currentFavs, card.id];
      saveMotivation({
        ...motivationPref,
        savedFavorites: nextFavs
      });
    }
  };

  const isFavorite = motivationPref?.savedFavorites?.includes(card.id);

  return (
    <div 
      className={`relative p-5 rounded-3xl border transition-all duration-300 ${
        feedbackAnim === 'liked' ? 'scale-105 border-emerald-400 bg-emerald-50/20' : 
        feedbackAnim === 'dismissed' ? 'scale-95 opacity-50' : ''
      }`}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Top Tone & Favorite */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-secondary)' }} />
          <span className="font-semibold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Daily Spark • {card.theme}
          </span>
        </div>
        <button
          onClick={handleSaveFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`p-1.5 rounded-full hover:bg-[var(--bg-card-subtle)] transition-colors ${
            isFavorite ? 'text-amber-500 fill-amber-500' : 'text-[var(--text-muted)]'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Quote */}
      <p className="text-sm font-medium leading-relaxed italic mb-4" style={{ color: 'var(--text-primary)' }}>
        "{card.quote}"
      </p>

      {/* Bottom meta & swipe buttons */}
      <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {card.author}
        </span>

        {/* Tinder-style Like / Dismiss controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDismiss}
            title="Dismiss (Swipe Left)"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-[var(--text-muted)] hover:text-rose-600"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <ThumbsDown className="w-3 h-3" />
            <span>Pass</span>
          </button>

          <button
            onClick={handleLike}
            title="Like (Swipe Right)"
            className="flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-semibold text-white transition-all shadow-sm"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Heart className="w-3 h-3 fill-current" />
            <span>Like</span>
          </button>
        </div>
      </div>
    </div>
  );
};

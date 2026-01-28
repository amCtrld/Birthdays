'use client';

import { useState } from 'react';
import { Timeline } from '@/components/ui/timeline';
import { ChevronDown } from 'lucide-react';
import { sendBirthdayWish } from '@/app/actions/birthday-actions';

interface Birthday {
  id: string;
  name: string;
  month: number;
  day: number;
  message?: string;
  wishCount?: number;
}

interface ScatteredWallProps {
  birthdays: Birthday[];
  onWishSent?: () => void;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Birthday color palette for variety
const birthdayColors = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-orange-500',
  'from-red-500 to-pink-500',
];

function formatDate(month: number, day: number): string {
  return `${monthNames[month - 1]} ${day}`;
}

// Confetti emoji for decoration
const confettiEmojis = ['🎉', '🎂', '🎈', '🎁', '🎊', '🥳', '🍰', '🎀'];

function getRandomConfetti() {
  return confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
}

// Check if a birthday is today
function isBirthdayToday(month: number, day: number): boolean {
  const today = new Date();
  return today.getMonth() + 1 === month && today.getDate() === day;
}

// Component to handle wish button
function WishButton({ 
  birthdayId, 
  initialCount, 
  onWishSent 
}: { 
  birthdayId: string; 
  initialCount: number;
  onWishSent?: () => void;
}) {
  const [wishCount, setWishCount] = useState(initialCount);
  const [isWishing, setIsWishing] = useState(false);
  const [hasWished, setHasWished] = useState(false);

  const handleWish = async () => {
    if (isWishing) return;
    
    setIsWishing(true);
    try {
      const result = await sendBirthdayWish(birthdayId);
      if (result.success && result.newCount) {
        setWishCount(result.newCount);
        setHasWished(true);
        onWishSent?.();
      }
    } catch (error) {
      console.error('Error sending wish:', error);
    } finally {
      setIsWishing(false);
    }
  };

  return (
    <button
      onClick={handleWish}
      disabled={isWishing}
      className={`
        mt-4 inline-flex items-center gap-2 
        ${hasWished 
          ? 'bg-green-500/30 cursor-default' 
          : 'bg-white/20 hover:bg-white/30 cursor-pointer hover:scale-105'
        }
        backdrop-blur-sm rounded-full 
        px-5 py-2.5 text-white text-sm md:text-base font-semibold
        transition-all duration-200 active:scale-95
        disabled:opacity-70
      `}
    >
      <span className="text-lg">{hasWished ? '✅' : '🎂'}</span>
      <span>{hasWished ? 'Wished!' : 'Wish Happy Birthday'}</span>
      {wishCount > 0 && (
        <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
          {wishCount}
        </span>
      )}
    </button>
  );
}

// Component to handle expandable message
function ExpandableMessage({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = message.length > 20;
  const displayText = expanded ? message : message.slice(0, 20);

  return (
    <div className="text-sm md:text-lg text-white/95 font-medium leading-relaxed max-w-md px-4">
      <p>
        {displayText}
        {!expanded && needsExpansion && '...'}
      </p>
      {needsExpansion && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 mx-auto text-white/80 hover:text-white transition-colors text-sm"
        >
          <span>{expanded ? 'Show less' : 'Show more'}</span>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} 
          />
        </button>
      )}
    </div>
  );
}

export function ScatteredWall({ birthdays, onWishSent }: ScatteredWallProps) {
  const timelineData = birthdays.map((birthday, index) => {
    const colorClass = birthdayColors[index % birthdayColors.length];
    const leftEmoji = getRandomConfetti();
    const rightEmoji = getRandomConfetti();
    const isToday = isBirthdayToday(birthday.month, birthday.day);
    
    return {
      title: formatDate(birthday.month, birthday.day),
      content: (
        <div className="relative group">
          {/* Animated background gradient card */}
          <div className={`
            relative overflow-hidden rounded-2xl p-6 md:p-8
            bg-gradient-to-br ${colorClass}
            shadow-lg hover:shadow-2xl
            transition-all duration-300 hover:scale-105
            border-4 border-white dark:border-neutral-800
          `}>
            {/* Sparkle effect overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full 
                bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]
                animate-pulse"
              />
            </div>
            
            {/* Decorative confetti emojis */}
            <div className="absolute top-2 left-2 text-2xl md:text-3xl animate-bounce">
              {leftEmoji}
            </div>
            <div className="absolute top-2 right-2 text-2xl md:text-3xl animate-bounce" 
                 style={{ animationDelay: '0.2s' }}>
              {rightEmoji}
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-3 text-4xl md:text-5xl animate-bounce" 
                   style={{ animationDelay: '0.1s' }}>
                🎂
              </div>
              
              <h4 className="text-xl md:text-3xl font-bold text-white mb-2 
                           drop-shadow-lg tracking-wide">
                {birthday.name}
              </h4>
              
              <div className="w-16 h-1 bg-white/50 rounded-full mb-4" />
              
              {birthday.message && (
                <ExpandableMessage message={birthday.message} />
              )}
              
              {/* Birthday wish button - only show for today's birthdays */}
              {isToday ? (
                <WishButton 
                  birthdayId={birthday.id} 
                  initialCount={birthday.wishCount || 0}
                  onWishSent={onWishSent}
                />
              ) : (
                /* Birthday badge for non-today birthdays */
                <div className="mt-4 inline-flex items-center gap-2 
                              bg-white/20 backdrop-blur-sm rounded-full 
                              px-4 py-2 text-white text-xs md:text-sm font-semibold">
                  <span>🎈</span>
                  <span>Happy Birthday!</span>
                  <span>🎈</span>
                </div>
              )}
            </div>
            
            {/* Animated corner decorations */}
            <div className="absolute bottom-0 left-0 w-20 h-20 
                          bg-white/10 rounded-tr-full blur-2xl 
                          group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute top-0 right-0 w-20 h-20 
                          bg-white/10 rounded-bl-full blur-2xl 
                          group-hover:scale-150 transition-transform duration-500" />
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="relative w-full overflow-clip flex justify-center">
      {/* Floating background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[10%] text-4xl opacity-20 animate-float">
          🎈
        </div>
        <div className="absolute top-32 right-[15%] text-5xl opacity-20 animate-float" 
             style={{ animationDelay: '1s' }}>
          🎉
        </div>
        <div className="absolute top-64 left-[20%] text-3xl opacity-20 animate-float" 
             style={{ animationDelay: '2s' }}>
          🎁
        </div>
        <div className="absolute bottom-32 right-[25%] text-4xl opacity-20 animate-float" 
             style={{ animationDelay: '1.5s' }}>
          🎊
        </div>
      </div>
      
      <div className="w-full md:max-w-[50%] relative z-10">
        <Timeline data={timelineData} />
      </div>
      
      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
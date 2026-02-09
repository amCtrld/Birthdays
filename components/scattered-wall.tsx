"use client";

import { useState } from "react";
import { Timeline } from "@/components/ui/timeline";
import { ChevronDown } from "lucide-react";
import { sendBirthdayWish } from "@/app/actions/birthday-actions";

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
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDate(month: number, day: number): string {
  return `${monthNames[month - 1]} ${day}`;
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
  onWishSent,
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
      console.error("Error sending wish:", error);
    } finally {
      setIsWishing(false);
    }
  };

  return (
    <button
      onClick={handleWish}
      disabled={isWishing}
      className={`
        mt-6 inline-flex items-center gap-2.5 
        ${
          hasWished
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-foreground text-background hover:bg-foreground/90"
        }
        border rounded-xl 
        px-5 py-2.5 text-sm font-medium
        transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      <span className="text-base">{hasWished ? "✓" : "→"}</span>
      <span>{hasWished ? "Wish sent" : "Send wish"}</span>
      {wishCount > 0 && (
        <span className="bg-background/20 px-2 py-0.5 rounded-md text-xs font-semibold">
          {wishCount}
        </span>
      )}
    </button>
  );
}

// Component to handle expandable message
function ExpandableMessage({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = message.length > 100;
  const displayText = expanded ? message : message.slice(0, 100);

  return (
    <div className="text-sm text-muted-foreground leading-relaxed max-w-md">
      <p>
        {displayText}
        {!expanded && needsExpansion && "..."}
      </p>
      {needsExpansion && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-foreground/60 hover:text-foreground transition-colors text-xs font-medium"
        >
          <span>{expanded ? "Show less" : "Read more"}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

export function ScatteredWall({ birthdays, onWishSent }: ScatteredWallProps) {
  const timelineData = birthdays.map((birthday, index) => {
    const isToday = isBirthdayToday(birthday.month, birthday.day);

    return {
      title: formatDate(birthday.month, birthday.day),
      content: (
        <div className="relative group">
          {/* Main card */}
          <div
            className={`
            relative overflow-hidden rounded-2xl 
            bg-gradient-to-br from-muted/70 via-muted/30 to-muted/10
            border transition-all duration-300
            ${
              isToday
                ? "border-foreground shadow-lg hover:shadow-xl"
                : "border-border/50 hover:border-border shadow-sm hover:shadow-md"
            }
          `}
          >
            {/* Today indicator */}
            {isToday && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-foreground to-transparent" />
            )}

            {/* Content */}
            <div className="relative p-8">
              {/* Name section */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-lg">
                  🎂
                </div>
                <h4 className="text-2xl font-semibold text-foreground tracking-tight">
                  {birthday.name}
                </h4>
              </div>

              {/* Message */}
              {birthday.message && (
                <div className="mb-4">
                  <ExpandableMessage message={birthday.message} />
                </div>
              )}

              {/* Action area */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                {isToday ? (
                  <WishButton
                    birthdayId={birthday.id}
                    initialCount={birthday.wishCount || 0}
                    onWishSent={onWishSent}
                  />
                ) : (
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    <span>Upcoming</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/0 via-transparent to-foreground/0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="relative w-full flex justify-center py-8">
      <div className="w-full md:max-w-[50%] relative">
        <Timeline data={timelineData} />
      </div>
    </div>
  );
}
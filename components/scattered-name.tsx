'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ScatteredNameProps {
  name: string;
  month: number;
  day: number;
  message?: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function ScatteredName({ name, month, day, message }: ScatteredNameProps) {
  const [isOpen, setIsOpen] = useState(false);
  const monthName = monthNames[month - 1];

  // Check if birthday is today
  const today = new Date();
  const isToday = today.getMonth() + 1 === month && today.getDate() === day;

  // Calculate days until birthday
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  let daysUntil: number;

  if (month > currentMonth || (month === currentMonth && day > currentDay)) {
    daysUntil = new Date(today.getFullYear(), month - 1, day).getTime() - today.getTime();
  } else {
    daysUntil = new Date(today.getFullYear() + 1, month - 1, day).getTime() - today.getTime();
  }
  daysUntil = Math.ceil(daysUntil / (1000 * 60 * 60 * 24));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`group relative transition-all duration-300 cursor-pointer ${
            isToday ? 'scale-125' : 'hover:scale-110'
          }`}
        >
          {/* Main text */}
          <span
            className={`text-3xl md:text-5xl font-bold tracking-tight transition-all duration-300 ${
              isToday
                ? 'text-primary drop-shadow-lg'
                : 'text-foreground/70 hover:text-foreground group-hover:drop-shadow-lg'
            }`}
          >
            {name}
          </span>

          {/* Birthday badge for today */}
          {isToday && (
            <span className="absolute -top-2 -right-2 inline-block">
              <span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full animate-pulse">
                Today!
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 bg-card border border-border/50 shadow-xl">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {monthName} {day}
            </p>
          </div>

          {isToday ? (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
              <p className="text-sm font-semibold text-primary">
                🎉 It's their birthday today!
              </p>
            </div>
          ) : (
            <div className="bg-secondary text-foreground/70 rounded-lg p-3">
              <p className="text-sm font-medium">
                {daysUntil} {daysUntil === 1 ? 'day' : 'days'} until birthday
              </p>
            </div>
          )}

          {message && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
              <p className="text-sm italic text-foreground/80">
                "{message}"
              </p>
            </div>
          )}

          <button
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
            onClick={() => setIsOpen(false)}
          >
            Send Birthday Wish ✨
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

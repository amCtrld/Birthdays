'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Birthday {
  id: number;
  name: string;
  month: number;
  day: number;
  message?: string;
}

interface BirthdayCardProps {
  birthday: Birthday;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function BirthdayCard({ birthday }: BirthdayCardProps) {
  const [showWish, setShowWish] = useState(false);
  const monthName = monthNames[birthday.month - 1];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="group cursor-pointer">
          <div className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-primary/10 hover:border-primary/30 p-6 min-h-48 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <p className="text-primary/60 text-sm font-medium uppercase tracking-wide mb-3">{monthName}</p>
              <p className="text-5xl font-bold text-accent mb-2">{birthday.day}</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {birthday.name}
              </p>
              {birthday.message && (
                <p className="text-sm text-muted-foreground mt-2 italic">"{birthday.message}"</p>
              )}
            </div>
            
            {/* Hover indicator */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                Click to wish
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary/5 rounded-full blur-lg group-hover:bg-primary/10 transition-colors" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{birthday.name}'s Birthday</h3>
          <p className="text-primary font-semibold text-lg mt-1">
            {monthName} {birthday.day}
          </p>
        </div>

        {birthday.message && (
          <div className="bg-secondary/50 rounded-lg p-4 border border-primary/10">
            <p className="text-foreground italic">"{birthday.message}"</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Ready to celebrate? Send {birthday.name} some birthday love!
        </p>

        <Button
          onClick={() => setShowWish(true)}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2 rounded-lg transition-colors"
        >
          {showWish ? '🎉 Wishing Happy Birthday!' : 'Wish Happy Birthday 🎉'}
        </Button>

        {showWish && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center animate-in fade-in">
            <p className="text-sm font-semibold text-accent">
              ✨ Your wishes have been sent! ✨
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

'use client';

import { useState } from 'react';
import { BirthdayCard } from './birthday-card';


interface Birthday {
  id: string;
  name: string;
  month: number;
  day: number;
  message?: string;
}

interface WallOfFameProps {
  birthdays: Birthday[];
}

export function WallOfFame({ birthdays }: WallOfFameProps) {
  if (birthdays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-secondary/30 rounded-xl border-2 border-dashed border-primary/20">
        <p className="text-2xl font-semibold text-foreground mb-2">No birthdays yet</p>
        <p className="text-muted-foreground">Be the first to add your birthday to our wall of fame!</p>
      </div>
    );
  }

  return (
    <div id="wall-of-fame" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {birthdays.map((birthday) => (
        <BirthdayCard key={birthday.id} birthday={birthday} />
      ))}
    </div>
  );
}

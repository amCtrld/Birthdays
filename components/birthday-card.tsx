"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


interface Birthday {
  id: string;
  name: string;
  month: number;
  day: number;
  message?: string;
}


interface BirthdayCardProps {
  birthday: Birthday;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
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

export function BirthdayCard({
  birthday,
  selected = false,
  onSelect,
}: BirthdayCardProps) {
  const [showWish, setShowWish] = useState(false);
  const monthName = monthNames[birthday.month - 1];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="group cursor-pointer relative mx-4 my-2">
          {/* Selection Checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(birthday.id, e.target.checked)}
              className="absolute top-4 left-4 z-10 w-4 h-4 accent-primary border border-border rounded focus:ring-2 focus:ring-red-500"
              title="Select this birthday"
            />
          )}
          <div
            className={`relative overflow-hidden rounded-2xl bg-card border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] ${
              selected
                ? "border-2 border-foreground/50 shadow-md"
                : "border-border/50 hover:border-border shadow-sm"
            }`}
          >
            <div className="p-6 flex items-center justify-between gap-6">
              {/* Date Section */}
              <div className="flex flex-col items-center justify-center min-w-[72px]">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {monthName.slice(0, 3)}
                </span>
                <span className="text-4xl font-bold text-foreground mt-1 tabular-nums">
                  {birthday.day}
                </span>
              </div>

              {/* Name Section */}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-foreground truncate">
                  {birthday.name}
                </h4>
                {birthday.message && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {birthday.message}
                  </p>
                )}
              </div>

              {/* Arrow Indicator */}
              <div className="opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 border-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-xl">
          {/* Header Section */}
          <div className="px-6 pt-6 pb-4 border-b border-border/50">
            <h3 className="text-xl font-semibold text-foreground tracking-tight">
              {birthday.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">
              {monthName} {birthday.day}
            </p>
          </div>

          {/* Message Section */}
          {birthday.message && (
            <div className="px-6 py-4 bg-muted/20">
              <p className="text-sm text-foreground/80 leading-relaxed">
                {birthday.message}
              </p>
            </div>
          )}

          {/* Action Section */}
          <div className="px-6 py-5 space-y-3">
            <Button
              onClick={() => setShowWish(true)}
              className="w-full h-10 bg-foreground/50 hover:bg-foreground/90 text-background font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {showWish ? "Wish Sent" : "Send Birthday Wish"}
            </Button>

            {showWish && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Wishes delivered</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import {
  ExternalLink,
  Search,
  BellRing,
  ListTodo,
  SquareX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScatteredWall } from "@/components/scattered-wall";
import { SubmissionForm } from "@/components/submission-form";
import { getAllBirthdays } from "@/app/actions/birthday-actions";
import { BirthdayCard } from "@/components/birthday-card";
import {
  saveUserSelections,
  getUserSelections,
} from "@/app/actions/user-selections";
import { generateICS } from "@/lib/calendar";

interface Birthday {
  id: string;
  name: string;
  month: number;
  day: number;
  message?: string;
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

export default function Home() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Track selected birthday IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Show selected birthdays modal
  const [showSelected, setShowSelected] = useState(false);
  // Show/hide selection UI
  const [showSelection, setShowSelection] = useState(false);
  // User email for selection identification
  const [userEmail, setUserEmail] = useState<string>("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{
    id: string;
    checked: boolean;
  } | null>(null);

  // Handler for selecting/deselecting birthdays
  const handleSelectBirthday = (id: string, checked: boolean) => {
    if (!userEmail && checked) {
      setPendingSelection({ id, checked });
      setShowEmailPrompt(true);
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    // TODO: Save to Firestore here if userEmail exists
  };

  // Handle email prompt submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail && userEmail.includes("@")) {
      localStorage.setItem("bdq_user_email", userEmail);
      setShowEmailPrompt(false);
      if (pendingSelection) {
        handleSelectBirthday(pendingSelection.id, pendingSelection.checked);
        setPendingSelection(null);
      }
    }
  };

  // Fetch birthdays from Firebase on mount
  useEffect(() => {
    async function fetchBirthdays() {
      try {
        const data = await getAllBirthdays();
        setBirthdays(data);
      } catch (error) {
        console.error("Error fetching birthdays:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBirthdays();
  }, []);

  // On mount, restore email from localStorage if present and fetch selections
  useEffect(() => {
    const savedEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("bdq_user_email")
        : null;
    if (savedEmail) {
      setUserEmail(savedEmail);
      // Fetch selections from Firestore
      getUserSelections(savedEmail).then((ids) => {
        setSelectedIds(new Set(ids));
      });
    }
  }, []);

  // Save selections to Firestore when selectedIds or userEmail changes
  useEffect(() => {
    if (userEmail) {
      saveUserSelections(userEmail, Array.from(selectedIds));
    }
  }, [selectedIds, userEmail]);

  const handleSubmit = (data: any) => {
    setBirthdays([...birthdays, { ...data, id: String(Date.now()) }]);
    setShowForm(false);

    // Trigger confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  // Sort birthdays cyclically from today onwards
  const sortBirthdaysCyclically = (birthdayList: Birthday[]) => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();

    // Helper to get "day of year" value for comparison (month * 100 + day)
    const getDayValue = (month: number, day: number) => month * 100 + day;
    const todayValue = getDayValue(currentMonth, currentDay);

    return [...birthdayList].sort((a, b) => {
      const aValue = getDayValue(a.month, a.day);
      const bValue = getDayValue(b.month, b.day);

      // Check if dates are today or in the future (this year)
      const aIsUpcoming = aValue >= todayValue;
      const bIsUpcoming = bValue >= todayValue;

      // Upcoming birthdays come first
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      // Both are upcoming OR both are past - sort by date
      return aValue - bValue;
    });
  };

  const filteredBirthdays = sortBirthdaysCyclically(
    birthdays.filter((birthday) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const name = birthday.name.toLowerCase();
      const monthName = monthNames[birthday.month - 1].toLowerCase();
      const dayStr = birthday.day.toString();
      const dateStr = `${monthName} ${dayStr}`;

      return (
        name.includes(query) ||
        monthName.includes(query) ||
        dayStr.includes(query) ||
        dateStr.includes(query)
      );
    }),
  );

  // Download ICS file for selected birthdays
  const handleDownloadICS = () => {
    const selectedBirthdays = birthdays.filter((b) => selectedIds.has(b.id));
    const ics = generateICS(selectedBirthdays, userEmail || "");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "birthdays.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 1200}
          height={typeof window !== "undefined" ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Header */}
      <div className="z-40 fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight whitespace-nowrap">
            <span className="text-foreground">BD</span>
            <span className="text-foreground font-thin">Queue</span>
          </h1>

          {/* Search Input */}
          <div className="flex-1 max-w-md flex items-center gap-2 relative">
            <input
              type="text"
              placeholder="Search by name or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded-full border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <Search className="absolute right-4 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Set Reminders Button */}
          {!showSelection && (
            <Button
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors"
              onClick={() => setShowSelection(true)}
            >
              <BellRing className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />

      {/* Birthday selection info and controls */}
      {showSelection && (
        <div className="max-w-2xl mx-auto mt-6 mb-4">
          <div className="flex items-center gap-4 mx-4 justify-between">
            <span className="text-sm text-muted-foreground">
              Selected: {selectedIds.size}
            </span>
            <div className="flex items-center gap-2">
              <Button
                className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/90 transition-colors"
                onClick={() => setShowSelected(true)}
                disabled={selectedIds.size === 0}
              >
                <ListTodo className="w-4 h-4" />
              </Button>
              <Button
                className="px-3 py-1 rounded bg-muted text-red-300 text-xs font-semibold border hover:bg-red/90 transition-colors"
                onClick={() => setShowSelection(false)}
              >
                <SquareX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Birthdays Modal */}
      {showSelection && selectedIds.size > 0 && showSelected && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
          onClick={() => setShowSelected(false)}
        >
          <div
            className="w-full max-w-lg bg-card rounded-xl border border-border shadow-lg p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors shadow-md"
              onClick={() => setShowSelected(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">My Selected Birthdays</h2>
            <div className="grid grid-cols-1 gap-4">
              {birthdays
                .filter((b) => selectedIds.has(b.id))
                .map((birthday) => (
                  <div
                    key={birthday.id}
                    className="flex items-center gap-4 border border-border rounded-lg p-4 bg-background"
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-primary">
                        {birthday.name}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {monthNames[birthday.month - 1]} {birthday.day}
                      </span>
                      {birthday.message && (
                        <span className="block text-xs text-muted-foreground mt-1 italic">
                          "{birthday.message}"
                        </span>
                      )}
                    </div>
                    <button
                      className="px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors"
                      onClick={() => handleSelectBirthday(birthday.id, false)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 rounded bg-accent text-accent-foreground font-semibold shadow hover:bg-accent/90 transition-colors"
                onClick={handleDownloadICS}
              >
                Download All as Calendar (.ics)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Birthday cards with selection */}
      {showSelection && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {filteredBirthdays.map((birthday) => (
            <BirthdayCard
              key={birthday.id}
              birthday={{ ...birthday, id: birthday.id }}
              selected={selectedIds.has(birthday.id)}
              onSelect={(id, checked) =>
                handleSelectBirthday(String(id), checked)
              }
            />
          ))}
        </div>
      )}

      {/* Scattered Wall Background */}
      <ScatteredWall
        birthdays={filteredBirthdays}
        onWishSent={() => {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }}
      />

      {/* Form Toggle Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="fixed bottom-[8vh] right-8 z-50 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg"
      >
        {showForm ? "Close" : "Add Birthday"}
      </button>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-md"
            >
              ✕
            </button>
            <SubmissionForm onSubmit={handleSubmit} />
          </div>
        </div>
      )}

      {/* Email Prompt Modal */}
      {showEmailPrompt && (
        <div
          className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
          onClick={() => setShowEmailPrompt(false)}
        >
          <div
            className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors shadow-md"
              onClick={() => setShowEmailPrompt(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Enter your email</h2>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                className="w-full px-4 py-2 rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                placeholder="you@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      <footer>
        <div className="w-full py-6 px-4 border-t border-border mt-12 text-center text-sm text-muted-foreground">
          <p>
            Started by{" "}
            <a
              href="https://mbugua.nijue.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-bold"
            >
              Mbugua
              <ExternalLink className="w-3 h-3" />
            </a>{" "}
            — to be continued by many.
          </p>
        </div>
      </footer>
    </main>
  );
}

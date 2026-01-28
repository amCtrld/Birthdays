'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { ExternalLink, Search } from 'lucide-react';
import { ScatteredWall } from '@/components/scattered-wall';
import { SubmissionForm } from '@/components/submission-form';
import { getAllBirthdays } from '@/app/actions/birthday-actions';

interface Birthday {
  id: string;
  name: string;
  month: number;
  day: number;
  message?: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Home() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch birthdays from Firebase on mount
  useEffect(() => {
    async function fetchBirthdays() {
      try {
        const data = await getAllBirthdays();
        setBirthdays(data);
      } catch (error) {
        console.error('Error fetching birthdays:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBirthdays();
  }, []);

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
      
      return name.includes(query) || monthName.includes(query) || dayStr.includes(query) || dateStr.includes(query);
    })
  );

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1200}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Header */}
      <div className="z-40 fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight whitespace-nowrap">
          <span className="text-foreground">BD</span>
          <span className="text-foreground font-thin">Queue</span>
        </h1>
        
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <Search className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />

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
        className="fixed bottom-8 right-8 z-50 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg"
      >
        {showForm ? 'Close' : 'Add Birthday'}
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
      <footer>
        <div className="w-full py-6 px-4 border-t border-border mt-12 text-center text-sm text-muted-foreground">
          <p>
            Started by <a href="https://mbugua.nijue.me" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-bold">Mbugua<ExternalLink className="w-3 h-3" /></a> — to be continued by many.
          </p>
        </div>
      </footer>
    </main>
  );
}

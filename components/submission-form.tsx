'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { submitBirthday } from '@/app/actions/birthday-actions';
import { Loader2 } from 'lucide-react';

interface SubmissionFormProps {
  onSubmit: (data: any) => void;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function SubmissionForm({ onSubmit }: SubmissionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    month: '',
    day: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.month) {
      newErrors.month = 'Month is required';
    }

    if (!formData.day) {
      newErrors.day = 'Day is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await submitBirthday({
        name: formData.name,
        email: formData.email,
        month: parseInt(formData.month),
        day: parseInt(formData.day),
        message: formData.message || undefined,
      });

      if (result.success) {
        const newBirthday = {
          name: formData.name,
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          message: formData.message || undefined,
        };

        onSubmit(newBirthday);

        // Reset form
        setFormData({
          name: '',
          email: '',
          month: '',
          day: '',
          message: '',
        });
        setErrors({});
      } else {
        setErrors({ submit: result.error || 'An error occurred. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const days = formData.month
    ? Array.from({ length: getDaysInMonth(parseInt(formData.month)) }, (_, i) => i + 1)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-xl border border-border p-8 shadow-lg">
      {/* General Error */}
      {errors.submit && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
          {errors.submit}
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-semibold text-foreground">
          Your Name *
        </label>
        <Input
          id="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`rounded-lg border ${
            errors.name ? 'border-destructive' : 'border-primary/20'
          } py-2 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none`}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
          Email Address *
        </label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`rounded-lg border ${
            errors.email ? 'border-destructive' : 'border-primary/20'
          } py-2 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none`}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      {/* Date Field */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="month" className="block text-sm font-semibold text-foreground">
            Month *
          </label>
          <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value, day: '' })}>
            <SelectTrigger className={`rounded-lg border ${
              errors.month ? 'border-destructive' : 'border-primary/20'
            }`}>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={month} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.month && <p className="text-sm text-destructive">{errors.month}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="day" className="block text-sm font-semibold text-foreground">
            Day *
          </label>
          <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
            <SelectTrigger className={`rounded-lg border ${
              errors.day ? 'border-destructive' : 'border-primary/20'
            }`} disabled={!formData.month}>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.day && <p className="text-sm text-destructive">{errors.day}</p>}
        </div>
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-semibold text-foreground">
          Birthday Message (Optional)
        </label>
        <Textarea
          id="message"
          placeholder="Share what makes your birthday special..."
          value={formData.message}
          onChange={(e) => {
            if (e.target.value.length <= 100) {
              setFormData({ ...formData, message: e.target.value });
            }
          }}
          maxLength={100}
          className="rounded-lg border border-primary/20 py-2 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none min-h-24 resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.message.length}/100 characters
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin h-5 w-5" />
            Submitting...
          </span>
        ) : (
          'Add My Birthday'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center pt-2">
        Required fields are marked with *
      </p>
    </form>
  );
}

function getDaysInMonth(month: number): number {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Simple leap year check (not perfect but good enough)
  if (month === 2 && new Date().getFullYear() % 4 === 0) {
    return 29;
  }
  return daysPerMonth[month - 1];
}

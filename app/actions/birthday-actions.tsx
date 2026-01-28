'use server';

import { resendConfig, db } from '@/lib/firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, orderBy, query, where } from 'firebase/firestore';

interface BirthdaySubmission {
  name: string;
  email: string;
  month: number;
  day: number;
  message?: string;
}

interface Birthday {
  id: string;
  name: string;
  month: number;
  day: number;
  message?: string;
  wishCount?: number;
  email?: string;
}

/**
 * Submit a birthday to the database
 */
export async function submitBirthday(data: BirthdaySubmission) {
  try {
    // Validate input
    if (!data.name || !data.email || !data.month || !data.day) {
      return {
        success: false,
        error: 'Missing required fields',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: 'Invalid email format',
      };
    }

    // Validate month and day
    if (data.month < 1 || data.month > 12) {
      return {
        success: false,
        error: 'Invalid month',
      };
    }

    if (data.day < 1 || data.day > 31) {
      return {
        success: false,
        error: 'Invalid day',
      };
    }

    // Check if email already exists
    const emailQuery = query(
      collection(db, 'birthdays'),
      where('email', '==', data.email.toLowerCase())
    );
    const existingEmails = await getDocs(emailQuery);
    
    if (!existingEmails.empty) {
      return {
        success: false,
        error: 'This email is already registered. One birthday per email address.',
      };
    }

    // Save to Firebase Firestore
    const docRef = await addDoc(collection(db, 'birthdays'), {
      name: data.name,
      email: data.email.toLowerCase(),
      month: data.month,
      day: data.day,
      message: data.message || '',
      createdAt: new Date(),
    });

    // Send confirmation email via Resend
    await sendConfirmationEmail(data);

    return {
      success: true,
      message: 'Birthday submitted successfully! Check your email for confirmation.',
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error submitting birthday:', error);
    return {
      success: false,
      error: 'An error occurred while submitting your birthday. Please try again.',
    };
  }
}

/**
 * Send confirmation email via Resend
 */
async function sendConfirmationEmail(data: BirthdaySubmission) {
  try {
    // Check if Resend API key is configured
    if (!resendConfig.apiKey) {
      console.warn('Resend API key not configured. Skipping email send.');
      return;
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthName = monthNames[data.month - 1];

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BDQueue <noreply@nijue.me>',
        to: data.email,
        subject: `Welcome to the Birthday Wall, ${data.name}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B4513; margin-bottom: 20px;">Welcome to the Birthday Queue!</h1>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hi ${data.name},
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Your birthday has been added to our Birthday Queue! On <strong>${monthName} ${data.day}</strong>, 
              we'll send you a special celebration email to mark the occasion.
            </p>
            
            ${data.message ? `
              <div style="background-color: #f5f1e8; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #666; font-style: italic; margin: 0;">
                  "${data.message}"
                </p>
              </div>
            ` : ''}
            
            <p style="color: #666; font-size: 14px; margin: 20px 0;">
              We only email you on your birthday. Your privacy is important to us.
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              See you on your special day!
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              The BDQueue Team<br>
              <em>We don't forget birthdays anymore</em>
            </p>
            <div>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                By Bowl Technologies, Inc.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw - email failure shouldn't prevent form submission
  }
}

/**
 * Get all birthdays from Firestore
 */
export async function getAllBirthdays(): Promise<Birthday[]> {
  try {
    const q = query(collection(db, 'birthdays'), orderBy('month'), orderBy('day'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      month: doc.data().month,
      day: doc.data().day,
      message: doc.data().message || undefined,
      wishCount: doc.data().wishCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    return [];
  }
}

/**
 * Increment wish count for a birthday
 */
export async function sendBirthdayWish(birthdayId: string) {
  try {
    const birthdayRef = doc(db, 'birthdays', birthdayId);
    const birthdaySnap = await getDoc(birthdayRef);
    
    if (!birthdaySnap.exists()) {
      return { success: false, error: 'Birthday not found' };
    }
    
    const currentWishCount = birthdaySnap.data().wishCount || 0;
    
    await updateDoc(birthdayRef, {
      wishCount: currentWishCount + 1,
      lastWishDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    });
    
    return { success: true, newCount: currentWishCount + 1 };
  } catch (error) {
    console.error('Error sending birthday wish:', error);
    return { success: false, error: 'Failed to send wish' };
  }
}

/**
 * Send wish summary email (called by cron job)
 */
export async function sendWishSummaryEmails() {
  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayMonth = yesterday.getMonth() + 1;
    const yesterdayDay = yesterday.getDate();
    
    // Query birthdays that were yesterday
    const q = query(
      collection(db, 'birthdays'),
      where('month', '==', yesterdayMonth),
      where('day', '==', yesterdayDay)
    );
    
    const snapshot = await getDocs(q);
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const wishCount = data.wishCount || 0;
      
      if (wishCount > 0 && data.email) {
        await sendWishSummaryEmail(data.email, data.name, wishCount);
        
        // Reset wish count for next year
        await updateDoc(doc(db, 'birthdays', docSnap.id), {
          wishCount: 0,
          lastWishDate: null,
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending wish summary emails:', error);
    return { success: false, error: 'Failed to send wish summaries' };
  }
}

/**
 * Send wish summary email to birthday person
 */
async function sendWishSummaryEmail(email: string, name: string, wishCount: number) {
  try {
    if (!resendConfig.apiKey) {
      console.warn('Resend API key not configured. Skipping email send.');
      return;
    }

    const wishText = wishCount === 1 ? 'birthday wish' : 'birthday wishes';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BDQueue <noreply@nijue.me>',
        to: email,
        subject: `🎉 You received ${wishCount} ${wishText} yesterday!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
            <h1 style="color: #8B5CF6; font-size: 36px; margin: 20px 0;">
              🎂 Birthday Wishes Summary 🎂
            </h1>
            
            <p style="color: #333; font-size: 20px; margin: 20px 0;">
              Hi ${name}!
            </p>
            
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); 
                        padding: 30px; border-radius: 16px; margin: 30px 0; color: white;">
              <p style="font-size: 48px; margin: 0 0 10px 0;">
                ${wishCount}
              </p>
              <p style="font-size: 18px; margin: 0;">
                people wished you a Happy Birthday! 🎉
              </p>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.8;">
              We hope you had an amazing birthday celebration! 
              It's wonderful to see so many people thinking of you on your special day.
            </p>
            
            <p style="color: #8B5CF6; font-size: 24px; margin: 30px 0;">
              🎈 🎁 🎊
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              With warm wishes,<br>
              The BDQueue Team
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
    }
  } catch (error) {
    console.error('Error sending wish summary email:', error);
  }
}

/**
 * Send birthday email (would be triggered by a scheduled function)
 */
export async function sendBirthdayEmail(email: string, name: string) {
  try {
    if (!resendConfig.apiKey) {
      console.warn('Resend API key not configured. Skipping email send.');
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Birthday Wall <noreply@nijue.me>',
        to: email,
        subject: `Happy Birthday, ${name}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
            <h1 style="color: #D4AF37; font-size: 48px; margin: 20px 0;">Happy Birthday!</h1>
            
            <p style="color: #333; font-size: 20px; margin: 20px 0;">
              🎉 Today is your special day, ${name}! 🎉
            </p>
            
            <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 69, 19, 0.1) 100%); 
                        padding: 30px; border-radius: 12px; margin: 30px 0;">
              <p style="color: #666; font-size: 16px; line-height: 1.8;">
                We hope you have an amazing day filled with joy, laughter, and wonderful moments. 
                You deserve all the happiness in the world!
              </p>
            </div>
            
            <p style="color: #666; font-size: 16px; margin: 20px 0;">
              Thank you for being part of our Birthday Wall community. 
              Your presence makes our celebrations extra special.
            </p>
            
            <p style="color: #D4AF37; font-size: 24px; margin: 30px 0;">
              🎂 🎈 🎁
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              With warm wishes,<br>
              The Birthday Wall Team
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
    }
  } catch (error) {
    console.error('Error sending birthday email:', error);
  }
}

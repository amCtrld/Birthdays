import { NextRequest, NextResponse } from 'next/server';
import { sendWishSummaryEmails, sendBirthdaySelectionNotifications } from '@/app/actions/birthday-actions';

/**
 * GET /api/cron/wish-summary
 * Cron job endpoint to send wish summary emails
 * Should be triggered daily at 9 AM
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Send wish summary emails
    const result = await sendWishSummaryEmails();
    // Send birthday selection notifications
    await sendBirthdaySelectionNotifications();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Wish summary emails sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

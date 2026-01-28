import { NextRequest, NextResponse } from 'next/server';
import { submitBirthday } from '@/app/actions/birthday-actions';

/**
 * POST /api/birthdays
 * Submit a new birthday entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, month, day, message } = body;

    // Validate input
    if (!name || !email || !month || !day) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call server action
    const result = await submitBirthday({
      name,
      email,
      month,
      day,
      message,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: {
          name,
          month,
          day,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/birthdays
 * Retrieve all birthdays (sorted by upcoming)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement Firebase query
    // For now, return empty array
    return NextResponse.json(
      {
        success: true,
        data: [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

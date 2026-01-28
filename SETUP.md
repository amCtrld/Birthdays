# Birthday Wall - Setup Guide

A beautiful, celebratory birthday collection app built with Next.js, Firebase, and Resend. Never forget a birthday again!

## Features

- **Hero Section**: Warm, celebratory landing page messaging
- **Wall of Fame**: Responsive grid displaying all birthdays
- **Interactive Cards**: Click to send birthday wishes via popover
- **Birthday Submission Form**: Clean, validated form with email and date selection
- **Email Notifications**: Confirmation emails and automated birthday emails via Resend
- **Upcoming Birthdays**: Smart sorting to show upcoming birthdays first
- **Today's Birthdays**: Special highlighting for today's birthday celebrants
- **Mobile Responsive**: Fully responsive design for all devices

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for data storage)
- Resend account (for transactional emails)

## Installation

### 1. Clone or Download the Project

```bash
git clone <your-repo-url>
cd birthday-wall
npm install
```

### 2. Set Up Firebase

1. **Create a Firebase project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a new project"
   - Enable Firestore Database in your project

2. **Get your Firebase credentials**:
   - Go to Project Settings > Service Accounts
   - Copy your configuration values

3. **Create environment variables**:
   - Copy `.env.example` (if provided) or create `.env.local`:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Private - for server operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email

# Resend (for transactional emails)
RESEND_API_KEY=your_resend_api_key_here
```

### 3. Set Up Resend

1. **Create a Resend account**:
   - Go to [Resend](https://resend.com/)
   - Sign up for a free account

2. **Get your API key**:
   - Navigate to API Keys
   - Create a new API key
   - Add to `.env.local` as `RESEND_API_KEY`

3. **Verify your sender domain**:
   - If using production, verify a domain for emails
   - For development, use Resend's test domain

## Firebase Setup (Detailed)

### Create Firestore Collection

1. In Firebase Console, go to Firestore Database
2. Create a new collection named `birthdays`
3. Document structure:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "month": 3,
  "day": 15,
  "message": "Adventure awaits!",
  "createdAt": "2024-01-28T00:00:00.000Z",
  "notificationSent": false
}
```

### Set Up Security Rules

Go to Firestore > Rules and use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /birthdays/{document=**} {
      // Allow anyone to read
      allow read: if true;
      // Allow anyone to create new documents
      allow create: if request.resource.data.name != null 
                    && request.resource.data.email != null
                    && request.resource.data.month != null
                    && request.resource.data.day != null;
      // Deny updates and deletes
      allow update, delete: if false;
    }
  }
}
```

## Email Templates

### Confirmation Email

Users receive a confirmation email when they submit their birthday. The email includes:
- Welcome message
- Their selected birthday date
- Optional custom message they provided
- Privacy reassurance

### Birthday Email

On their birthday, users receive a celebratory email with:
- Personalized birthday greeting
- Celebratory message
- Thank you for being part of the community

**Note**: Birthday email sending would typically be handled by a scheduled Cloud Function (cron job) that runs daily to check for birthdays.

## Project Structure

```
├── app/
│   ├── actions/
│   │   └── birthday-actions.ts      # Server actions for submissions
│   ├── api/
│   │   └── birthdays/
│   │       └── route.ts             # API endpoints
│   ├── globals.css                  # Design tokens and styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Main page
├── components/
│   ├── birthday-card.tsx            # Individual birthday card
│   ├── hero-section.tsx             # Hero section
│   ├── submission-form.tsx          # Form component
│   ├── wall-of-fame.tsx             # Grid display
│   └── ui/                          # shadcn/ui components
├── lib/
│   ├── firebase.ts                  # Firebase config
│   └── utils.ts                     # Utility functions
└── SETUP.md                         # This file
```

## Usage

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app.

### Deploying to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

## Customization

### Colors

Edit `/app/globals.css` to customize the color theme:
- `--primary`: Main brand color (gold/warm tone)
- `--accent`: Highlight color
- `--background`: Page background
- Adjust the OKLCH values for your preferred palette

### Copy

Edit components to customize text:
- `/components/hero-section.tsx`: Hero messaging
- `/components/submission-form.tsx`: Form labels and placeholders
- `/app/page.tsx`: Section headings

### Email Templates

Modify email HTML in:
- `/app/actions/birthday-actions.ts`: Confirmation and birthday emails
- Customize colors, company name, and messaging

## API Endpoints

### POST /api/birthdays

Submit a new birthday.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "month": 3,
  "day": 15,
  "message": "Optional message"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Birthday submitted successfully!",
  "data": {
    "name": "John Doe",
    "month": 3,
    "day": 15
  }
}
```

### GET /api/birthdays

Retrieve all birthdays (currently returns empty array, would query Firestore in production).

## Future Enhancements

- [ ] Implement Firebase Firestore integration for data persistence
- [ ] Add Cloud Function for automated birthday emails
- [ ] Implement user authentication (optional)
- [ ] Add birthday edit/delete functionality
- [ ] Create admin dashboard for moderation
- [ ] Add confetti animation on successful submission
- [ ] Implement email preview in development mode
- [ ] Add timezone support for birthday emails
- [ ] Create shareable birthday links
- [ ] Add birthday countdown feature

## Troubleshooting

### Emails not sending
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for API key validity
- Verify sender domain (for production)
- Check email spam folder

### Firebase connection issues
- Verify all Firebase environment variables are set
- Check Firebase security rules allow read/create operations
- Verify Firestore is enabled in your Firebase project

### Form validation errors
- Ensure email format is valid
- Verify month is 1-12 and day is valid for the month
- Check browser console for specific error messages

## Support

For issues or questions:
1. Check Firebase and Resend documentation
2. Review security rules and environment variables
3. Check browser console for error messages
4. Verify all API keys are valid and active

## License

MIT - Feel free to use this project for personal or commercial purposes.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Firebase](https://firebase.google.com/)
- [Resend](https://resend.com/)

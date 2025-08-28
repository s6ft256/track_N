# Supabase Setup Guide for HSE Inspection System

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)

## Step 2: Get Your Credentials
1. Go to Settings > API in your Supabase dashboard
2. Copy your Project URL and anon/public key
3. Replace the placeholders in `index.html`:
   ```javascript
   const SUPABASE_URL = 'https://your-project-ref.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';http://localhost:8000/
   ```

## Step 3: Create Database Tables
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to create all tables and policies

## Step 4: Set Up Storage
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `inspection-photos`
3. Make it public by toggling the "Public bucket" option
4. Set up storage policies if needed

## Step 5: Configure Authentication (Optional)
1. Go to Authentication > Settings
2. Enable email/password authentication
3. Configure any additional providers you want (Google, GitHub, etc.)

## Step 6: Test the Application
1. Open `index.html` in your browser
2. Try creating an assessor profile
3. Submit an inspection with photos
4. Check your Supabase dashboard to see the data

## Database Schema Overview

### Tables Created:
- `assessors`: Stores assessor information
- `observations`: Stores inspection observations and reports

### Storage Buckets:
- `inspection-photos`: Stores uploaded photos

### Features Implemented:
- ✅ Assessor registration with Supabase database
- ✅ Photo upload to Supabase Storage
- ✅ Fallback to localStorage if connection fails
- ✅ Row Level Security policies
- ✅ Database indexes for performance

### Next Steps:
- Replace remaining localStorage operations with Supabase
- Implement proper authentication flow
- Add real-time subscriptions for live updates
- Set up proper error handling and user feedback

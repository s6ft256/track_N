# HSE Inspection System

A comprehensive Health, Safety & Environment inspection system with modern web technologies.

## Features

### ✅ Authentication Flow
- Secure user registration and login with Supabase Auth
- Email/password authentication
- Automatic assessor profile creation
- Session management

### ✅ Real-time Updates
- Live data synchronization using Supabase subscriptions
- Real-time notifications for new observations
- Automatic dashboard updates
- Multi-user collaboration support

### ✅ Data Validation
- Client-side form validation
- Real-time field validation with visual feedback
- Comprehensive validation rules for all data types
- Error handling and user feedback

### ✅ Offline Support (PWA)
- Progressive Web App capabilities
- Offline data storage using IndexedDB
- Background sync when connection restored
- Service worker for caching
- Installable on mobile devices

### ✅ Analytics Dashboard
- Interactive charts and visualizations
- Risk level distribution analysis
- Timeline trends
- Key performance metrics
- Export functionality (CSV reports)

## Technology Stack

- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Chart.js with date adapters
- **Styling**: Tailwind CSS
- **PWA**: Vite PWA plugin with Workbox
- **Offline Storage**: IndexedDB

## Setup Instructions

### 1. Environment Setup
1. Copy `.env.example` to `.env`
2. Update with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 2. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Verify all tables and policies are created

### 3. Development
```bash
npm install
npm run dev
```

### 4. Production Build
```bash
npm run build
npm run preview
```

## Database Schema

### Core Tables
- `assessors` - User profiles and certifications
- `observations` - Safety inspection reports
- `trainings` - Training records and certifications
- `toolbox_talks` - Safety meeting documentation
- `user_preferences` - User settings and themes
- `custom_responsible_names` - Custom responsibility assignments

### Security
- Row Level Security (RLS) enabled on all tables
- Authentication-based access policies
- Secure file upload to Supabase Storage

## Key Features Implemented

### Authentication System
- Secure sign up/sign in flow
- Automatic assessor profile creation
- Session persistence
- Password reset functionality

### Real-time Capabilities
- Live data synchronization
- Push notifications for critical updates
- Multi-user collaboration
- Automatic UI updates

### Offline Functionality
- IndexedDB for local data storage
- Background sync when online
- Offline form submissions
- Service worker caching
- PWA installation support

### Data Validation
- Real-time form validation
- Visual feedback for errors
- Comprehensive validation rules
- Client-side data integrity

### Analytics & Reporting
- Interactive dashboard with charts
- Risk analysis and trends
- Export capabilities
- Real-time metrics

## Usage

### For Safety Assessors
1. Register with your assessor credentials
2. Submit safety observations with photos
3. Track training completions
4. Schedule and document toolbox talks

### For Safety Managers
1. Monitor real-time safety metrics
2. Analyze risk trends and patterns
3. Export compliance reports
4. Manage team training requirements

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with PWA support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details
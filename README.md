# Government Entity Platform Consolidation Tracker

A comprehensive web application for tracking and managing government entity platform consolidation projects. This app helps you monitor progress, manage meetings, track deadlines, and maintain relationships with multiple government entities.

## Features

### Core Functionality
- **Entity Management**: Track multiple government entities and their consolidation projects
- **Sector Organization**: Group entities by sector for better organization
- **Contact Management**: Store "personality hat" information for each contact (communication preferences, notes, etc.)
- **Platform Tracking**: Monitor platform merging/deletion plans with deadlines
- **Meeting Management**: Schedule, prepare for, and document meetings
- **Smart Meeting Briefs**: Auto-generate PDF briefs with all relevant context before meetings
- **Post-Meeting Reminders**: Get reminded to enter updates after meetings
- **Dashboard**: Overview of all activities, upcoming deadlines, and pending tasks

### Key Workflows

#### Meeting Preparation
1. System distributes meetings based on sectors and platforms
2. Checks the "personality hat" document for contact information
3. Shows platforms with deadlines in the next 3-4 months
4. Displays what happened in the last meeting
5. Suggests talking points for the upcoming meeting
6. Generates a comprehensive PDF brief

#### Post-Meeting
1. Automatic reminder to input latest updates
2. Easy form to enter notes, outcomes, and next steps
3. Updates are linked to the entity for future reference

## Tech Stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Sequelize ORM
- **PDF Generation**: PDFKit
- **Notifications**: Web Push API (optional)

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud-hosted)
- npm or yarn package manager

### Step 1: Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### Step 2: Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE gov_entity_tracker;
```

2. Copy the environment example file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your database connection string:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/gov_entity_tracker
```

4. Run database migrations:
```bash
npm run db:migrate
```

### Step 3: Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Usage Guide

### Initial Setup

1. **Add Sectors**: Start by creating sectors (e.g., "Healthcare", "Education", "Transportation")
   - Go to Dashboard → Add Sector
   - Assign a color for visual identification

2. **Add Entities**: Create government entities
   - Navigate to Entities → Add Entity
   - Assign to a sector
   - Add description and status

3. **Add Contacts**: Add contact persons for each entity
   - Go to Contacts → Add Contact
   - **Important**: Fill in the "Personality Notes" field with communication style, preferences, and key points
   - This becomes your "personality hat" for context-switching

4. **Add Platforms**: Add platforms that need to be consolidated
   - Navigate to Platforms → Add Platform
   - Set action (merge/delete/migrate/consolidate)
   - Set deadline and target platform
   - Update progress regularly

### Meeting Workflow

#### Before a Meeting

1. **Schedule Meeting**:
   - Go to Meetings → Schedule Meeting
   - Select entity, contact, date, and time
   - System automatically creates a post-meeting reminder

2. **Prepare for Meeting**:
   - Click on the scheduled meeting
   - Review all context: entity info, contact personality notes, platform deadlines, last meeting summary
   - Click "Download Meeting Brief PDF" to get a comprehensive brief

#### During/After a Meeting

1. **Enter Updates**:
   - Click "Enter Post-Meeting Updates"
   - Fill in notes, outcomes, and next steps
   - Save updates

2. **Update Platform Progress**:
   - Navigate to the relevant platforms
   - Update status and progress percentage

## API Endpoints

### Sectors
- `GET /api/sectors` - List all sectors
- `POST /api/sectors` - Create new sector
- `GET /api/sectors/:id` - Get sector details
- `PUT /api/sectors/:id` - Update sector
- `DELETE /api/sectors/:id` - Delete sector

### Entities
- `GET /api/entities` - List all entities
- `POST /api/entities` - Create new entity
- `GET /api/entities/:id` - Get entity details with related data
- `PUT /api/entities/:id` - Update entity
- `DELETE /api/entities/:id` - Delete entity

### Contacts
- `GET /api/contacts?entityId=:id` - List contacts (optionally filter by entity)
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get contact details
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Platforms
- `GET /api/platforms?entityId=:id&upcoming=true` - List platforms
- `POST /api/platforms` - Create new platform
- `GET /api/platforms/:id` - Get platform details
- `PUT /api/platforms/:id` - Update platform
- `DELETE /api/platforms/:id` - Delete platform

### Meetings
- `GET /api/meetings?upcoming=true&status=completed` - List meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/:id` - Get meeting details
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `GET /api/meetings/:id/brief` - Download PDF meeting brief

## Database Schema

### Tables
- **sectors**: Government sectors
- **entities**: Government entities being tracked
- **contacts**: Contact persons with personality notes
- **platforms**: Online platforms to be consolidated
- **meetings**: Meeting records with notes and outcomes
- **reminders**: Automated reminders for meetings

### Key Relationships
- Entities belong to Sectors
- Contacts belong to Entities
- Platforms belong to Entities
- Meetings belong to Entities and Contacts
- Reminders belong to Meetings

## Mobile Access

The application is fully responsive and works on mobile devices:
- Access via mobile browser
- Add to home screen for app-like experience (PWA)
- All features available on mobile

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify
- Self-hosted with Docker

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct in `.env`
- Ensure PostgreSQL is running
- Check firewall settings for cloud databases

### PDF Generation Not Working
- Ensure all required dependencies are installed
- Check server logs for specific errors

### Meeting Brief Missing Data
- Verify all related entities, contacts, and platforms are properly linked
- Check that deadline dates are set for platforms

## Future Enhancements

Potential features to add:
- [ ] Push notifications for upcoming meetings
- [ ] Email reminders
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Advanced reporting and analytics
- [ ] Export data to Excel/CSV
- [ ] Multi-user support with authentication
- [ ] Mobile native apps (iOS/Android)
- [ ] Automated meeting scheduling based on platform deadlines
- [ ] Integration with government APIs
- [ ] File attachments for meetings
- [ ] Search functionality

## License

MIT License - feel free to use and modify for your needs.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check database logs
4. Contact your development team

---

**Built with Next.js, TypeScript, and PostgreSQL**

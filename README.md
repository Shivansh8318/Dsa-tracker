# DSA Tracker

A full-stack web application for tracking Data Structures and Algorithms (DSA) practice progress. Built with React, TailwindCSS, Node.js, Express, Prisma, and PostgreSQL.

## Features

### 📚 Question Management
- **Add/Edit/Delete Questions**: Comprehensive CRUD operations for DSA questions
- **Rich Question Details**: Title, difficulty, source platform, problem links, solution date
- **Topics & Tags**: Categorize questions with multiple topics and custom tags
- **Markdown Support**: Write detailed explanations and solutions with Markdown formatting

### 📊 Dashboard & Analytics
- **Progress Overview**: Total solved count, success rates, and topic coverage
- **Interactive Charts**: 
  - Bar chart showing progress by topic
  - Pie chart for difficulty distribution
  - Activity heatmap showing daily solving patterns
- **Real-time Statistics**: Auto-updating stats as you add/solve questions

### 🔍 Advanced Search & Filtering
- **Smart Search**: Search by question title and explanation content
- **Multi-filter Support**: Filter by topic, difficulty, tags
- **Topic-wise Pages**: Dedicated pages for each topic with progress tracking
- **Real-time Filtering**: Instant results as you type

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Clean Interface**: Modern design with TailwindCSS
- **Intuitive Navigation**: Easy-to-use sidebar and breadcrumb navigation
- **Interactive Elements**: Hover effects, smooth transitions, and loading states

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **React Router** for client-side routing
- **TailwindCSS** for styling
- **React Hook Form** for form management
- **Recharts** for data visualization
- **React Markdown** for Markdown rendering
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express framework
- **Prisma ORM** for database management
- **PostgreSQL** for data storage
- **CORS** for cross-origin requests
- **Helmet** for security headers
- **Rate limiting** for API protection

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or use the provided Neon database)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dsa-tracker
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema (creates tables)
npm run db:push

# Start the backend server
npm run dev
```

**Note**: All environment variables are hardcoded in the application for easy setup. No `.env` file is needed.

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend application will start on `http://localhost:3000`

## Project Structure

```
dsa-tracker/
├── README.md
├── package.json                 # Backend dependencies
├── server.js                   # Express server setup
├── prisma/
│   └── schema.prisma           # Database schema
├── frontend/
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # TailwindCSS configuration
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── Layout.jsx      # Main layout component
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   ├── Questions.jsx   # Questions list with filters
│   │   │   ├── AddQuestion.jsx # Add new question form
│   │   │   ├── EditQuestion.jsx# Edit question form
│   │   │   ├── QuestionDetail.jsx # Individual question view
│   │   │   └── TopicPage.jsx   # Topic-specific questions
│   │   ├── services/           # API service functions
│   │   │   └── api.js          # Axios configuration and API calls
│   │   ├── utils/              # Utility functions
│   │   │   ├── constants.js    # App constants
│   │   │   └── helpers.js      # Helper functions
│   │   ├── App.jsx             # Main app component with routing
│   │   ├── main.jsx           # React app entry point
│   │   └── index.css          # Global styles and TailwindCSS
│   └── public/                # Static assets
```

## API Endpoints

### Questions
- `GET /api/questions` - Get all questions (with filtering)
- `GET /api/questions/:id` - Get specific question
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Statistics
- `GET /api/stats` - Get dashboard statistics

### Topics & Tags
- `GET /api/topics` - Get all unique topics
- `GET /api/tags` - Get all unique tags

### Health Check
- `GET /api/health` - Server health status

## Database Schema

The application uses the following main entity:

### Question
- `id`: Unique identifier
- `title`: Question title
- `topics`: Array of topic strings
- `difficulty`: Enum (Easy, Medium, Hard)
- `source`: Source platform (optional)
- `link`: Problem URL (optional)
- `dateSolved`: When the question was solved (optional)
- `explanation`: Markdown explanation (optional)
- `tags`: Array of tag strings
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Usage Guide

### Adding Your First Question
1. Click "Add Question" from the dashboard or questions page
2. Fill in the question details:
   - **Title**: The name of the problem
   - **Difficulty**: Easy, Medium, or Hard
   - **Topics**: Select or add new topics (e.g., "Dynamic Programming", "Graphs")
   - **Source**: Platform where you found the problem (optional)
   - **Link**: Direct URL to the problem (optional)
   - **Date Solved**: When you solved it (optional)
   - **Tags**: Additional categorization tags (optional)
   - **Explanation**: Your solution approach, code, complexity analysis (Markdown supported)

### Tracking Progress
- Use the dashboard to see your overall progress
- View topic-specific pages to track progress in individual areas
- Check the activity heatmap to see your solving patterns
- Monitor difficulty distribution to balance your practice

### Organizing Questions
- Use **Topics** for main algorithmic categories (DP, Graphs, Trees, etc.)
- Use **Tags** for additional context (interview, practice, contest, etc.)
- Leverage the search functionality to quickly find specific questions
- Filter by multiple criteria to narrow down your question list

## Customization

### Adding New Topics
- Topics can be added dynamically through the question form
- Default topics are provided but you can add domain-specific ones
- Topics appear in the dashboard charts and topic-wise pages

### Extending the Schema
To add new fields to questions:

1. Update `prisma/schema.prisma`
2. Run `npm run db:push` to update the database
3. Update the frontend forms and API endpoints accordingly

### Styling Customization
- Modify `frontend/tailwind.config.js` for theme changes
- Update `frontend/src/index.css` for global styles
- Component-specific styles are in individual component files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
1. Check the console for error messages
2. Verify all dependencies are installed correctly
3. Check that both frontend and backend servers are running
4. Database connection is pre-configured - no setup needed

For additional help, please open an issue in the repository.

---

Happy coding and good luck with your DSA practice! 🚀

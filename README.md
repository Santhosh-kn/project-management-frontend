# Project Management System - Frontend

A modern project management application built with Vue 3 and TypeScript.

## Features

### Core Functionality
- User Authentication - Secure login/register with JWT tokens
- Project Management - Create, edit, and organize projects
- Task Management - Full CRUD operations with status tracking
- Kanban Board - Drag-and-drop task organization
- Calendar View - Visual timeline of tasks and deadlines
- Time Tracking - Log and monitor time spent on tasks
- File Management - Upload and organize project files
- Team Collaboration - Assign tasks, add comments, mention users
- Tags and Categories - Organize tasks with custom tags

### User Experience
- Dark/Light Theme - System-aware theme switching
- Toast Notifications - Non-intrusive user feedback
- Form Validation - Real-time validation with VeeValidate
- Responsive Design - Mobile-friendly interface
- Modern UI - Clean, professional Bootstrap 5 design

## Tech Stack

### Frontend
- Framework: Vue 3 (Composition API)
- Language: TypeScript
- Build Tool: Vite
- State Management: Pinia
- Routing: Vue Router 4
- Styling: Bootstrap 5
- Form Validation: VeeValidate + Yup
- HTTP Client: Axios

### Backend
- API: Laravel 11 (RESTful API)
- Database: MySQL
- Authentication: JWT

## Installation

### Prerequisites
- Node.js >= 18.x
- npm or yarn
- Laravel backend running

### Setup

Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/project-management-frontend.git
cd project-management-frontend
```

Install dependencies:
```bash
npm install
```

Configure environment:
```bash
cp .env.example .env
# Edit .env and set your API endpoint
# VITE_API_BASE_URL=http://localhost:8000/api
```

Run development server:
```bash
npm run dev
```

Application runs at: http://localhost:3000

## Build for Production

Build the application:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
project-management-frontend/
├── src/
│   ├── api/              # API service functions
│   ├── assets/           # Static assets and styles
│   ├── components/       # Reusable Vue components
│   ├── composables/      # Vue composables
│   ├── router/           # Vue Router configuration
│   ├── stores/           # Pinia state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── views/            # Page components
│   ├── App.vue           # Root component
│   └── main.ts           # Application entry point
├── public/               # Public static files
├── .env.example          # Environment variables example
├── package.json          # Dependencies
└── vite.config.ts        # Vite configuration
```

## Configuration

Edit .env file:
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Project Management
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking
npm run lint         # Lint and fix files
```

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Santhosh
- GitHub: [@your-username](https://github.com/your-username)
- Email: your-email@example.com

## Backend Repository

Backend API: [Link to backend repository]

## Support

For support, open an issue in the repository.

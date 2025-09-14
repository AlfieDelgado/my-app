# React + Supabase Todo List Application

A modern, full-stack Todo List application built with React, Supabase, and Tailwind CSS.

## Features

- **Task Management**: Create, edit, and delete tasks
- **Task Status**: Mark tasks as complete or incomplete
- **Task Filtering**: View all, active, or completed tasks
- **User Authentication**: Secure login, signup, and OAuth integration
- **Real-time Updates**: Changes sync instantly across devices
- **Responsive Design**: Works on all device sizes
- **Modern UI**: Clean interface with Tailwind CSS

## 🛠️ Technologies Used

### Frontend
- **React 19**: Modern React with hooks and functional components
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

### Backend & Database
- **Supabase**: PostgreSQL database with real-time capabilities
- **Authentication**: Built-in user management and OAuth
- **Row Level Security**: Automatic data isolation between users
- **Real-time Subscriptions**: Live data synchronization

### Development Tools
- **Jest**: Testing framework with React Testing Library
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing and autoprefixing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/react-todo-list.git
   cd react-todo-list
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql`
   - Add environment variables to `.env.local`:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application.

## 📜 Available Scripts

```bash
# Development
npm run dev          # Starts development server
npm run build        # Builds for production
npm run preview      # Serves production build locally

# Code Quality
npm run lint         # Runs ESLint
npm run test         # Runs all tests
npm run test:watch   # Runs tests in watch mode
npm run test:coverage # Runs tests with coverage report
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Button.jsx       # Reusable button with variants
│   ├── TodoItem.jsx     # Individual todo item
│   ├── TodoList.jsx     # Main todo list interface
│   ├── AuthButton.jsx   # User authentication dropdown
│   ├── Login.jsx        # Login form with OAuth
│   ├── SignUp.jsx       # Registration form
│   ├── ProtectedRoute.jsx # Route protection wrapper
│   └── ErrorBoundary.jsx # Error handling component
├── hooks/               # Custom React hooks
│   └── useTodos.js      # Todo data management
├── services/            # API and database services
│   └── todoService.js   # Supabase database operations
├── AuthContext.jsx      # Authentication context provider
├── supabaseClient.js    # Supabase client configuration
├── types.js             # Type definitions
└── App.jsx              # Main application component
```

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **React Team**: For the amazing React library
- **Supabase**: For the excellent backend-as-a-service platform
- **Tailwind CSS**: For the utility-first CSS framework
- **Vite**: For the fast and modern build tool

---

**Built with ❤️ for learning modern web development**

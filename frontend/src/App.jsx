import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Chat from './pages/chat/Chat';
import Layout from "./components/Layout";
import MobileBottomNav from './components/MobileBottomNav';
import DocumentsList from './pages/documents/DocumentsList';
import DocumentDetail from './pages/documents/DocumentDetail';
import UploadPDF from './pages/documents/UploadPDF';
import RAGChat from './pages/rag/RAGChat';
import SubjectsList from './pages/subjects/SubjectsList';
import CreateSubject from './pages/subjects/CreateSubject';
import SubjectDetail from './pages/subjects/SubjectDetail';
import QuizList from './pages/quiz/QuizList';
import TakeQuiz from './pages/quiz/TakeQuiz';
import QuizResult from './pages/quiz/QuizResult';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import StudyPlanner from './pages/study/StudyPlanner';
import Timetable from './pages/timetable/Timetable';
import Notifications from './pages/notifications/Notifications';
import StudyPlannerCreate from './pages/study-planner/StudyPlannerCreate';
import StudyPlanDetail from './pages/study-planner/StudyPlanDetail';
import StudyPlanEdit from './pages/study-planner/StudyPlanEdit';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <Layout>
            <Chat />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute>
          <Layout>
            <DocumentsList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/documents/upload" element={
        <ProtectedRoute>
          <Layout>
            <UploadPDF />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/documents/:id" element={
        <ProtectedRoute>
          <Layout>
            <DocumentDetail />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/rag" element={
        <ProtectedRoute>
          <Layout>
            <RAGChat />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/subjects" element={
        <ProtectedRoute>
          <Layout>
            <SubjectsList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/subjects/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateSubject />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/subjects/:id" element={
        <ProtectedRoute>
          <Layout>
            <SubjectDetail />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/subjects/edit/:id" element={
        <ProtectedRoute>
          <Layout>
            <CreateSubject />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/quiz" element={
        <ProtectedRoute>
          <Layout>
            <QuizList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/quiz/:id" element={
        <ProtectedRoute>
          <Layout>
            <TakeQuiz />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/quiz/:id/result" element={
        <ProtectedRoute>
          <Layout>
            <QuizResult />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute>
          <Layout>
            <UserManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/study-planner" element={
        <ProtectedRoute>
          <Layout>
            <StudyPlanner />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/timetable" element={
        <ProtectedRoute>
          <Layout>
            <Timetable />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Layout>
            <Notifications />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/study-planner/create" element={
  <ProtectedRoute>
    <Layout>
      <StudyPlannerCreate />
    </Layout>
  </ProtectedRoute>
} />
<Route path="/study-planner/:id" element={
  <ProtectedRoute>
    <Layout>
      <StudyPlanDetail />
    </Layout>
  </ProtectedRoute>
} />

<Route path="/study-planner/edit/:id" element={
  <ProtectedRoute>
    <Layout>
      <StudyPlanEdit />
    </Layout>
  </ProtectedRoute>
} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="pb-16 lg:pb-0">
            <AppRoutes />
            <MobileBottomNav />
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
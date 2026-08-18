import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import MembersPage from "./pages/MembersPage";
import BorrowReturnPage from "./pages/BorrowReturnPage";
import MyBooksPage from "./pages/MyBooksPage";
import FinesPage from "./pages/FinesPage";
import ReportsPage from "./pages/ReportsPage";
import FeedbackPage from "./pages/FeedbackPage";
import NotificationsPage from "./pages/NotificationsPage";
import ChatbotPage from "./pages/ChatbotPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

const STAFF = ["admin", "librarian"];
const MEMBER = ["member"];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/fines" element={<FinesPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route path="/members" element={
                <ProtectedRoute roles={STAFF}><MembersPage /></ProtectedRoute>
              } />
              <Route path="/borrowed-books" element={
                <ProtectedRoute roles={STAFF}><BorrowReturnPage /></ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute roles={STAFF}><ReportsPage /></ProtectedRoute>
              } />
              <Route path="/my-books" element={
                <ProtectedRoute roles={MEMBER}><MyBooksPage /></ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

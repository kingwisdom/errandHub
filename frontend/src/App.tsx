import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Agents = lazy(() => import('./pages/Agents'));
const AgentDetail = lazy(() => import('./pages/AgentDetail'));
const MyRequests = lazy(() => import('./pages/MyRequests'));
const RequestDetail = lazy(() => import('./pages/RequestDetail'));
const CreateRequest = lazy(() => import('./pages/CreateRequest'));
const Chat = lazy(() => import('./pages/Chat'));
const ProfileBuilder = lazy(() => import('./pages/ProfileBuilder'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const ServiceForm = lazy(() => import('./pages/ServiceForm'));
const ServicesBrowse = lazy(() => import('./pages/ServicesBrowse'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const MyServices = lazy(() => import('./pages/MyServices'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const BookingForm = lazy(() => import('./pages/BookingForm'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminVerifications = lazy(() => import('./pages/AdminVerifications'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminServices = lazy(() => import('./pages/AdminServices'));
const AdminRequests = lazy(() => import('./pages/AdminRequests'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ErrandsBrowse = lazy(() => import('./pages/ErrandsBrowse'));
const ErrandDetail = lazy(() => import('./pages/ErrandDetail'));
const ErrandApplications = lazy(() => import('./pages/ErrandApplications'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const NearbySearch = lazy(() => import('./pages/NearbySearch'));

const AiHomePage = lazy(() => import('./pages/AiHomePage'));
const AiChatPage = lazy(() => import('./pages/AiChatPage'));
const AiWorkflowsPage = lazy(() => import('./pages/AiWorkflowsPage'));
const AiWorkflowPage = lazy(() => import('./pages/AiWorkflowPage'));
const FinanceDashboardPage = lazy(() => import('./pages/FinanceDashboardPage'));
const ImmigrationDashboardPage = lazy(() => import('./pages/ImmigrationDashboardPage'));
const ShoppingDashboardPage = lazy(() => import('./pages/ShoppingDashboardPage'));
const PropertyDashboardPage = lazy(() => import('./pages/PropertyDashboardPage'));
const TravelDashboardPage = lazy(() => import('./pages/TravelDashboardPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/analytics" element={<Suspense fallback={<PageFallback />}><AdminAnalytics /></Suspense>} />
                <Route path="/admin/verifications" element={<Suspense fallback={<PageFallback />}><AdminVerifications /></Suspense>} />
                <Route path="/admin/users" element={<Suspense fallback={<PageFallback />}><AdminUsers /></Suspense>} />
                <Route path="/admin/services" element={<Suspense fallback={<PageFallback />}><AdminServices /></Suspense>} />
                <Route path="/admin/requests" element={<Suspense fallback={<PageFallback />}><AdminRequests /></Suspense>} />
                <Route path="/admin/reviews" element={<Suspense fallback={<PageFallback />}><AdminReviews /></Suspense>} />
                <Route path="/admin/categories" element={<Suspense fallback={<PageFallback />}><AdminCategories /></Suspense>} />
              </Route>
            </Route>

            {/* All other routes — unified layout */}
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route path="/" element={<Suspense fallback={<PageFallback />}><Home /></Suspense>} />
              <Route path="/login" element={<Suspense fallback={<PageFallback />}><Login /></Suspense>} />
              <Route path="/register" element={<Suspense fallback={<PageFallback />}><Register /></Suspense>} />
              <Route path="/forgot-password" element={<Suspense fallback={<PageFallback />}><ForgotPassword /></Suspense>} />
              <Route path="/reset-password" element={<Suspense fallback={<PageFallback />}><ResetPassword /></Suspense>} />
              <Route path="/verify-email" element={<Suspense fallback={<PageFallback />}><VerifyEmail /></Suspense>} />
              <Route path="/agents" element={<Suspense fallback={<PageFallback />}><Agents /></Suspense>} />
              <Route path="/agents/:id" element={<Suspense fallback={<PageFallback />}><AgentDetail /></Suspense>} />
              <Route path="/services" element={<Suspense fallback={<PageFallback />}><ServicesBrowse /></Suspense>} />
              <Route path="/services/:id" element={<Suspense fallback={<PageFallback />}><ServiceDetail /></Suspense>} />
              <Route path="/errands" element={<Suspense fallback={<PageFallback />}><ErrandsBrowse /></Suspense>} />
              <Route path="/errands/:id" element={<Suspense fallback={<PageFallback />}><ErrandDetail /></Suspense>} />
              <Route path="/requests/browse" element={<Suspense fallback={<PageFallback />}><MyRequests /></Suspense>} />
              <Route path="/nearby" element={<Suspense fallback={<PageFallback />}><NearbySearch /></Suspense>} />

              {/* AI routes — guest accessible */}
              <Route path="/ai" element={<Suspense fallback={<PageFallback />}><AiHomePage /></Suspense>} />
              <Route path="/ai/chat" element={<Suspense fallback={<PageFallback />}><AiChatPage /></Suspense>} />
              <Route path="/ai/chat/:conversationId" element={<Suspense fallback={<PageFallback />}><AiChatPage /></Suspense>} />
              <Route path="/ai/workflows" element={<Suspense fallback={<PageFallback />}><AiWorkflowsPage /></Suspense>} />
              <Route path="/ai/workflow/:slug" element={<Suspense fallback={<PageFallback />}><AiWorkflowPage /></Suspense>} />
              <Route path="/ai/workflow/:slug/:userWorkflowId" element={<Suspense fallback={<PageFallback />}><AiWorkflowPage /></Suspense>} />
              <Route path="/ai/workflow/finance/:userWorkflowId/dashboard" element={<Suspense fallback={<PageFallback />}><FinanceDashboardPage /></Suspense>} />
              <Route path="/ai/workflow/immigration/:userWorkflowId/dashboard" element={<Suspense fallback={<PageFallback />}><ImmigrationDashboardPage /></Suspense>} />
              <Route path="/ai/workflow/shopping/:userWorkflowId/dashboard" element={<Suspense fallback={<PageFallback />}><ShoppingDashboardPage /></Suspense>} />
              <Route path="/ai/workflow/property/:userWorkflowId/dashboard" element={<Suspense fallback={<PageFallback />}><PropertyDashboardPage /></Suspense>} />
              <Route path="/ai/workflow/travel/:userWorkflowId/dashboard" element={<Suspense fallback={<PageFallback />}><TravelDashboardPage /></Suspense>} />

              {/* Protected routes — require auth */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><Dashboard /></Suspense>} />
                <Route path="/requests" element={<Suspense fallback={<PageFallback />}><MyRequests /></Suspense>} />
                <Route path="/requests/create" element={<Suspense fallback={<PageFallback />}><CreateRequest /></Suspense>} />
                <Route path="/requests/:id" element={<Suspense fallback={<PageFallback />}><RequestDetail /></Suspense>} />
                <Route path="/requests/:requestId/chat" element={<Suspense fallback={<PageFallback />}><Chat /></Suspense>} />
                <Route path="/my-profile" element={<Suspense fallback={<PageFallback />}><ProfileBuilder /></Suspense>} />
                <Route path="/portfolio" element={<Suspense fallback={<PageFallback />}><Portfolio /></Suspense>} />
                <Route path="/services/create" element={<Suspense fallback={<PageFallback />}><ServiceForm /></Suspense>} />
                <Route path="/services/:id/edit" element={<Suspense fallback={<PageFallback />}><ServiceForm /></Suspense>} />
                <Route path="/services/my" element={<Suspense fallback={<PageFallback />}><MyServices /></Suspense>} />
                <Route path="/bookings" element={<Suspense fallback={<PageFallback />}><MyBookings /></Suspense>} />
                <Route path="/services/:id/book" element={<Suspense fallback={<PageFallback />}><BookingForm /></Suspense>} />
                <Route path="/notifications" element={<Suspense fallback={<PageFallback />}><NotificationsPage /></Suspense>} />
                <Route path="/errands/:id/applications" element={<Suspense fallback={<PageFallback />}><ErrandApplications /></Suspense>} />
                <Route path="/my-applications" element={<Suspense fallback={<PageFallback />}><MyApplications /></Suspense>} />
              </Route>
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

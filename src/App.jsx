import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { UploadProvider } from './context/UploadContext';
import Navbar from './components/Navbar';
import UploadStatusBar from './components/UploadStatusBar';
import MobileBottomNav from './components/MobileBottomNav';
import RequireLogin from './components/RequireLogin';
import 'react-toastify/dist/ReactToastify.css';

// Lazy-loaded pages
const Feed = lazy(() => import('./pages/Feed'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Video = lazy(() => import('./pages/Video'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const History = lazy(() => import('./pages/History'));

// Page transition animations
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

// Loader during lazy loading
function FallbackLoader() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-light">
      <div
        className="spinner-border text-primary mb-3"
        style={{ width: '3rem', height: '3rem' }}
        role="status"
      ></div>
      <h5 className="mb-1">Loading Streamify...</h5>
      <small className="text-secondary">Please wait a moment</small>
    </div>
  );
}

// Error boundary fallback
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-danger text-center">
      <h3>😢 Oops! Something went wrong</h3>
      <p className="text-secondary">{error.message}</p>
      <button
        className="btn btn-outline-light mt-3"
        onClick={resetErrorBoundary}
      >
        Try Again
      </button>
    </div>
  );
}

// Animated routes
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ---------- Public Routes ---------- */}
        <Route
          path="/"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Feed />
            </motion.div>
          }
        />

        <Route
          path="/login"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Login />
            </motion.div>
          }
        />

        <Route
          path="/register"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Register />
            </motion.div>
          }
        />

        <Route
          path="/video/:id"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Video />
            </motion.div>
          }
        />

        {/* ---------- Login Required Routes ---------- */}
        <Route
          path="/dashboard"
          element={
            <RequireLogin>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Dashboard />
              </motion.div>
            </RequireLogin>
          }
        />

        <Route
          path="/history"
          element={
            <RequireLogin>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <History />
              </motion.div>
            </RequireLogin>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireLogin>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Profile />
              </motion.div>
            </RequireLogin>
          }
        />

        {/* ---------- Not Found ---------- */}
        <Route
          path="*"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <NotFound />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

// ---------- MAIN APP ----------
export default function App() {
  return (
    <AuthProvider>
      <UploadProvider>
        <div
          className="app-background text-light"
          style={{ backgroundColor: '#0d0d0d', minHeight: '100vh' }}
        >
          {/* Top Navbar */}
          <Navbar />

          {/* Error & Loading Handlers */}
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<FallbackLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </ErrorBoundary>

          {/* Global Upload Status Bar */}
          <UploadStatusBar />

          {/* Mobile Bottom Navigation (always visible) */}
          <MobileBottomNav />

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="dark"
          />
        </div>
      </UploadProvider>
    </AuthProvider>
  );
}

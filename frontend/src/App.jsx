import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthLoader from "@/components/AuthLoader";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

// Lazy load all pages (code splitting - loads only when user visits that page)
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const TransactionsPage = lazy(() => import("@/pages/transactions/TransactionsPage"));
const CategoriesPage = lazy(() => import("@/pages/categories/CategoriesPage"));
const BudgetsPage = lazy(() => import("@/pages/budgets/BudgetsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Loading spinner shown while lazy page is loading
function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// React Query client config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    // Redux store provider
    <Provider store={store}>
      {/* React Query provider */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* BrowserRouter wraps everything that uses routing */}
          <BrowserRouter>
            {/* AuthLoader checks if user is logged in via cookie on app start */}
            <AuthLoader>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes - anyone can access */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected routes - only logged in users */}
                  <Route element={<ProtectedRoute />}>
                    {/* AppLayout adds Navbar + Footer around the page */}
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/transactions" element={<TransactionsPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/budgets" element={<BudgetsPage />} />
                    </Route>
                  </Route>

                  {/* 404 - no matching route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </AuthLoader>
          </BrowserRouter>

          {/* Toast notifications (shows in top-right corner) */}
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

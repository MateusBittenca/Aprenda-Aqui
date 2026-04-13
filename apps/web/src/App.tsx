import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/AppLayout';
import { AdminLayout } from './components/AdminLayout';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { LessonPage } from './pages/LessonPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { TrackDetailPage } from './pages/TrackDetailPage';
import { TrackCatalogPage } from './pages/TrackCatalogPage';
import { TrackCatalogDetailPage } from './pages/TrackCatalogDetailPage';
import { MyTracksPage } from './pages/MyTracksPage';
import { RankingPage } from './pages/RankingPage';
import { SettingsPage } from './pages/SettingsPage';
import { CommunityPage } from './pages/CommunityPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ComparePage } from './pages/ComparePage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminTracksPage } from './pages/admin/AdminTracksPage';
import { AdminTrackContentPage } from './pages/admin/AdminTrackContentPage';
import { AdminLessonEditPage } from './pages/admin/AdminLessonEditPage';
import { AdminTeamPage } from './pages/admin/AdminTeamPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Dados “frescos” ao voltar à tela; evita sensação de app preso no cache. */
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster richColors position="top-center" closeButton />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="team" element={<AdminTeamPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="tracks" element={<AdminTracksPage />} />
              <Route path="tracks/:trackId" element={<AdminTrackContentPage />} />
              <Route path="lessons/:lessonId/edit" element={<AdminLessonEditPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="tracks" element={<TrackCatalogPage />} />
              <Route path="tracks/:trackId" element={<TrackCatalogDetailPage />} />
              <Route path="my-tracks" element={<MyTracksPage />} />
              <Route path="my-tracks/:trackId" element={<TrackDetailPage />} />
              <Route path="lessons/:lessonId" element={<LessonPage />} />
              <Route path="ranking" element={<RankingPage />} />
              <Route path="me" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="users/:userId/compare" element={<ComparePage />} />
              <Route path="users/:userId" element={<UserProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

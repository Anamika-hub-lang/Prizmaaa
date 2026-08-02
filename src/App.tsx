import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { BecomeMentorPage } from './pages/BecomeMentorPage'
import { ShareReviewPage } from './pages/ShareReviewPage'
import { AboutPage } from './pages/AboutPage'
import { PricingPage } from './pages/PricingPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { StudentAssignmentsPage } from './pages/StudentAssignmentsPage'
import { StudentCalendarPage } from './pages/StudentCalendarPage'
import { StudentBrowsePage } from './pages/student/StudentBrowsePage'
import { StudentCategoryBrowsePage } from './pages/student/StudentCategoryBrowsePage'
import { StudentFreeCoursesPage } from './pages/student/StudentFreeCoursesPage'
import { StudentClassDetailPage } from './pages/student/StudentClassDetailPage'
import { StudentCheckoutPage } from './pages/student/StudentCheckoutPage'
import { StudentTrialPaymentPage } from './pages/student/StudentTrialPaymentPage'
import { StudentPaymentReturnPage } from './pages/student/StudentPaymentReturnPage'
import { StudentEnrolledPage } from './pages/student/StudentEnrolledPage'
import { TeacherDashboard } from './pages/TeacherDashboard'
import { MentorClassesPage } from './pages/mentor/MentorClassesPage'
import { MentorFreeCoursesPage } from './pages/mentor/MentorFreeCoursesPage'
import { MentorMeetPage } from './pages/mentor/MentorMeetPage'
import { MentorAssignmentsPage } from './pages/mentor/MentorAssignmentsPage'
import { StudentLayout } from './components/layout/StudentLayout'
import { TeacherLayout } from './components/layout/TeacherLayout'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireOnboarding, RequireRoleOnboardingOnly } from './components/auth/RequireOnboarding'
import { RequireProfileOnboardingOnly } from './components/auth/RequireProfileOnboarding'
import { RequireStudentRoute } from './components/auth/RequireStudentRoute'
import { RequireTeacherRoute } from './components/auth/RequireTeacherRoute'
import { RoleSelectionPage } from './pages/onboarding/RoleSelectionPage'
import { ProfileDetailsPage } from './pages/onboarding/ProfileDetailsPage'
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage'
import { PortalProfilePage } from './pages/profile/PortalProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/become-mentor" element={<BecomeMentorPage />} />
        <Route path="/reviews" element={<ShareReviewPage />} />

        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/login" element={<Navigate to="/sign-in" replace />} />
        <Route path="/signup" element={<Navigate to="/sign-up" replace />} />

        <Route path="/courses" element={<Navigate to="/sign-in" replace />} />
        <Route path="/mentors" element={<Navigate to="/about" replace />} />
        <Route path="/contact" element={<Navigate to="/about" replace />} />
        <Route path="/live" element={<Navigate to="/sign-in" replace />} />
        <Route path="/library" element={<Navigate to="/sign-in" replace />} />
        <Route path="/blog" element={<Navigate to="/sign-in" replace />} />

        <Route element={<RequireAuth />}>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          <Route element={<RequireRoleOnboardingOnly />}>
            <Route path="/onboarding/role" element={<RoleSelectionPage />} />
          </Route>

          <Route element={<RequireProfileOnboardingOnly />}>
            <Route path="/onboarding/profile" element={<ProfileDetailsPage />} />
          </Route>

          <Route element={<RequireOnboarding />}>
            <Route element={<RequireStudentRoute />}>
              <Route element={<StudentLayout />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/browse" element={<StudentBrowsePage />} />
                <Route path="/student/browse/:categoryId" element={<StudentCategoryBrowsePage />} />
                <Route path="/student/free" element={<StudentFreeCoursesPage />} />
                <Route path="/student/class/:classId" element={<StudentClassDetailPage />} />
                <Route path="/student/checkout/:classId" element={<StudentCheckoutPage />} />
                <Route path="/student/checkout/:classId/trial" element={<StudentTrialPaymentPage />} />
                <Route path="/student/payment/return" element={<StudentPaymentReturnPage />} />
                <Route path="/student/enrolled/:classId" element={<StudentEnrolledPage />} />
                <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
                <Route path="/student/calendar" element={<StudentCalendarPage />} />
                <Route path="/student/profile" element={<PortalProfilePage portal="student" />} />
              </Route>
            </Route>

            <Route element={<RequireTeacherRoute />}>
              <Route element={<TeacherLayout />}>
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/classes" element={<MentorClassesPage />} />
                <Route path="/teacher/free-courses" element={<MentorFreeCoursesPage />} />
                <Route path="/teacher/meet" element={<MentorMeetPage />} />
                <Route path="/teacher/assignments" element={<MentorAssignmentsPage />} />
                <Route path="/teacher/profile" element={<PortalProfilePage portal="teacher" />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

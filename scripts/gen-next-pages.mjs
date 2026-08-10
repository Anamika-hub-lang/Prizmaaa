import fs from 'node:fs'
import path from 'node:path'

const pages = [
  ['app/page.tsx', '@/views/HomePage', 'HomePage'],
  ['app/counselling/page.tsx', '@/views/CounsellingPage', 'CounsellingPage'],
  ['app/counselling/payment/return/page.tsx', '@/views/CounsellingPaymentReturnPage', 'CounsellingPaymentReturnPage'],
  ['app/counselling/[groupId]/page.tsx', '@/views/CounsellingCategoryPage', 'CounsellingCategoryPage'],
  ['app/universities/page.tsx', '@/views/UniversitiesPage', 'UniversitiesPage'],
  ['app/universities/[universityId]/page.tsx', '@/views/UniversityDetailPage', 'UniversityDetailPage'],
  ['app/university-counseling/page.tsx', '@/views/UniversityCounselingPage', 'UniversityCounselingPage'],
  ['app/university-counseling/[universityId]/page.tsx', '@/views/UniversityCounselingDetailPage', 'UniversityCounselingDetailPage'],
  ['app/about/page.tsx', '@/views/AboutPage', 'AboutPage'],
  ['app/pricing/page.tsx', '@/views/PricingPage', 'PricingPage'],
  ['app/become-mentor/page.tsx', '@/views/BecomeMentorPage', 'BecomeMentorPage'],
  ['app/reviews/page.tsx', '@/views/ShareReviewPage', 'ShareReviewPage'],
  ['app/classes/page.tsx', '@/views/LiveClassesPage', 'LiveClassesPage'],
  ['app/sign-in/[[...sign-in]]/page.tsx', '@/views/SignInPage', 'SignInPage'],
  ['app/sign-up/[[...sign-up]]/page.tsx', '@/views/SignUpPage', 'SignUpPage'],
  ['app/auth/callback/page.tsx', '@/views/auth/AuthCallbackPage', 'AuthCallbackPage'],
  ['app/onboarding/role/page.tsx', '@/views/onboarding/RoleSelectionPage', 'RoleSelectionPage'],
  ['app/onboarding/profile/page.tsx', '@/views/onboarding/ProfileDetailsPage', 'ProfileDetailsPage'],
  ['app/admin/page.tsx', '@/views/admin/AdminDashboardPage', 'AdminDashboardPage'],
  ['app/admin/counselling/page.tsx', '@/views/admin/AdminCounsellingPage', 'AdminCounsellingPage'],
  ['app/student/payment/return/page.tsx', '@/views/student/StudentPaymentReturnPage', 'StudentPaymentReturnPage'],
  ['app/student/(portal)/page.tsx', '@/views/StudentDashboard', 'StudentDashboard'],
  ['app/student/(portal)/browse/page.tsx', '@/views/student/StudentBrowsePage', 'StudentBrowsePage'],
  ['app/student/(portal)/browse/[categoryId]/page.tsx', '@/views/student/StudentCategoryBrowsePage', 'StudentCategoryBrowsePage'],
  ['app/student/(portal)/free/page.tsx', '@/views/student/StudentFreeCoursesPage', 'StudentFreeCoursesPage'],
  ['app/student/(portal)/class/[classId]/page.tsx', '@/views/student/StudentClassDetailPage', 'StudentClassDetailPage'],
  ['app/student/(portal)/checkout/[classId]/page.tsx', '@/views/student/StudentCheckoutPage', 'StudentCheckoutPage'],
  ['app/student/(portal)/checkout/[classId]/trial/page.tsx', '@/views/student/StudentTrialPaymentPage', 'StudentTrialPaymentPage'],
  ['app/student/(portal)/enrolled/[classId]/page.tsx', '@/views/student/StudentEnrolledPage', 'StudentEnrolledPage'],
  ['app/student/(portal)/assignments/page.tsx', '@/views/StudentAssignmentsPage', 'StudentAssignmentsPage'],
  ['app/student/(portal)/calendar/page.tsx', '@/views/StudentCalendarPage', 'StudentCalendarPage'],
  ['app/teacher/(portal)/page.tsx', '@/views/TeacherDashboard', 'TeacherDashboard'],
  ['app/teacher/(portal)/classes/page.tsx', '@/views/mentor/MentorClassesPage', 'MentorClassesPage'],
  ['app/teacher/(portal)/free-courses/page.tsx', '@/views/mentor/MentorFreeCoursesPage', 'MentorFreeCoursesPage'],
  ['app/teacher/(portal)/meet/page.tsx', '@/views/mentor/MentorMeetPage', 'MentorMeetPage'],
  ['app/teacher/(portal)/assignments/page.tsx', '@/views/mentor/MentorAssignmentsPage', 'MentorAssignmentsPage'],
]

function write(file, body) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, body)
}

for (const [file, imp, comp] of pages) {
  write(
    file,
    `'use client'\n\nimport { ${comp} } from '${imp}'\n\nexport default function Page() {\n  return <${comp} />\n}\n`,
  )
}

write(
  'app/student/(portal)/profile/page.tsx',
  `'use client'\n\nimport { PortalProfilePage } from '@/views/profile/PortalProfilePage'\n\nexport default function Page() {\n  return <PortalProfilePage portal="student" />\n}\n`,
)
write(
  'app/teacher/(portal)/profile/page.tsx',
  `'use client'\n\nimport { PortalProfilePage } from '@/views/profile/PortalProfilePage'\n\nexport default function Page() {\n  return <PortalProfilePage portal="teacher" />\n}\n`,
)

console.log('wrote', pages.length + 2, 'pages')

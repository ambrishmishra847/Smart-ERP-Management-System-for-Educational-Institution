import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const outputDir = path.join(__dirname, '..', 'docs');
const outputPath = path.join(outputDir, 'Smart_ERP_Project_Documentation.pdf');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const doc = new PDFDocument({ margin: 50, size: 'A4' });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const addHeading = (text, level = 1) => {
  const sizes = { 1: 20, 2: 16, 3: 14 };
  const spacing = { 1: 20, 2: 16, 3: 12 };
  doc.moveDown(0.8).fontSize(sizes[level]).fillColor('#111827').text(text, { underline: level === 1 });
  doc.moveDown(spacing[level] / 72);
};

const addParagraph = (text) => {
  doc.fontSize(11).fillColor('#111827').text(text, { align: 'left' }).moveDown(0.5);
};

const addList = (items) => {
  items.forEach((item) => {
    doc.fontSize(11).text(`• ${item}`, { indent: 10 }).moveDown(0.1);
  });
  doc.moveDown(0.4);
};

const addCodeBlock = (lines) => {
  doc
    .moveDown(0.4)
    .fontSize(9)
    .fillColor('#111827')
    .text(lines.join('\n'), {
      align: 'left',
      indent: 10,
    })
    .moveDown(0.6);
};

// SECTION 1 — PROJECT OVERVIEW
addHeading('Smart Educational ERP System', 1);
addParagraph(
  'The Smart Educational ERP system is a full-stack MERN application designed for real universities and colleges. ' +
    'It centralizes academic and administrative operations across administrators, teachers, and students, providing ' +
    'a unified control panel for attendance, timetable management, placements, announcements, notifications, and analytics.'
);

addHeading('Modules Included', 2);
addList([
  'Admin Panel – central control for academic structures, users, timetables, placements, announcements, and analytics.',
  'Teacher Panel – teacher dashboard for attendance marking, assignments, study materials, notices, and timetable view.',
  'Student Panel – student dashboard for timetable, attendance, assignments, results, materials, placements, and fees.',
  'Attendance System – daily subject-wise attendance tracking and analytics.',
  'Timetable System – course/semester/section wise timetable with teacher and classroom mapping.',
  'Placement System – placement drives, eligibility, registration tracking, and applied company overview.',
  'Announcements – role-based notices for all/students/teachers.',
  'Notifications – in-app and realtime notifications for key events.',
]);

// SECTION 2 — SYSTEM ARCHITECTURE
addHeading('System Architecture (MERN Stack)', 2);
addParagraph('The ERP follows a classic MERN architecture separated into frontend and backend workspaces:');

addHeading('Frontend', 3);
addList([
  'React – component-based SPA for admin, teacher, and student dashboards.',
  'TailwindCSS – utility-first styling for responsive, modern SaaS-like UI.',
  'Axios – HTTP client used by a thin API service layer for all REST calls.',
]);

addHeading('Backend', 3);
addList([
  'Node.js – runtime for the REST API and WebSocket server.',
  'Express.js – routing, middleware, and REST controller layer.',
]);

addHeading('Database', 3);
addList([
  'MongoDB – primary data store for users, students, teachers, courses, attendance, timetables, placements, notices, and notifications.',
]);

addHeading('Authentication', 3);
addList([
  'JWT + HTTP-only cookies – stateless authentication.',
  'Role-based access – roles: super_admin, teacher, student, enforced via middleware.',
]);

// SECTION 3 — PROJECT FOLDER STRUCTURE
addHeading('Project Folder Structure', 2);
addCodeBlock([
  'backend/',
  '  controllers/',
  '  models/',
  '  routes/',
  '  middleware/',
  '  services/',
  '  scripts/',
  '',
  'frontend/',
  '  src/',
  '    components/',
  '    pages/',
  '    layouts/',
  '    services/',
  '    hooks/',
  '    context/',
]);

// SECTION 4 — CONTROLLER WORKFLOW
addHeading('Controller Workflow', 2);
addParagraph(
  'Each controller follows a similar pattern: validate the request, interact with MongoDB models via Mongoose, ' +
    'and return a JSON response. Authentication and role-based access are enforced by middleware before controllers execute.'
);

addList([
  'Auth Controller – manages login, session validation (/auth/me), and logout using JWT cookies.',
  'Student Controller – CRUD for students and reading student-facing views such as enrolled course.',
  'Teacher Controller – CRUD for teachers and associated user records.',
  'Course Controller – manage academic courses and metadata.',
  'Attendance Controller – mark attendance per student/subject/date, and provide analytics/aggregates.',
  'Placement Controller – create/list/delete placement drives and track student applications.',
  'Announcement (Notice) Controller – create/list/update/delete announcements targeted by role.',
  'Notification Controller – fetch, create, and mark notifications read for each user.',
]);

addParagraph(
  'Typical flow: a protected route applies JWT middleware, then the controller reads req.user, performs ' +
    'the required database operations with Mongoose, and returns a structured JSON object suitable for the React frontend.'
);

// SECTION 5 — DATABASE MODELS
addHeading('Database Models', 2);
addParagraph('Core MongoDB schemas (using Mongoose) include:');
addList([
  'User – base identity (name, email, hashed password, role).',
  'Student – profile linked to User (course, semester, section, enrollment number).',
  'Teacher – profile linked to User (department, subject assignments).',
  'Course – course name and duration.',
  'Subject – subjects mapped to courses.',
  'Attendance – student, subject, date, and status (present/absent/late).',
  'Placement – company, role, eligibility, registration link, deadline, createdBy.',
  'StudentPlacement – link table between Student and Placement to track applications.',
  'Notice (Announcement) – title, description, targetRole, createdBy, date.',
  'Notification – userId, title, message, type, read flag, and optional link.',
  'Timetable – course, semester, section, day/slot, subject, teacher, times, and classroom.',
]);

addParagraph(
  'Relationships are mostly referenced via ObjectId fields (for example Student.userId -> User._id, ' +
    'Timetable.subjectId -> Subject._id, Attendance.studentId -> Student._id). This keeps collections normalized ' +
    'while enabling efficient population of related data in controllers.'
);

// SECTION 6 — API ROUTES
addHeading('API Routes Overview', 2);
addParagraph('Representative endpoints include:');
addList([
  'POST /auth/login – authenticate user and issue JWT cookie.',
  'GET /auth/me – return the current user and profile (student/teacher).',
  'GET /students – list students (admin-only).',
  'POST /attendance – record attendance for a specific student and subject.',
  'GET /placements – list all placement drives.',
  'POST /placements – create a new placement drive (super admin).',
  'GET /notices – list announcements with optional role-based filtering.',
  'POST /notices – create an announcement (super admin / teacher).',
  'GET /notifications – list notifications for the current user.',
  'PATCH /notifications/:id/read – mark a specific notification as read.',
  'GET /dashboard/admin – aggregated admin KPIs, charts, and insights.',
]);

// SECTION 7 — FRONTEND WORKFLOW
addHeading('Frontend Workflow', 2);
addParagraph(
  'React pages (admin/teacher/student dashboards) use custom API services built on Axios to call the backend. ' +
    'Protected routes consult /auth/me to hydrate the authenticated user into local storage, and role-based routing ' +
    'ensures each user sees the appropriate panel. State is managed with React hooks and lightweight contexts ' +
    '(for example, toast notifications and sockets).'
);

// SECTION 8 — REAL TIME FEATURES
addHeading('Realtime Features', 2);
addParagraph(
  'Socket.IO is used to deliver realtime notifications to connected clients. On the server, a Socket.IO Server ' +
    'is attached to the HTTP server; on the client, a shared hook connects and joins user- and role-specific rooms.'
);
addList([
  'Notifications – browser toasts and badge updates when new Notification records are created.',
  'Announcements – “new_announcement” events when an announcement is posted.',
  'Placement alerts – “newPlacement” events when new placement drives are created.',
]);

// SECTION 9 — PACKAGE DEPENDENCIES
addHeading('Key Package Dependencies', 2);
addList([
  'express – HTTP server and routing.',
  'mongoose – MongoDB ODM for schemas and queries.',
  'jsonwebtoken – JWT signing and verification.',
  'bcryptjs – password hashing.',
  'cookie-parser – parse HTTP cookies for JWT sessions.',
  'cors – CORS configuration between frontend and backend.',
  'socket.io – realtime events over WebSockets.',
  'axios – HTTP client in the frontend.',
  'react-icons – icon library used throughout the UI.',
  'recharts – charting library for dashboards and analytics.',
]);

// SECTION 10 — SYSTEM FLOW "DIAGRAMS"
addHeading('System Flow Diagrams (Textual)', 2);
addParagraph('High-level flows (described in text and simple arrows for clarity):');

addHeading('User Login Flow', 3);
addCodeBlock([
  'User -> React Login Page -> POST /auth/login',
  '  -> Auth Controller validates credentials and role',
  '  -> JWT issued in HTTP-only cookie',
  '  -> Frontend stores user profile in local storage',
  '  -> Browser navigates to role-specific dashboard (admin/teacher/student)',
]);

addHeading('Attendance Marking Flow', 3);
addCodeBlock([
  'Teacher -> Attendance Page -> POST /attendance',
  '  -> Attendance Controller validates payload',
  '  -> Attendance document saved (studentId, subjectId, date, status)',
  '  -> Aggregation endpoints power attendance percentages and trends.',
]);

addHeading('Placement Registration Flow', 3);
addCodeBlock([
  'Admin -> Placement Management -> POST /placements',
  '  -> Placement Controller creates Placement',
  '  -> Notifications + Socket.IO events to all students',
  'Student -> Placement Page -> clicks "I Have Applied"',
  '  -> POST /placements/:id/applied',
  '  -> StudentPlacement record created (studentId, placementId).',
]);

addHeading('Announcement Notification Flow', 3);
addCodeBlock([
  'Admin/Teacher -> Announcements Page -> POST /notices',
  '  -> Notice Controller creates Notice',
  '  -> Notification records created per target role',
  '  -> Socket.IO emits "new_announcement" + generic notification event',
  '  -> Frontend updates notification dropdown and shows realtime toasts.',
]);

doc.end();

stream.on('finish', () => {
  // eslint-disable-next-line no-console
  console.log(`Documentation PDF generated at: ${outputPath}`);
});


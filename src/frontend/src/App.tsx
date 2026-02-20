import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
import { useGetCallerUserRole } from './hooks/useGetCallerUserRole';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import OverdueTaskNotificationModal from './components/OverdueTaskNotificationModal';
import FounderDashboard from './pages/FounderDashboard';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import MyTasksPage from './pages/MyTasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskTemplatesPage from './pages/TaskTemplatesPage';
import GanttChartPage from './pages/GanttChartPage';
import WorkloadViewPage from './pages/WorkloadViewPage';
import ReportsPage from './pages/ReportsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AccessDeniedScreen from './components/AccessDeniedScreen';
import { UserRole } from './backend';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {showProfileSetup && <ProfileSetupModal />}
      {isAuthenticated && userProfile && <OverdueTaskNotificationModal />}
    </>
  );
}

function IndexComponent() {
  const { identity } = useInternetIdentity();
  const { data: userRole } = useGetCallerUserRole();
  const { data: userProfile } = useGetCallerUserProfile();

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to Team Task Manager</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          A powerful task management platform for founders to assign tasks, track progress, and manage team productivity.
        </p>
        <p className="text-muted-foreground">Please log in to get started.</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (userRole === UserRole.admin) {
    window.location.hash = '/dashboard';
    return null;
  }

  window.location.hash = '/my-tasks';
  return null;
}

function DashboardComponent() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to access the dashboard." />;
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (userRole !== UserRole.admin) {
    return <AccessDeniedScreen message="Only founders/admins can access the dashboard." />;
  }

  return <FounderDashboard />;
}

function ProjectsComponent() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to access projects." />;
  }

  return <ProjectsPage />;
}

function TasksComponent() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to access tasks." />;
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (userRole !== UserRole.admin) {
    return <AccessDeniedScreen message="Only founders/admins can access all tasks." />;
  }

  return <TasksPage />;
}

function MyTasksComponent() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to access your tasks." />;
  }

  return <MyTasksPage />;
}

function TaskDetailComponent() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to view task details." />;
  }

  return <TaskDetailPage />;
}

function TaskTemplatesComponent() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to access templates." />;
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (userRole !== UserRole.admin) {
    return <AccessDeniedScreen message="Only founders/admins can access templates." />;
  }

  return <TaskTemplatesPage />;
}

function GanttChartComponent() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to view the Gantt chart." />;
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  // Allow both admin and employee users to view Gantt chart
  // Employees will only see their own tasks via the backend filter
  return <GanttChartPage />;
}

function WorkloadViewComponent() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to view workload." />;
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (userRole !== UserRole.admin) {
    return <AccessDeniedScreen message="Only founders/admins can view team workload." />;
  }

  return <WorkloadViewPage />;
}

function ReportsComponent() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to view reports." />;
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (userRole !== UserRole.admin) {
    return <AccessDeniedScreen message="Only founders/admins can view reports." />;
  }

  return <ReportsPage />;
}

function ProfileSettingsComponent() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to access profile settings." />;
  }

  return <ProfileSettingsPage />;
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardComponent,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsComponent,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksComponent,
});

const myTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tasks',
  component: MyTasksComponent,
});

const taskDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/task/$taskId',
  component: TaskDetailComponent,
});

const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates',
  component: TaskTemplatesComponent,
});

const ganttRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gantt',
  component: GanttChartComponent,
});

const workloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workload',
  component: WorkloadViewComponent,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsComponent,
});

const profileSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile-settings',
  component: ProfileSettingsComponent,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  projectsRoute,
  tasksRoute,
  myTasksRoute,
  taskDetailRoute,
  templatesRoute,
  ganttRoute,
  workloadRoute,
  reportsRoute,
  profileSettingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

import { Link, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../hooks/useGetCallerUserRole';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import LoginButton from './LoginButton';
import OverdueNotificationBadge from './OverdueNotificationBadge';
import { RoleType, UserRole } from '../backend';
import { LayoutDashboard, FolderKanban, ListTodo, CheckSquare, FileText, GanttChart, Users, BarChart3, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: userRole } = useGetCallerUserRole();
  const { data: userProfile } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAdmin = userRole === UserRole.admin;
  const isAuthenticated = !!identity;

  // Role-based navigation: Admin users see all features, employees only see their tasks
  const navLinks = [
    ...(isAdmin
      ? [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/projects', label: 'Projects', icon: FolderKanban },
          { path: '/tasks', label: 'All Tasks', icon: ListTodo },
          { path: '/templates', label: 'Templates', icon: FileText },
          { path: '/gantt', label: 'Gantt Chart', icon: GanttChart },
          { path: '/workload', label: 'Team Workload', icon: Users },
          { path: '/reports', label: 'Reports', icon: BarChart3 },
          { path: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
        ]
      : []),
    ...(isAuthenticated && !isAdmin ? [{ path: '/my-tasks', label: 'My Tasks', icon: CheckSquare }] : []),
  ];

  const getRoleTypeBadge = () => {
    if (!userProfile) return null;
    
    if (userProfile.role === 'founder') {
      return (
        <Badge className="ml-2 bg-[oklch(0.65_0.19_85)] hover:bg-[oklch(0.60_0.19_85)] text-white">
          Founder
        </Badge>
      );
    }

    if (userProfile.role === 'employee') {
      if (userProfile.roleType === RoleType.teacher) {
        return (
          <Badge className="ml-2 bg-[oklch(0.60_0.15_220)] hover:bg-[oklch(0.55_0.15_220)] text-white">
            Teacher
          </Badge>
        );
      }
      if (userProfile.roleType === RoleType.admin) {
        return (
          <Badge className="ml-2 bg-[oklch(0.55_0.15_280)] hover:bg-[oklch(0.50_0.15_280)] text-white">
            Admin
          </Badge>
        );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.19_85)] to-[oklch(0.55_0.15_65)] flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">Team Task Manager</h1>
              </Link>
              {isAuthenticated && navLinks.length > 0 && (
                <nav className="hidden lg:flex items-center gap-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentPath === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                          isActive
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && userProfile && (
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Welcome,</span>
                  <span className="font-medium">{userProfile.name}</span>
                  {getRoleTypeBadge()}
                </div>
              )}
              {isAdmin && <OverdueNotificationBadge />}
              {isAuthenticated && (
                <Link
                  to="/profile-settings"
                  className={`p-2 rounded-lg transition-colors ${
                    currentPath === '/profile-settings'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  title="Profile Settings"
                >
                  <UserCircle className="w-5 h-5" />
                </Link>
              )}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Team Task Manager. All rights reserved.</p>
            <p>
              Built with{' '}
              <span className="text-[oklch(0.65_0.19_85)]" aria-label="love">
                ❤️
              </span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

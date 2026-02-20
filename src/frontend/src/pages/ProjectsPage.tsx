import { useGetCallerUserRole } from '../hooks/useGetCallerUserRole';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectList from '../components/ProjectList';
import { UserRole } from '../backend';
import { FolderKanban } from 'lucide-react';

export default function ProjectsPage() {
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === UserRole.admin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-8 h-8 text-[oklch(0.65_0.19_85)]" />
          <h1 className="text-3xl font-bold">Projects</h1>
        </div>
        {isAdmin && <CreateProjectModal />}
      </div>
      <ProjectList />
    </div>
  );
}

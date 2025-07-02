'use client';

import { useProjects } from "./{core}/context/ProjectContext";
import AppLayout from "./{core}/layout/AppLayout";
import ProjectCard from "./{core}/components/ProjectCard";
import NewProjectCard from "./{core}/components/NewProjectCard";

export default function Dashboard() {
  const { projects } = useProjects();

  return (
    <AppLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Video Projects</h1>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-600 mb-4">No projects yet</h2>
            <p className="text-gray-500 mb-6">Create your first video project to get started</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <NewProjectCard />
        </div>
      </div>
    </AppLayout>
  );
}

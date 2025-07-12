'use client';

import { useProjects } from "./{core}/context/ProjectContext";
import AppLayout from "./{core}/layout/AppLayout";
import ProjectCard from "./{core}/components/project/ProjectCard";
import NewProjectCard from "./{core}/components/project/NewProjectCard";
import { Button } from "@heroui/button";

export default function Dashboard() {
  const { projects } = useProjects();

  return (
    <AppLayout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">Projects</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <NewProjectCard />


      <Button color="default">Default</Button>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="danger">Danger</Button>
        </div>
      </div>
    </AppLayout>
  );
}

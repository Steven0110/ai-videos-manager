'use client';

import { useParams } from 'next/navigation';
import { useProjects } from '../../{core}/context/ProjectContext';
import AppLayout from '../../{core}/layout/AppLayout';
import { useEffect, useState } from 'react';
import { Project } from '../../{core}/utils/types';

export default function ProjectStudio() {
  const params = useParams();
  const { projects } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const projectId = params.id as string;

  useEffect(() => {
    const foundProject = projects.find(p => p.id === projectId);
    setProject(foundProject || null);
  }, [projects, projectId]);

  if (!project) {
    return (
      <AppLayout>
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Project Not Found</h1>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <p>The project you are looking for does not exist or has been deleted.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{project.title}</h1>
        </div>
        
        <div className="flex flex-col space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-medium mb-2">Project Details</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
            <div className="text-sm text-gray-500">
              <p>Created: {new Date(project.createdAt).toLocaleString()}</p>
              <p>Last updated: {new Date(project.updatedAt).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-medium mb-4">Video Editor</h2>
              <p className="text-gray-600 dark:text-gray-300">
                This is where the video editing interface will be implemented.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 
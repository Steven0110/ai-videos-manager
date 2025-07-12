'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Project } from '../utils/types';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteProject: (id: string) => void;
}

// Mock data for initial projects
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Product Demo Video',
    description: 'A showcase of our latest product features with professional voiceover and animations.',
    createdAt: '2023-10-15T10:30:00Z',
    updatedAt: '2023-10-18T14:45:00Z',
  },
  {
    id: '2',
    title: 'Company Introduction',
    description: 'Brief overview of our company history, mission, and team members.',
    createdAt: '2023-09-22T08:15:00Z',
    updatedAt: '2023-09-25T16:20:00Z',
  },
  {
    id: '3',
    title: 'Tutorial Series',
    description: 'Step-by-step guide on how to use our software platform effectively.',
    createdAt: '2023-11-05T11:00:00Z',
    updatedAt: '2023-11-10T09:30:00Z',
  },
];

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  const deleteProject = (id: string) => {
    setProjects((prevProjects) => prevProjects.filter(project => project.id !== id));
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}; 
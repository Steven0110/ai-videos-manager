'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Project } from '../utils/types';

interface ProjectContextType {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  studioProject: Project | null;
  setStudioProject: (project: Project) => void;
  addProject: (project: Omit<Project, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => void;
  deleteProject: (id: string) => void;
}

// Empty initial projects array - we'll load from API
const initialProjects: Project[] = [];

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [studioProject, setStudioProject] = useState<Project | null>(null);

  const addProject = (projectData: Omit<Project, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  const deleteProject = (id: string) => setProjects((prevProjects) => prevProjects.filter(project => 
    (project.id !== id && project._id !== id)
  ));

  return (
    <ProjectContext.Provider value={{ projects, studioProject, setProjects, setStudioProject, addProject, deleteProject }}>
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
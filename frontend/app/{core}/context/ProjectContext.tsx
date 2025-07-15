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
    script: '[professional] Our latest product features include... [pause] advanced AI capabilities.',
    scenes: [
      {
        text: 'Our latest product features include advanced AI capabilities.',
        image_prompt: 'Futuristic UI with AI visualization, professional setting',
        video_prompt: 'Product interface with animated AI features, professional lighting'
      }
    ],
    createdAt: '2023-10-15T10:30:00Z',
    updatedAt: '2023-10-18T14:45:00Z',
  },
  {
    id: '2',
    title: 'Company Introduction',
    description: 'Brief overview of our company history, mission, and team members.',
    script: '[friendly] Founded in 2010, our mission is to... [enthusiastic] revolutionize video creation!',
    scenes: [
      {
        text: 'Founded in 2010, our mission is to revolutionize video creation!',
        image_prompt: 'Modern office space with creative team working together',
        video_prompt: 'Pan across modern office with diverse team collaborating'
      }
    ],
    createdAt: '2023-09-22T08:15:00Z',
    updatedAt: '2023-09-25T16:20:00Z',
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
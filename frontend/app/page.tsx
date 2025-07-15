'use client';

import { useProjects } from "./{core}/context/ProjectContext";
import AppLayout from "./{core}/layout/AppLayout";
import ProjectCard from "./{core}/components/project/ProjectCard";
import NewProjectCard from "./{core}/components/project/NewProjectCard";
import { Button } from "@heroui/button";
import { AnimatePresence, motion } from "framer-motion";

export default function Dashboard() {
  const { projects } = useProjects();

  // Create a grid layout that works with AnimatePresence
  const gridItems = [];
  
  // Add project cards
  for (let i = 0; i < projects.length; i++) {
    gridItems.push(
      <motion.div
        key={projects[i].id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <ProjectCard project={projects[i]} />
      </motion.div>
    );
  }
  
  // Add new project card
  gridItems.push(
    <motion.div 
      key="new-project" 
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <NewProjectCard />
    </motion.div>
  );

  return (
    <AppLayout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">Proyectos</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {gridItems}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}

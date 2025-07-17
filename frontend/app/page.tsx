'use client';

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProjects } from "./{core}/context/ProjectContext";
import AppLayout from "./{core}/layout/AppLayout";
import ProjectCard from "./{core}/components/project/ProjectCard";
import NewProjectCard from "./{core}/components/project/NewProjectCard";
import CardLoader from "./{core}/components/loader/CardLoader";
import api from "./{core}/utils/api";
import { Project } from "./{core}/utils/types";

export default function Dashboard() {
  const { projects, setProjects } = useProjects();
  const [isFetching, setIsFetching] = useState(false);
  const [gridItems, setGridItems] = useState<React.ReactNode[]>([]);

  // Fetch projects on component mount
  useEffect(() => {
    if(!isFetching) {
      setIsFetching(true);
      api.get('/project')
        .then(({data: projects}) => {
          if (projects && projects.length > 0) {
            setProjects(projects);
          }
        })
        .catch((error) => {
          console.error("Error fetching projects:", error);
        })
        .finally(() => {
          setIsFetching(false);
        });
        
    }
  }, [setProjects]);

  // Update grid items whenever projects change
  useEffect(() => {
    if (projects && projects.length > 0) {
      const newGridItems = projects.map((project: Project) => (
        <motion.div
          key={project._id || project.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <ProjectCard project={project} />
        </motion.div>
      ));
      
      // Add new project card
      newGridItems.push(
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
      
      setGridItems(newGridItems);
    } else {
      // If no projects, just show the new project card
      setGridItems([
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
      ]);
    }
  }, [projects]);

  return (
    <AppLayout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">Proyectos</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {isFetching ? (
              <>
                <CardLoader />
                <CardLoader />
                <CardLoader />
              </>
            ) : (
              gridItems
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}

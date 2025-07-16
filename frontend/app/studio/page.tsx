'use client';

import { useParams } from 'next/navigation';
import { useProjects } from '../{core}/context/ProjectContext';
import AppLayout from '../{core}/layout/AppLayout';
import { useEffect, useState } from 'react';
import { Project } from '../{core}/utils/types';
import { Input, Textarea } from '@heroui/input';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { addToast } from '@heroui/toast';
import api from '@/{core}/utils/api';
import ContentEditor from '@/{core}/components/studio/ContentEditor';

export default function ProjectStudio() {
  const params = useParams();
  const { studioProject, setStudioProject } = useProjects();
  const [isUpdating, setIsUpdating] = useState(false);
  const [localProject, setLocalProject] = useState<Project>({
    title: '',
    description: '',
    script: '',
    scenes: [],
  });

  const handleUpdateProject = async () => {
    try {
      setIsUpdating(true);

      console.log('Updating project', localProject);

      const { data } = await api.put(`/project/${localProject._id}`, {
        title: localProject.title,
        description: localProject.description,
        script: localProject.script,
      });

      addToast({
        title: 'Proyecto actualizado',
        description: 'El proyecto ha sido actualizado correctamente',
        color: 'success',
      });

      setStudioProject(localProject);
    } catch (error) {
      console.error('Error updating project:', error);

      addToast({
        title: 'Error',
        description: 'Hubo un error al actualizar el proyecto',
        color: 'danger',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (studioProject) {
      // Initialize local state from studioProject when it changes
      setLocalProject(JSON.parse(JSON.stringify(studioProject)));
    }
  }, [studioProject]);

  if (!localProject) {
    return (
      <AppLayout>
        <div className="container p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Proyecto no encontrado</h1>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <p>El proyecto que estás buscando no existe o ha sido eliminado.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">        
        <div className="flex flex-col space-y-6">
          <Card>
            <CardBody>
              <h2 className="text-xl font-medium mb-2">Detalles del proyecto</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{localProject.description}</p>
              
              <Input 
                className="mb-4" 
                value={localProject.title} 
                labelPlacement='outside'
                placeholder='Escribe el título del proyecto'
                label='Título'
                isRequired
                onChange={(e) => {
                  setLocalProject({
                    ...localProject,
                    title: e.target.value,
                  });
                }} 
              />

              <Input 
                value={localProject.description} 
                labelPlacement='outside'
                placeholder='Escribe la descripción del proyecto'
                label='Descripción'
                isRequired
                onChange={(e) => {
                  setLocalProject({
                    ...localProject,
                    description: e.target.value,
                  });
                }} 
              />

              {/* <Textarea
                value={localProject.script}
                labelPlacement='outside'
                placeholder='Escribe el script del proyecto'
                label='Script'
                isRequired
                onChange={(e) => {
                  setLocalProject({
                    ...localProject,
                    script: e.target.value,
                  });
                }}
              /> */}
            
            </CardBody>
            <CardFooter className="flex justify-end">
              <Button 
                color="primary" 
                onPress={handleUpdateProject}
                isLoading={isUpdating}
              >
                Guardar
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <ContentEditor 
            project={localProject} 
            onUpdate={(updatedProject) => setLocalProject(updatedProject)}
          />
        </div>
      </div>
    </AppLayout>
  );
} 
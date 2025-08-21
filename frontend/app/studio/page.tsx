'use client';

import { useParams } from 'next/navigation';
import { useProjects } from '../{core}/context/ProjectContext';
import AppLayout from '../{core}/layout/AppLayout';
import { useEffect, useState } from 'react';
import { Project } from '../{core}/utils/types';
import { Input, Textarea } from '@heroui/input';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/modal';
import { addToast } from '@heroui/toast';
import api, { publishProject } from '@/{core}/utils/api';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import ContentEditor from '@/{core}/components/studio/ContentEditor';
import { downloadProject } from '@/{core}/utils/api';

export default function ProjectStudio() {
  const params = useParams();
  const { studioProject, setStudioProject } = useProjects();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
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



  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const zipUrl = await downloadProject(studioProject?._id || '');
      window.open(zipUrl, '_blank');
      
      addToast({
        title: 'Descarga iniciada',
        description: 'Los archivos del proyecto se están descargando',
        color: 'success',
      });
    } catch (error) {
      console.error('Error downloading project:', error);
      addToast({
        title: 'Error',
        description: 'Error al descargar los archivos del proyecto',
        color: 'danger',
      });
    } finally {
      setIsDownloading(false);
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishProject(studioProject?._id || '');
      addToast({
        title: 'Proyecto publicado',
        description: 'El proyecto ha sido publicado correctamente',
        color: 'success',
      });
      setLocalProject({ ...localProject, isPublished: true });
      setStudioProject({ ...localProject, isPublished: true });
    } catch (error) {
      console.error('Error publishing project:', error);
      addToast({
        title: 'Error',
        description: 'Error al publicar el proyecto',
        color: 'danger',
      });
    } finally {
      setIsPublishing(false);
      onClose();
    }
  };


  useEffect(() => {
    if (studioProject) {
      // Initialize local state from studioProject when it changes
      setLocalProject(JSON.parse(JSON.stringify(studioProject)));
    }
  }, [studioProject]);

  if (!localProject || !studioProject) {
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
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium mb-2">Detalles del proyecto</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="flat" 
                    color="default" 
                    onPress={onOpen}
                    isLoading={isPublishing}
                    isDisabled={Boolean(localProject.isPublished)}
                  >
                    Publicar
                  </Button>
                  <Button 
                    variant="flat" 
                    color="primary" 
                    onPress={handleDownload}
                    isLoading={isDownloading}
                    endContent={<ArrowDownTrayIcon className="w-5 h-5" />}
                    >
                    Descargar
                  </Button>
                </div>
              </div>
              
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader>Publicar proyecto</ModalHeader>
              <ModalBody>
                <p>¿Deseas publicar este proyecto? Podrás revertirlo editando el proyecto.</p>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose} variant="light">Cancelar</Button>
                <Button color="primary" isLoading={isPublishing} onPress={handlePublish}>Publicar</Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </AppLayout>
  );
} 
'use client';

import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Button } from '@heroui/button';
import { addToast } from '@heroui/toast';
import { Project } from '@/{core}/utils/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProjects } from '@/{core}/context/ProjectContext';
import { PencilIcon, TrashIcon, DocumentTextIcon, ArrowDownTrayIcon, SpeakerWaveIcon, PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import api, { downloadProject } from '@/{core}/utils/api';

interface ProjectCardProps {
  project: Project;
}

const MotionCard = motion(Card);

export default function ProjectCard({ project }: ProjectCardProps) {
  const { deleteProject, setStudioProject } = useProjects();
  const formattedDate = new Date(project.updatedAt || '').toLocaleDateString();
  const scenesCount = project.scenes?.length || 0;
  const projectId = project._id || project.id || '';
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isOpen: isScriptOpen, onOpen: onScriptOpen, onClose: onScriptClose} = useDisclosure();

  const isAudioGenerated: boolean = Boolean(project.audioUrl);
  const isImagesGenerated: boolean = (project.scenes?.length || 0) > 0 && (project.scenes || []).every((scene) =>
    Array.isArray(scene.images) && scene.images.length > 0 && scene.images.every((img) => Boolean(img.url)),
  );

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await api.delete(`/project/${projectId}`);
      deleteProject(projectId);

      addToast({
        title: 'Proyecto eliminado',
        description: 'El proyecto ha sido eliminado correctamente',
        color: 'success',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      addToast({
        title: 'Error',
        description: 'Error al eliminar el proyecto',
        color: 'danger',
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const handleEditProject = () => {
    setStudioProject(project);
    router.push(`/studio`);
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const zipUrl = await downloadProject(projectId);
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

  return (
    <MotionCard 
      className="w-full h-full"
      classNames={{ base: 'h-full' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{project.title}</h3>
      </CardHeader>
      <CardBody className="flex-1">
        <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              isAudioGenerated
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {isAudioGenerated ? (
              <CheckCircleIcon className="w-4 h-4" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4" />
            )}
            {isAudioGenerated ? 'Audio listo' : 'Audio pendiente'}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              isImagesGenerated
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {isImagesGenerated ? (
              <CheckCircleIcon className="w-4 h-4" />
            ) : (
              <PhotoIcon className="w-4 h-4" />
            )}
            {isImagesGenerated ? 'Imágenes listas' : 'Imágenes pendientes'}
          </span>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <span className="mr-4">Escenas: {scenesCount}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            color="primary"
            onPress={onScriptOpen}
            startContent={<DocumentTextIcon className="w-4 h-4" />}
          >
            Ver Script
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Última actualización: {formattedDate}</p>
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          color="danger" 
          variant="ghost"
          isIconOnly
          onPress={onOpen}
          isLoading={isDeleting}
        >
          <TrashIcon className="w-5 h-5" />
        </Button>
        <Button
          isIconOnly
          color="secondary"
          variant="ghost"
          onPress={handleDownload}
          isLoading={isDownloading}
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
        </Button>
        <Button
          isIconOnly
          color="primary"
          onPress={() => handleEditProject()}
        >
          <PencilIcon className="w-5 h-5" />
        </Button>
      </CardFooter>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ModalHeader>Eliminar Proyecto</ModalHeader>
              <ModalBody>
                <p>¿Estás seguro de querer eliminar este proyecto? Esta acción no puede ser deshecha.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={handleDelete} isLoading={isDeleting}>Eliminar</Button>
                <Button onPress={onClose}>Cancelar</Button>
              </ModalFooter>
            </motion.div>
          )}
        </ModalContent>
      </Modal>

      {/* Script View Modal */}
      <Modal isOpen={isScriptOpen} onClose={onScriptClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ModalHeader>Script del Proyecto</ModalHeader>
              <ModalBody>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{project.script}</pre>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Escenas ({scenesCount})</h4>
                  <div className="space-y-3">
                    {project.scenes?.map((scene, index) => (
                      <div key={scene._id || index} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                        <p className="font-medium">Escena {index + 1}</p>
                        <p className="text-sm mt-1">{scene.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onScriptClose}>Cerrar</Button>
              </ModalFooter>
            </motion.div>
          )}
        </ModalContent>
      </Modal>
    </MotionCard>
  );
} 
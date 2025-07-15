'use client';

import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Project } from '@/{core}/utils/types';
import Link from 'next/link';
import { useProjects } from '@/{core}/context/ProjectContext';
import { PencilIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
}

const MotionCard = motion(Card);

export default function ProjectCard({ project }: ProjectCardProps) {
  const { deleteProject } = useProjects();
  const formattedDate = new Date(project.updatedAt || '').toLocaleDateString();
  const scenesCount = project.scenes?.length || 0;

  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isOpen: isScriptOpen, onOpen: onScriptOpen, onClose: onScriptClose} = useDisclosure();

  const handleDelete = () => {
    deleteProject(project.id || '');
    onClose();
  };

  return (
    <MotionCard 
      className="w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{project.title}</h3>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <span className="mr-4">Scenes: {scenesCount}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            color="primary"
            onPress={onScriptOpen}
            startContent={<DocumentTextIcon className="w-4 h-4" />}
          >
            View Script
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Last updated: {formattedDate}</p>
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          color="danger" 
          variant="ghost"
          isIconOnly
          onPress={onOpen}
        >
          <TrashIcon className="w-5 h-5" />
        </Button>
        <Link href={`/studio/${project.id}`} passHref>
          <Button
            isIconOnly
            color="primary"
          >
            <PencilIcon className="w-5 h-5" />
          </Button>
        </Link>
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
              <ModalHeader>Delete Project</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this project? This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={handleDelete}>Delete</Button>
                <Button onPress={onClose}>Cancel</Button>
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
              <ModalHeader>Script</ModalHeader>
              <ModalBody>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{project.script}</pre>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Scenes ({scenesCount})</h4>
                  <div className="space-y-3">
                    {project.scenes?.map((scene, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                        <p className="font-medium">Scene {index + 1}</p>
                        <p className="text-sm mt-1">{scene.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onScriptClose}>Close</Button>
              </ModalFooter>
            </motion.div>
          )}
        </ModalContent>
      </Modal>
    </MotionCard>
  );
} 
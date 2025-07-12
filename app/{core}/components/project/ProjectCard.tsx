'use client';

import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Project } from '@/{core}/utils/types';
import Link from 'next/link';
import { useProjects } from '@/{core}/context/ProjectContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
}

const MotionCard = motion(Card);

export default function ProjectCard({ project }: ProjectCardProps) {
  const { deleteProject } = useProjects();
  const formattedDate = new Date(project.updatedAt).toLocaleDateString();

  const {isOpen, onOpen, onClose} = useDisclosure();

  const handleDelete = () => {
    deleteProject(project.id);
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
    </MotionCard>
  );
} 
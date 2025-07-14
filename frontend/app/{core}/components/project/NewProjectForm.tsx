'use client';

import { useState } from 'react';
import { 
  Input,
  Textarea
} from '@heroui/input';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { useProjects } from '@/{core}/context/ProjectContext';
import { motion } from 'framer-motion';

interface NewProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewProjectForm({ isOpen, onClose }: NewProjectFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { addProject } = useProjects();

  const handleSubmit = () => {
    if (title.trim()) {
      addProject({
        title: title.trim(),
        description: description.trim(),
      });
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      backdrop="blur"
      size="md"
    >
      <ModalContent>
        {(onClose) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ModalHeader>Create New Project</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Project Title"
                  placeholder="Enter project title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  isRequired
                  autoFocus
                />
                <Textarea
                  label="Description"
                  placeholder="Enter project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleSubmit}>
                Create Project
              </Button>
            </ModalFooter>
          </motion.div>
        )}
      </ModalContent>
    </Modal>
  );
} 
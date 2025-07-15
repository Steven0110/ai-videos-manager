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
import api from '@/{core}/utils/api';
import { Project } from '@/{core}/utils/types';

interface NewProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function NewProjectForm({ isOpen, onClose }: NewProjectFormProps) {
  const [config, setConfig] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addProject } = useProjects();

  const handleSubmit = async () => {
    if (config.length > 0) {
      setError('');
      setIsLoading(true);

      try {
        // Validate JSON format
        let projectData: Project;
        try {
          projectData = JSON.parse(config.trim());
        } catch (e) {
          setError('Invalid JSON format. Please check your input.');
          setIsLoading(false);
          return;
        }

        // Basic validation
        if (!projectData.title || !projectData.description || !projectData.script || !Array.isArray(projectData.scenes)) {
          setError('Missing required fields: title, description, script, or scenes');
          setIsLoading(false);
          return;
        }

        // Validate scenes
        if (projectData.scenes.length === 0) {
          setError('At least one scene is required');
          setIsLoading(false);
          return;
        }

        for (const scene of projectData.scenes) {
          if (!scene.text || !scene.imagePrompt || !scene.videoPrompt) {
            setError('Each scene must have text, imagePrompt, and videoPrompt');
            setIsLoading(false);
            return;
          }
        }

        const response = await api.post('/create-project', {
          project: projectData,
        });

        if (response.data.error) {
          setError(response.data.error);
          return;
        }

        // Add the project to the context
        // addProject({
        //   title: projectData.title,
        //   description: projectData.description,
        //   script: projectData.script,
        //   scenes: projectData.scenes,
        // });
        
        onClose();
      } catch (error: any) {
        console.error(error);
        setError(`Error creating project: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Configuration JSON cannot be empty');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      backdrop="blur"
      size="2xl"
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
                <p className="text-sm text-gray-500">
                  Enter your project configuration in JSON format. Make sure to include all required fields.
                </p>
                <Textarea
                  label="Configuration JSON"
                  placeholder="Paste your configuration JSON here"
                  value={config}
                  onChange={(e) => setConfig(e.target.value)}
                  minRows={15}
                />
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="ghost" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit} isLoading={isLoading}>
                Create Project
              </Button>
            </ModalFooter>
          </motion.div>
        )}
      </ModalContent>
    </Modal>
  );
} 
'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [sceneCount, setSceneCount] = useState<number | null>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const { addProject } = useProjects();

  useEffect(() => {
    if (config) {
      try {
        const projectData = JSON.parse(config.trim());
        if (projectData && Array.isArray(projectData.scenes)) {
          setSceneCount(projectData.scenes.length);
          return;
        }
      } catch (e) {
        // Silently fail if JSON is invalid
      }
    }
    setSceneCount(null);
  }, [config]);

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

        const { data } = await api.post('/project', {
          project: projectData,
        });

        if (data.project) {
          addProject(data.project);
        }
        
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

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            try {
              // Try to format the JSON nicely
              const jsonObj = JSON.parse(event.target.result as string);
              setConfig(JSON.stringify(jsonObj, null, 2));
              setError('');
            } catch (err) {
              // If parsing fails, just use the raw text
              setConfig(event.target?.result as string);
            }
          }
        };
        reader.readAsText(file);
      } else {
        setError('Solo se permiten archivos JSON');
      }
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
            <ModalHeader>Crear Nuevo Proyecto</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Copia y pega el JSON de tu proyecto en el siguiente campo o arrastra y suelta un archivo JSON.
                </p>
                <div 
                  ref={dropAreaRef}
                  className={`relative rounded-md transition-colors ${isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Textarea
                    label="JSON del Proyecto"
                    placeholder="Pega el JSON de tu proyecto aquí o arrastra un archivo .json"
                    value={config}
                    onChange={(e) => setConfig(e.target.value)}
                    minRows={15}
                  />
                  {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-80 rounded-md pointer-events-none">
                      <p className="text-blue-600 font-medium">Suelta el archivo JSON aquí</p>
                    </div>
                  )}
                </div>
                {sceneCount !== null && (
                  <div className="flex items-center mt-2">
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                      {sceneCount} {sceneCount === 1 ? 'escena detectada' : 'escenas detectadas'}
                    </div>
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="ghost" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSubmit} isLoading={isLoading}>
                Crear Proyecto
              </Button>
            </ModalFooter>
          </motion.div>
        )}
      </ModalContent>
    </Modal>
  );
} 
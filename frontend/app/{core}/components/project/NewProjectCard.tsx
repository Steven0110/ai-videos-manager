'use client';

import { useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import NewProjectForm from './NewProjectForm';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export default function NewProjectCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    console.log('Opening modal');
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
  };

  return (
    <>
      <MotionCard 
        className="w-full h-full min-h-[200px] border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div onClick={handleOpenModal} className="w-full h-full">
          <CardBody className="flex flex-col items-center justify-center">
            <div className="rounded-full bg-primary-100 p-3 mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-primary-500"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Crear Nuevo Proyecto</h3>
            <p className="text-gray-500 text-center mt-2">Haz click para crear un nuevo proyecto de video</p>
          </CardBody>
        </div>
      </MotionCard>

      <NewProjectForm 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
} 
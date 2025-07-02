'use client';

import { useState } from 'react';
import { Card, CardBody } from '@heroui/react';
import NewProjectForm from './NewProjectForm';

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
      <Card 
        className="w-full h-full min-h-[200px] border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        onClick={handleOpenModal}
      >
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
          <h3 className="text-xl font-semibold">Create New Project</h3>
          <p className="text-gray-500 text-center mt-2">Click to create a new video project</p>
        </CardBody>
      </Card>

      <NewProjectForm 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
} 
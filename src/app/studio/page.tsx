'use client';

import AppLayout from "../{core}/layout/AppLayout";

export default function Studio() {
  return (
    <AppLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Studio</h1>
        </div>
        
        <div className="flex items-center justify-center h-[50vh] bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-medium mb-4">Video Studio</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This is where projects will be edited. Coming soon.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 
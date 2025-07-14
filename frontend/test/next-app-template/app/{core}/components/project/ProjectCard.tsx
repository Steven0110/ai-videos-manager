'use client';

import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Project } from '@/{core}/utils/types';
import Link from 'next/link';
import { useProjects } from '@/{core}/context/ProjectContext';
import { TrashIcon } from '@heroicons/react/24/solid'

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { deleteProject } = useProjects();
  const formattedDate = new Date(project.updatedAt).toLocaleDateString();

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{project.title}</h3>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
        <p className="text-sm text-gray-500 mt-2">Last updated: {formattedDate}</p>
      </CardBody>
      <CardFooter className="flex justify-end">
        <Link href={`/studio/${project.id}`} passHref>
          <Button
            isIconOnly
            color="success"
          >
            <TrashIcon className="w-5 h-5" />
          </Button>
        </Link>
        <Button 
          color="danger" 
          variant="ghost" 
          onPress={() => deleteProject(project.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
} 
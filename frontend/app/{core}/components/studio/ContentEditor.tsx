import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Project } from '@/{core}/utils/types';
import ScriptEditor from './ScriptEditor';
import { CheckIcon } from '@heroicons/react/24/solid';
import ImagesEditor from './ImagesEditor';

interface ContentEditorProps {
    project: Project;
    onUpdate?: (updatedProject: Project) => void;
}

export default function ContentEditor({ project, onUpdate }: ContentEditorProps) {
    const [script, setScript] = useState(project.script || '');
    const [activeSection, setActiveSection] = useState<string>('script');
    
    useEffect(() => {
        setScript(project.script || '');
    }, [project.script]);

    const handleScriptChange = (newScript: string) => {
        setScript(newScript);
        
        if (onUpdate) {
            onUpdate({
                ...project,
                script: newScript,
            });
        }
    };

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? '' : section);
    };

    return (
        <div className="flex w-full flex-col mt-4 gap-4">
            {/* Script Section */}
            <Card 
                className={`overflow-hidden ${activeSection === 'script' ? 'border-primary-500 shadow-md' : 'border-primary-500 border-opacity-50 shadow-sm'}`}
            >
                <CardHeader 
                    className={`cursor-pointer text-white ${project.audioUrl ? 'bg-success-300' : 'bg-warning-300'}`}
                    onClick={() => toggleSection('script')}
                >
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">Guión</h3>
                            {project.audioUrl && <CheckIcon className="w-5 h-5" />}
                        </div>
                        <Button 
                            isIconOnly 
                            variant="light" 
                            className="text-white"
                        >
                            {activeSection === 'script' ? '−' : '+'}
                        </Button>
                    </div>
                </CardHeader>
                {activeSection === 'script' && (
                    <CardBody>
                        <ScriptEditor
                            projectId={project._id || ''}
                            script={script}
                            audioUrl={project.audioUrl}
                            onScriptChange={handleScriptChange}
                        />
                    </CardBody>
                )}
            </Card>

            {/* Images Section */}
            <Card 
                className={`overflow-hidden ${activeSection === 'images' ? 'border-secondary-500 shadow-md' : 'border-secondary-500 border-opacity-50 shadow-sm'}`}
            >
                <CardHeader 
                    className="cursor-pointer bg-warning-300 text-white"
                    onClick={() => toggleSection('images')}
                >
                    <div className="flex justify-between items-center w-full">
                        <h3 className="text-lg font-medium">Imágenes</h3>
                        <Button 
                            isIconOnly 
                            variant="light" 
                            className="text-white"
                        >
                            {activeSection === 'images' ? '−' : '+'}
                        </Button>
                    </div>
                </CardHeader>
                {activeSection === 'images' && (
                    <CardBody>
                        <ImagesEditor
                            projectId={project._id || ''}
                            scenes={project.scenes}
                        />
                    </CardBody>
                )}
            </Card>

            {/* Videos Section */}
            <Card 
                className={`overflow-hidden ${activeSection === 'videos' ? 'border-success-500 shadow-md' : 'border-success-500 border-opacity-50 shadow-sm'}`}
            >
                <CardHeader 
                    className="cursor-pointer bg-warning-300 text-white"
                    onClick={() => toggleSection('videos')}
                >
                    <div className="flex justify-between items-center w-full">
                        <h3 className="text-lg font-medium">Videos</h3>
                        <Button 
                            isIconOnly 
                            variant="light" 
                            className="text-white"
                        >
                            {activeSection === 'videos' ? '−' : '+'}
                        </Button>
                    </div>
                </CardHeader>
                {activeSection === 'videos' && (
                    <CardBody>
                        Videos
                    </CardBody>
                )}
            </Card>
        </div>
    );
}
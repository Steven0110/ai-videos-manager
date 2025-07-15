import { Tabs, Tab } from '@heroui/tabs';
import { Card, CardBody } from '@heroui/card';
import { Textarea } from '@heroui/input';
import { useState, useEffect } from 'react';
import { Project } from '@/{core}/utils/types';
import ScriptEditor from './ScriptEditor';

interface ContentEditorProps {
    project: Project;
    onUpdate?: (updatedProject: Project) => void;
}

export default function ContentEditor({ project, onUpdate }: ContentEditorProps) {
    const [script, setScript] = useState(project.script || '');
    
    useEffect(() => {
        setScript(project.script || '');
    }, [project.script]);

    const handleScriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newScript = e.target.value;
        setScript(newScript);
        
        if (onUpdate) {
            onUpdate({
                ...project,
                script: newScript,
            });
        }
    };

    return (
        <div className="flex w-full flex-col mt-4">
            <Card>
                <CardBody>
                    <Tabs aria-label="Options">
                        <Tab key="script" title="Script">
                            <ScriptEditor
                                projectId={project._id || ''}
                                script={project.script || ''}
                            />
                        </Tab>
                        <Tab key="images" title="Imágenes">
                            Photos
                        </Tab>
                        <Tab key="videos" title="Videos">
                            Videos
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>
            
        </div>
    );
}
import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { CheckIcon, PlusIcon, MinusIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { Project } from '@/{core}/utils/types';
import ScriptEditor from './ScriptEditor';
import ImagesEditor from './ImagesEditor';
import VideosEditor from './VideosEditor';
import { Tooltip } from '@heroui/tooltip';
import { addToast } from '@heroui/toast';

type SectionType = 'script' | 'images' | 'videos' | 'social' | '';

interface ContentEditorProps {
  project: Project;
  onUpdate?: (updatedProject: Project) => void;
}

interface SectionProps {
  id: SectionType;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  borderColor: string;
  gradientClass: string;
  toggleSection: (section: SectionType) => void;
  children: React.ReactNode;
}

export default function ContentEditor({ project, onUpdate }: ContentEditorProps) {
  const [script, setScript] = useState(project.script || '');
  const [activeSection, setActiveSection] = useState<SectionType>('script');
  const [areImagesCompleted, setAreImagesCompleted] = useState(project.scenes.length > 0);
  
  useEffect(() => {
    setScript(project.script || '');
    const scenesWithEmptyImages = project.scenes.find((scene) => scene.images.length === 0);
    setAreImagesCompleted(scenesWithEmptyImages === undefined);
  }, [project]);

  const handleScriptChange = (newScript: string) => {
    setScript(newScript);
    
    if (onUpdate) {
      onUpdate({
        ...project,
        script: newScript,
      });
    }
  };

  const toggleSection = (section: SectionType) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    
    addToast({
      title: 'Copiado al portapapeles',
      description: 'La descripción se ha copiado al portapapeles',
      color: 'success',
    });
  };

  // Extracted Section component for better organization
  const Section = ({
    id,
    title,
    isActive,
    isCompleted,
    borderColor,
    gradientClass,
    toggleSection,
    children,
  }: SectionProps) => (
    <Card 
      className={`overflow-hidden ${isActive ? `border-${borderColor} shadow-md` : `border-${borderColor} border-opacity-50 shadow-sm`}`}
    >
      <CardHeader 
        className={`cursor-pointer text-white ${gradientClass}`}
        onClick={() => toggleSection(id)}
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{title}</h3>
            {isCompleted && <CheckIcon className="w-5 h-5" />}
          </div>
          <Button 
            isIconOnly 
            variant="flat" 
            className="text-white"
            onPress={() => toggleSection(id)}
            endContent={isActive ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
          />
        </div>
      </CardHeader>
      {isActive && (
        <CardBody>
          {children}
        </CardBody>
      )}
    </Card>
  );

  return (
    <div className="flex w-full flex-col mt-4 gap-4">
      {/* Script Section */}
      <Section
        id="script"
        title="Guión"
        isActive={activeSection === 'script'}
        isCompleted={!!project.audioUrl}
        borderColor="primary-500"
        gradientClass={project.audioUrl ? 'bg-success-gradient' : 'bg-warning-gradient'}
        toggleSection={toggleSection}
      >
        <ScriptEditor
          projectId={project._id || ''}
          script={script}
          audioUrl={project.audioUrl}
          onScriptChange={handleScriptChange}
        />
      </Section>

      {/* Images Section */}
      <Section
        id="images"
        title="Imágenes"
        isActive={activeSection === 'images'}
        isCompleted={areImagesCompleted}
        borderColor="secondary-500"
        gradientClass={areImagesCompleted ? 'bg-success-gradient' : 'bg-warning-gradient'}
        toggleSection={toggleSection}
      >
        <ImagesEditor
          projectId={project._id || ''}
          scenes={project.scenes}
        />
      </Section>

      {/* Videos Section */}
      <Section
        id="videos"
        title="Videos"
        isActive={activeSection === 'videos'}
        isCompleted={false}
        borderColor="success-500"
        gradientClass="bg-warning-gradient"
        toggleSection={toggleSection}
      >
        <VideosEditor
          projectId={project._id || ''}
          scenes={project.scenes}
        />
      </Section>

      {/* Social Network Descriptions Section */}
      <Section
        id="social"
        title="Descripciones para Redes Sociales"
        isActive={activeSection === 'social'}
        isCompleted={!!(project.facebookDescription || project.instagramDescription || project.tiktokDescription || project.youtubeDescription)}
        borderColor="info-500"
        gradientClass="bg-info-gradient"
        toggleSection={toggleSection}
      >
        <div className="flex flex-col gap-4">
          {project.facebookDescription && (
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-blue-400 font-semibold">Facebook</h4>
                <Tooltip content="Copiar descripción">
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="flat" 
                    color="primary"
                    onPress={() => copyToClipboard(project.facebookDescription || '')}
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  </Button>
                </Tooltip>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{project.facebookDescription}</p>
            </div>
          )}

          {project.instagramDescription && (
            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700/50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-purple-400 font-semibold">Instagram</h4>
                <Tooltip content="Copiar descripción">
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="flat" 
                    color="secondary"
                    onPress={() => copyToClipboard(project.instagramDescription || '')}
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  </Button>
                </Tooltip>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{project.instagramDescription}</p>
            </div>
          )}

          {project.tiktokDescription && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-gray-300 font-semibold">TikTok</h4>
                <Tooltip content="Copiar descripción">
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="flat" 
                    color="default"
                    onPress={() => copyToClipboard(project.tiktokDescription || '')}
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  </Button>
                </Tooltip>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{project.tiktokDescription}</p>
            </div>
          )}

          {project.youtubeDescription && (
            <div className="bg-red-900/30 p-4 rounded-lg border border-red-700/50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-red-400 font-semibold">YouTube</h4>
                <Tooltip content="Copiar descripción">
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="flat" 
                    color="danger"
                    onPress={() => copyToClipboard(project.youtubeDescription || '')}
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  </Button>
                </Tooltip>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{project.youtubeDescription}</p>
            </div>
          )}

          {!project.facebookDescription && !project.instagramDescription && 
           !project.tiktokDescription && !project.youtubeDescription && (
            <div className="text-center p-6 text-gray-400">
              No hay descripciones para redes sociales disponibles para este proyecto.
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
import { Scene } from "@/{core}/utils/types";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { PhotoIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import ReactImageGallery from "react-image-gallery";
import api from "@/{core}/utils/api";
import "react-image-gallery/styles/css/image-gallery.css";
import { useProjects } from '@/{core}/context/ProjectContext';
import { addToast } from "@heroui/toast";


interface VideosEditorProps {
    projectId: string;
    scenes: Scene[];
}

export default function VideosEditor({ projectId, scenes: initialScenes }: VideosEditorProps) {
    const [scenes, setScenes] = useState<Scene[]>(initialScenes);
    const [isGenerateAllModalOpen, setIsGenerateAllModalOpen] = useState(false);
    const [isRegenerateAllModalOpen, setIsRegenerateAllModalOpen] = useState(false);
    const [loadingScenes, setLoadingScenes] = useState<Set<number>>(new Set());
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(-1);
    const { setStudioProject } = useProjects();
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // Update local scenes when props change
    useEffect(() => {
        setScenes(initialScenes);
    }, [initialScenes]);

    return (
        <div>
            <div className="flex flex-row gap-2 items-center w-full whitespace-nowrap justify-end">
                <Button
                    className="w-fit"
                    color="primary"
                    endContent={<PhotoIcon className="w-4 h-4" />}
                    onPress={() => setIsGenerateAllModalOpen(true)}
                    isLoading={isGeneratingAll}
                    isDisabled={isGeneratingAll || loadingScenes.size > 0}
                >
                    {isGeneratingAll ? "Generando..." : "Generar todo"}
                </Button>
            </div>
            {Array.from({ length: scenes.length }).map((scene, index) => (
                <Card key={index} className="mt-4">
                    <CardHeader>
                        <h1>Escena {index + 1}</h1>
                    </CardHeader>
                    <CardBody>
                        <div className="flex flex-row gap-4 items-center">
                            <div className="w-full flex flex-col gap-4">
                                <Textarea
                                    label="Prompt"
                                    placeholder="Write the text for the video"
                                    isDisabled={scenes[index].videoGenerationStatus === 'requested'}
                                    value={scenes[index].videoPrompt}
                                    onChange={(e) => {
                                        const updatedScenes = [...scenes];
                                        updatedScenes[index].videoPrompt = e.target.value;
                                        setScenes(updatedScenes);
                                    }}
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    )
}
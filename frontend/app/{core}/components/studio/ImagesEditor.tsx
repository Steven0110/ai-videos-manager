import { Scene } from "@/{core}/utils/types";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { PhotoIcon, ArrowPathIcon, DocumentDuplicateIcon } from "@heroicons/react/24/solid";
import ReactImageGallery from "react-image-gallery";
import api from "@/{core}/utils/api";
import "react-image-gallery/styles/css/image-gallery.css";
import { useProjects } from '@/{core}/context/ProjectContext';
import { addToast } from "@heroui/toast";


interface ImagesEditorProps {
    projectId: string;
    scenes: Scene[];
}

export default function ImagesEditor({ projectId, scenes: initialScenes }: ImagesEditorProps) {
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
    
    const checkForPendingScenes = useCallback((currentScenes: Scene[]) => {
        return currentScenes.some(scene => scene.imageGenerationStatus === 'requested');
    }, []);
    
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            console.log('Stopping polling - no more pending scenes');
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);
    
    const startPolling = useCallback(() => {
        if (!pollingIntervalRef.current) {
            console.log('Starting polling - found pending scenes');
            pollingIntervalRef.current = setInterval(async () => {
                try {
                    console.log('Polling for project updates...');
                    const response = await api.get(`/project/${projectId}`);
                    const updatedProject = response.data.project;
                    
                    if (updatedProject.scenes) {
                        const hasPendingScenes = updatedProject.scenes.some(
                            (scene: Scene) => scene.imageGenerationStatus === 'requested'
                        );
                        
                        console.log('Received project update. Pending scenes:', hasPendingScenes);
                        
                        // Update both states
                        setStudioProject(updatedProject);
                        setScenes(updatedProject.scenes);
                        
                        // If no more pending scenes, stop polling
                        if (!hasPendingScenes) {
                            stopPolling();
                        }
                    }
                } catch (error) {
                    console.error("Error fetching project updates:", error);
                }
            }, 5000);
        }
    }, [projectId, setStudioProject, stopPolling]);

    useEffect(() => {
        const hasPendingScenes = checkForPendingScenes(scenes);
        
        if (hasPendingScenes) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
        };
    }, [scenes, startPolling, stopPolling, checkForPendingScenes]);

    const handleCompleteGeneration = async () => {
        try {
            setIsGenerateAllModalOpen(false);
            setIsGeneratingAll(true);
            
            // Get all pending scenes
            const pendingScenes = scenes.filter((scene) => scene.imageGenerationStatus === 'pending');
            
            // Take only the first 10 pending scenes
            const scenesToGenerate = pendingScenes.slice(0, 10);
            
            // Set only the selected scenes to loading state
            const sceneIndices = scenesToGenerate.map((scene) => 
                scenes.findIndex((s) => s === scene)
            ).filter((index) => index !== -1);
            
            setLoadingScenes(new Set(sceneIndices));
            
            const response = await api.post(`/project/${projectId}/images`, {
                scenes: scenesToGenerate,
            });

            setStudioProject(response.data.project);
            // Update the local scenes state with the updated scenes from the response
            setScenes(response.data.project.scenes);
            
            // Show appropriate message based on remaining scenes
            const remainingScenes = pendingScenes.length - scenesToGenerate.length;
            if (remainingScenes > 0) {
                addToast({
                    title: "Generación parcial completada",
                    description: `Se han enviado ${scenesToGenerate.length} escenas para generación. Quedan ${remainingScenes} escenas pendientes.`,
                    color: "success",
                });
            } else {
                addToast({
                    title: "Generación completada",
                    description: "Todas las escenas han sido enviadas para generación de imágenes.",
                    color: "success",
                });
            }
            
        } catch (error: any) {
            console.error("Error generating all images:", error);
            addToast({
                title: "Error al generar todas las imagenes",
                description: error.response?.data?.message || "Error desconocido",
                color: "danger",
            });
        } finally {
            setLoadingScenes(new Set());
            setIsGeneratingAll(false);
        }
    }
    
    const handleSingleSceneImageGeneration = async (scene: Scene, index: number) => {
        try {
            setLoadingScenes(prev => new Set(prev).add(index));
            
            const response = await api.post(`/project/${projectId}/images`, {
                scenes: [scene],
            });

            setStudioProject(response.data.project);
            // Update the local scenes state with the updated scenes from the response
            setScenes(response.data.project.scenes);

            if (response.data.errors && response.data.errors.length > 0) {
                addToast({
                    title: "Se encontraron errores al generar las imagenes:",
                    description: response.data.errors.join(", "),
                    color: "warning",
                });
            } else {
                addToast({
                    title: "Solicitud generada correctamente",
                    description: "Las imagenes se están generando",
                    color: "success",
                });
            }
            
        } catch (error: any) {
            console.error("Error generating image:", error);
            addToast({
                title: "Error al generar la imagen",
                description: error.response?.data?.message || "Error desconocido",
                color: "danger",
            });
        } finally {
            setLoadingScenes(prev => {
                const updated = new Set(prev);
                updated.delete(index);
                return updated;
            });
        }
    }

    const openRegenerateModal = (index: number) => {
        setCurrentSceneIndex(index);
        setIsRegenerateAllModalOpen(true);
    };

    const handleRegenerateImage = () => {
        if (currentSceneIndex >= 0 && currentSceneIndex < scenes.length) {
            handleSingleSceneImageGeneration(scenes[currentSceneIndex], currentSceneIndex);
            setIsRegenerateAllModalOpen(false);
        }
    };

    const copyVideoPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt).then(() => {
            addToast({
                title: "Copiado",
                description: "Prompt de video copiado al portapapeles",
                color: "success",
            });
        }).catch(err => {
            console.error('Error al copiar: ', err);
            addToast({
                title: "Error",
                description: "No se pudo copiar el prompt al portapapeles",
                color: "danger",
            });
        });
    };

    // Check if there are any pending scenes that can be generated
    const hasPendingScenesForGeneration = scenes.some(scene => scene.imageGenerationStatus === 'pending');

    return (
        <div>
            <div className="flex flex-row gap-2 items-center w-full whitespace-nowrap justify-end">
                <Button
                    className="w-fit"
                    color="primary"
                    endContent={<PhotoIcon className="w-4 h-4" />}
                    onPress={() => setIsGenerateAllModalOpen(true)}
                    isLoading={isGeneratingAll}
                    isDisabled={isGeneratingAll || loadingScenes.size > 0 || !hasPendingScenesForGeneration}
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
                                    placeholder="Write the text for the image"
                                    isDisabled={scenes[index].imageGenerationStatus === 'requested'}
                                    value={scenes[index].imagePrompt}
                                    onChange={(e) => {
                                        const updatedScenes = [...scenes];
                                        updatedScenes[index].imagePrompt = e.target.value;
                                        setScenes(updatedScenes);
                                    }}
                                />
                                <div className="relative">
                                    <Textarea
                                        label="Prompt de video relacionado"
                                        placeholder="Prompt del video relacionado a esta imagen"
                                        isReadOnly
                                        value={scenes[index].videoPrompt || ""}
                                    />
                                    {scenes[index].videoPrompt && (
                                        <Button 
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-0 right-0 mt-1 mr-1"
                                            onPress={() => copyVideoPrompt(scenes[index].videoPrompt || "")}
                                        >
                                            <DocumentDuplicateIcon className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex flex-row gap-4">

                                    {scenes[index].imageGenerationStatus === 'pending' &&
                                        <Button
                                            className="w-full"
                                            color="secondary"
                                            endContent={<PhotoIcon className="w-4 h-4" />}
                                            onPress={() => handleSingleSceneImageGeneration(scenes[index], index)}
                                            isLoading={loadingScenes.has(index)}
                                            isDisabled={loadingScenes.has(index) || isGeneratingAll }
                                        >
                                            {loadingScenes.has(index) ? "Generando..." : "Generar imagen"}
                                        </Button>
                                    }

                                    {scenes[index].imageGenerationStatus === 'requested' &&
                                        <Button
                                            className="w-full"
                                            variant="ghost"
                                            color="primary"
                                            onPress={() => handleSingleSceneImageGeneration(scenes[index], index)}
                                            isLoading={true}
                                        >
                                            En proceso de generación...
                                        </Button>
                                    }
                                    
                                    {scenes[index].imageGenerationStatus === 'completed' &&
                                        <Button
                                            className="w-full"
                                            color="primary"
                                            endContent={<PhotoIcon className="w-4 h-4" />}
                                            onPress={() => openRegenerateModal(index)}
                                            isLoading={loadingScenes.has(index)}
                                            isDisabled={loadingScenes.has(index) || isGeneratingAll }
                                        >
                                            {loadingScenes.has(index) ? "Generando..." : "Volver a generar imagenes"}
                                        </Button>
                                    }
                                </div>
                            </div>
                            {scenes[index]?.imageGenerationStatus === 'completed' && scenes[index]?.images?.length > 0 &&
                                <div className="w-[33%]">
                                    <ReactImageGallery 
                                        items={scenes[index]?.images?.map((image) => ({
                                            original: image.url,
                                            thumbnail: image.url,
                                        }))} 
                                        showThumbnails={false}
                                        autoPlay={true}
                                    />
                                </div>
                            }
                        </div>
                    </CardBody>
                </Card>
            ))}

            <Modal isOpen={isGenerateAllModalOpen} onOpenChange={setIsGenerateAllModalOpen}>
                <ModalContent>
                    <ModalHeader>
                        <h1>¿Deseas generar todo?</h1>
                    </ModalHeader>
                    <ModalBody>
                        <p>
                            Esto generará las imagenes para todas las escenas que no tengan imagenes generadas o no tengan imagenes en proceso, y podría tener un consumo de créditos muy alto.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="ghost" onPress={() => setIsGenerateAllModalOpen(false)}>Cancelar</Button>
                        <Button 
                            color="primary" 
                            onPress={handleCompleteGeneration}
                            isDisabled={isGeneratingAll || loadingScenes.size > 0}
                        >
                            Generar todo
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isRegenerateAllModalOpen} onOpenChange={setIsRegenerateAllModalOpen}>
                <ModalContent>
                    <ModalHeader>
                        <h1>¿Deseas volver a generar imagenes?</h1>
                    </ModalHeader>
                    <ModalBody>
                        <p>
                            Esto no borrará las imagenes existentes y agregará nuevas imagenes a la escena.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="ghost" onPress={() => setIsRegenerateAllModalOpen(false)}>Cancelar</Button>
                        <Button 
                            color="primary" 
                            onPress={handleRegenerateImage}
                            isDisabled={isGeneratingAll || loadingScenes.size > 0}
                        >
                            Generar imagenes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}
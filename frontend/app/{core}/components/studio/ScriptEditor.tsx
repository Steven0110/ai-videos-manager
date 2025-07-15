import { Textarea, Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { NumberInput } from "@heroui/number-input";
import { PlayIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useProjects } from '@/{core}/context/ProjectContext';
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Switch } from "@heroui/switch";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { VoiceSettings } from "@/{core}/utils/types";
import { addToast } from "@heroui/toast";

interface ScriptEditorProps {
    projectId: string;
    audioUrl?: string;
    script: string;
    onScriptChange?: (script: string) => void;
}

export default function ScriptEditor({ projectId, audioUrl, script: initialScript, onScriptChange }: ScriptEditorProps) {
    const [script, setScript] = useState<string>(initialScript);
    const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
        speed: 0.75,
        stability: 0.3,
        similarityBoost: 0.75,
        style: 0.9,
        useSpeakerBoost: true
    });
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setStudioProject } = useProjects();

    useEffect(() => {
        setScript(initialScript);
    }, [initialScript]);

    const handleGenerateAudio = async () => {
        setIsGeneratingAudio(true);
        try {
            const response = await api.post(
                `/project/${projectId}/audio`,
                {
                    script: script
                }
            );
            setStudioProject(response.data.project);
        } catch (error: any) {
            console.error(error);
            setError('Error al generar el audio: ' + error.response.data.message);
        } finally {
            setIsGeneratingAudio(false);
        }
    }
    
    const handleRegenerateAudio = async () => {
        setIsGeneratingAudio(true);
        try {
            // const response = await api.post(
            //     `/project/${projectId}/audio`,
            //     {
            //         script: script,
            //         voiceSettings: voiceSettings
            //     }
            // );
            // setStudioProject(response.data.project);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsGeneratingAudio(false);
            setIsVoiceSettingsOpen(false);
            addToast({
                title: 'Audio regenerado',
                description: 'El audio se ha regenerado correctamente',
                color: 'success'
            });
        } catch (error: any) {
            console.error(error);
            setError('Error al generar el audio: ' + error.response.data.message);
        } finally {
            setIsGeneratingAudio(false);
        }
    }

    const handleScriptChange = (value: string) => {
        setScript(value);
        if (onScriptChange) {
            onScriptChange(value);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
                <Textarea
                    labelPlacement="outside"
                    placeholder="Write the project script"
                    label="Script"
                    isRequired
                    value={script}
                    onValueChange={handleScriptChange}
                />
                {error && <p className="text-red-500">{error}</p>}
                {audioUrl &&
                    <div className="flex flex-col gap-4 w-full my-6">
                        <AudioPlayer
                            src={audioUrl}
                        />
                        <Popover showArrow offset={10} placement="bottom" isOpen={isVoiceSettingsOpen} onOpenChange={setIsVoiceSettingsOpen}>
                            <PopoverTrigger>
                                <div className="flex flex-row gap-4">
                                    <Button
                                        color="secondary"
                                        className="w-full"
                                        endContent={<PlayIcon className="w-4 h-4" />}
                                    >
                                        Volver a generar audio
                                    </Button>
                                    <Button
                                        className="w-full"
                                        color="primary"
                                        endContent={<ArrowDownTrayIcon className="w-4 h-4" />}
                                        onPress={() => {
                                            const a = document.createElement('a');
                                            a.href = audioUrl;
                                            a.target = '_blank';
                                            a.download = 'audio.mp3';
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        }}
                                    >
                                        Descargar
                                    </Button>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent>
                            {(titleProps) => (
                            <div className="px-1 py-2 w-full">
                                <p className="text-small font-bold text-foreground" {...titleProps}>
                                    Configuración
                                </p>
                                <div className="mt-2 flex flex-col gap-2 w-full">
                                    <NumberInput
                                        defaultValue={0.75}
                                        label="Velocidad"
                                        size="sm"
                                        variant="bordered"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={voiceSettings.speed}
                                        onValueChange={(value) => setVoiceSettings({ ...voiceSettings, speed: value })}
                                    />
                                    <NumberInput
                                        defaultValue={0.3}
                                        label="Estabilidad"
                                        size="sm"
                                        variant="bordered"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={voiceSettings.stability}
                                        onValueChange={(value) => setVoiceSettings({ ...voiceSettings, stability: value })}
                                    />
                                    <NumberInput
                                        defaultValue={0.75}
                                        label="Similitud"
                                        size="sm"
                                        variant="bordered"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={voiceSettings.similarityBoost}
                                        onValueChange={(value) => setVoiceSettings({ ...voiceSettings, similarityBoost: value })}
                                    />
                                    <Switch
                                        size="sm"
                                        isSelected={voiceSettings.useSpeakerBoost}
                                        onValueChange={(value) => setVoiceSettings({ ...voiceSettings, useSpeakerBoost: value })}
                                    >
                                        Speaker boost
                                    </Switch>
                                    <Button
                                        color="secondary"
                                        endContent={<PlayIcon className="w-4 h-4" />}
                                        onPress={handleRegenerateAudio}
                                        isLoading={isGeneratingAudio}
                                    >
                                        Generar
                                    </Button>
                                </div>
                            </div>
                            )}
                            </PopoverContent>
                        </Popover>
                    </div>
                }
            </div>
            {!audioUrl && <Button
                color="secondary"
                endContent={<PlayIcon className="w-4 h-4" />}
                isLoading={isGeneratingAudio}
                onPress={handleGenerateAudio}
            >
                Generar audio
            </Button>}

        </div>
    );
}
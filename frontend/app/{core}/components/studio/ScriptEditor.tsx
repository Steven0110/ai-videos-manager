import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { PlayIcon, ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Switch } from "@heroui/switch";
import { Tooltip } from "@heroui/tooltip";
import { Slider } from "@heroui/slider";
import { addToast } from "@heroui/toast";

import api from "../../utils/api";
import { useProjects } from '@/{core}/context/ProjectContext';
import { VoiceSettings } from "@/{core}/utils/types";

interface ScriptEditorProps {
    projectId: string;
    audioUrl?: string;
    script: string;
    onScriptChange?: (script: string) => void;
}

export default function ScriptEditor({ 
    projectId, 
    audioUrl, 
    script: initialScript, 
    onScriptChange 
}: ScriptEditorProps) {
    const [script, setScript] = useState<string>(initialScript);
    const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
        speed: 0.75,
        stability: 0.3,
        similarityBoost: 0.75,
        style: 0.9,
        useSpeakerBoost: true,
    });
    
    const { setStudioProject } = useProjects();

    // Effects
    useEffect(() => {
        setScript(initialScript);
    }, [initialScript]);

    // Handlers
    const handleScriptChange = (value: string) => {
        setScript(value);
        if (onScriptChange) {
            onScriptChange(value);
        }
    };

    const handleGenerateAudio = async (): Promise<void> => {
        setIsGeneratingAudio(true);
        try {
            const response = await api.post(
                `/project/${projectId}/audio`,
                {
                    script: script,
                }
            );
            setStudioProject(response.data.project);
        } catch (error: any) {
            console.error(error);
            setError('Error generating audio: ' + error.response.data.message);
        } finally {
            setIsGeneratingAudio(false);
        }
    };
    
    const handleRegenerateAudio = async (): Promise<void> => {
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
                title: 'Audio regenerated',
                description: 'The audio has been successfully regenerated',
                color: 'success',
            });
        } catch (error: any) {
            console.error(error);
            setError('Error generating audio: ' + error.response.data.message);
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const handleRestoreVoiceSettings = (): void => {
        setVoiceSettings({
            speed: 0.75,
            stability: 0.3,
            similarityBoost: 0.75,
            style: 0.9,
            useSpeakerBoost: true,
        });
    };
    
    const handleDownloadAudio = (): void => {
        if (!audioUrl) return;
        
        const a = document.createElement('a');
        a.href = audioUrl;
        a.target = '_blank';
        a.download = 'audio.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Render helpers
    const renderVoiceSettings = () => (
        <div className="px-1 py-2 w-full">
            <p className="text-small font-bold text-foreground flex flex-row gap-2 justify-between items-center">
                Settings
                <Tooltip content="Restore default values">
                    <Button 
                        isIconOnly 
                        color="primary" 
                        variant="light" 
                        size="sm" 
                        onPress={handleRestoreVoiceSettings}
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                    </Button>
                </Tooltip>
            </p>
            <div className="mt-2 flex flex-col gap-2 w-full">
                <Slider
                    label="Speed"
                    size="sm"
                    step={0.01}
                    minValue={0}
                    maxValue={1}
                    defaultValue={0.75}
                    value={voiceSettings.speed}
                    onChange={(value) => setVoiceSettings({ 
                        ...voiceSettings, 
                        speed: Array.isArray(value) ? value[0] : value 
                    })}
                    className="max-w-md"
                />
                <Slider
                    label="Stability"
                    size="sm"
                    step={0.01}
                    minValue={0}
                    maxValue={1}
                    defaultValue={0.3}
                    value={voiceSettings.stability}
                    onChange={(value) => setVoiceSettings({ 
                        ...voiceSettings, 
                        stability: Array.isArray(value) ? value[0] : value 
                    })}
                    className="max-w-md"
                />
                <Slider
                    label="Similarity"
                    size="sm"
                    step={0.01}
                    minValue={0}
                    maxValue={1}
                    defaultValue={0.75}
                    value={voiceSettings.similarityBoost}
                    onChange={(value) => setVoiceSettings({ 
                        ...voiceSettings, 
                        similarityBoost: Array.isArray(value) ? value[0] : value 
                    })}
                    className="max-w-md"
                />
                <Switch
                    size="sm"
                    isSelected={voiceSettings.useSpeakerBoost}
                    onValueChange={(value) => setVoiceSettings({ 
                        ...voiceSettings, 
                        useSpeakerBoost: value 
                    })}
                >
                    Speaker boost
                </Switch>
                <Button
                    color="secondary"
                    endContent={<PlayIcon className="w-4 h-4" />}
                    onPress={handleRegenerateAudio}
                    isLoading={isGeneratingAudio}
                >
                    Generate
                </Button>
            </div>
        </div>
    );

    const renderAudioControls = () => (
        <div className="flex flex-col gap-4 w-full my-6">
            <AudioPlayer src={audioUrl} />

            <div className="flex flex-row gap-4">
                <Popover 
                    showArrow 
                    offset={10} 
                    placement="bottom" 
                    isOpen={isVoiceSettingsOpen} 
                    onOpenChange={setIsVoiceSettingsOpen}
                >
                    <PopoverTrigger>
                        <Button
                            color="secondary"
                            className="w-full"
                            endContent={<ArrowPathIcon className="w-4 h-4" />}
                        >
                            Regenerate audio
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        {renderVoiceSettings}
                    </PopoverContent>
                </Popover>
                
                <Button
                    className="w-full"
                    color="primary"
                    endContent={<ArrowDownTrayIcon className="w-4 h-4" />}
                    onPress={handleDownloadAudio}
                >
                    Download
                </Button>
            </div>
        </div>
    );

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

                {audioUrl && renderAudioControls()}
            </div>
            
            {!audioUrl && (
                <Button
                    color="secondary"
                    endContent={<PlayIcon className="w-4 h-4" />}
                    isLoading={isGeneratingAudio}
                    onPress={handleGenerateAudio}
                >
                    Generate audio
                </Button>
            )}
        </div>
    );
}
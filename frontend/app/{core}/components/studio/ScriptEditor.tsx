import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

interface ScriptEditorProps {
    projectId: string;
    script: string;
}

export default function ScriptEditor({ projectId, script }: ScriptEditorProps) {1

    const handleScriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newScript = e.target.value;
    }
    return (
        <div className="flex flex-col gap-4">
            <Textarea
                labelPlacement="outside"
                placeholder="Write the project script"
                label="Script"
                isRequired
                value={script}
                onChange={handleScriptChange}
            />
            <Button
                color="secondary"
                endContent={<PlayIcon className="w-4 h-4" />}
            >
                Generar audio
            </Button>
        </div>
    );
}
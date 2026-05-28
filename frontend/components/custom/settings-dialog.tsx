"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpinnerIcon } from "@phosphor-icons/react";

interface GeminiModel {
  id: string;
  name: string;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, saveSettings, isLoaded } = useSettings();
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-1.5-pro");
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<GeminiModel[]>([
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-2.0-pro", name: "Gemini 2.0 Pro" },
  ]);

  useEffect(() => {
    if (isLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApiKey(settings.llmApiKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModel(settings.llmModelName);
    }
  }, [settings, isLoaded, open]);

  useEffect(() => {
    if (!apiKey || apiKey.length < 10) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingModels(true);
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        if (res.ok) {
          const data = await res.json();
          const fetchedModels: GeminiModel[] = data.models
            .filter((m: { supportedGenerationMethods?: string[] }) =>
              m.supportedGenerationMethods?.includes("generateContent")
            )
            .map((m: { name: string; displayName?: string }) => ({
              id: m.name.replace("models/", ""),
              name: m.displayName || m.name,
            }));

          if (fetchedModels.length > 0) {
            setAvailableModels(fetchedModels);
            setModel((prev) =>
              fetchedModels.some((m) => m.id === prev) ? prev : fetchedModels[0].id
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch models", err);
      } finally {
        setIsFetchingModels(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [apiKey]);

  const handleSave = () => {
    saveSettings({
      llmApiKey: apiKey,
      llmModelName: model,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>LLM Settings</DialogTitle>
          <DialogDescription>
            Configure your Gemini API key and preferred model. These will be used for assignment
            generation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter Gemini API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {isFetchingModels ? (
                  <div className="flex items-center justify-center p-2 text-muted-foreground text-sm gap-2">
                    <SpinnerIcon className="animate-spin" /> Fetching models...
                  </div>
                ) : (
                  availableModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            className="rounded-xl inset-shadow-sm inset-shadow-white"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

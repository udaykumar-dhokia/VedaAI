import { useState, useEffect } from "react";

export interface Settings {
  llmApiKey: string;
  llmModelName: string;
}

const DEFAULT_SETTINGS: Settings = {
  llmApiKey: "",
  llmModelName: "gemini-1.5-pro",
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("veda_ai_settings");
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem("veda_ai_settings", JSON.stringify(newSettings));
  };

  return { settings, saveSettings, isLoaded };
}

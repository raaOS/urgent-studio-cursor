export interface Settings {
  darkMode: boolean;
  language: string;
}

let settings: Settings = {
  darkMode: false,
  language: "en",
};

export function updateSettings(newSettings: Partial<Settings>): void {
  settings = { ...settings, ...newSettings };
}

export function getSettings(): Settings {
  return settings;
}
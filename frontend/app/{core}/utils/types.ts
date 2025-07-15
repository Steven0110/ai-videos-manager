export interface Scene {
  text: string;
  imagePrompt: string;
  videoPrompt: string;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  script: string;
  scenes: Scene[];
  createdAt?: string;
  updatedAt?: string;
} 
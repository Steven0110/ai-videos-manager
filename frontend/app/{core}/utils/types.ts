export interface Image {
  _id?: string;
  sceneId?: string;
  prompt: string;
  status: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Video {
  _id?: string;
  sceneId?: string;
  prompt: string;
  status: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Scene {
  _id?: string;
  projectId?: string;
  index?: number;
  text: string;
  imagePrompt?: string;
  videoPrompt?: string;
  image?: Image;
  video?: Video;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id?: string;
  _id?: string; // MongoDB ID from backend
  title: string;
  description: string;
  script: string;
  scenes: Scene[];
  createdAt?: string;
  updatedAt?: string;
} 
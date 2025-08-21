export interface Image {
  _id?: string;
  sceneId?: string;
  id?: string;
  url: string;
  createdAt?: string;
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
  imageGenerationStatus: string;
  videoGenerationStatus: string;
  images: Image[];
  videos: Video[];
  createdAt?: string;
  updatedAt?: string;
}

export interface VoiceSettings {
  speed: number;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

export interface Project {
  id?: string;
  _id?: string; // MongoDB ID from backend
  title: string;
  description: string;
  script: string;
  audioUrl?: string;
  facebookDescription?: string;
  instagramDescription?: string;
  tiktokDescription?: string;
  youtubeDescription?: string;
  scenes: Scene[];
  createdAt?: string;
  updatedAt?: string;
  isPublished?: boolean;
} 
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface Model3DData {
  objContent: string;
  fileName: string;
}

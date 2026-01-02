
export interface ProjectFile {
  path: string;
  content: string;
}

export interface FileSystem {
  [path: string]: string;
}

export interface Iteration {
  id: string;
  prompt: string;
  description: string;
  files: FileSystem;
  timestamp: number;
}

export interface AIResponse {
  description: string;
  files: FileSystem;
}

export enum Tab {
  CODE = 'CODE',
  PREVIEW = 'PREVIEW'
}

export interface AuthUser {
  id: string;
  email: string;
}

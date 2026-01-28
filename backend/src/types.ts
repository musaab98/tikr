export interface Audio {
  id: string;
  filename: string;
  originalName: string;
  duration: number;
  createdAt: string;
}

export interface Loop {
  id: string;
  audioId: string;
  start: number;
  end: number;
  label: string;
}

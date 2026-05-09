export interface IElectronAPI {
  openPDF: () => Promise<{ canceled: boolean; filePath?: string; fileName?: string; data?: number[] }>;
  savePDF: (data: number[], filePath?: string) => Promise<{ canceled: boolean; filePath?: string }>;
  saveAsPDF: (data: number[]) => Promise<{ canceled: boolean; filePath?: string }>;
  exportAs: (data: number[], format: string) => Promise<{ canceled: boolean; filePath?: string }>;
  getVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}

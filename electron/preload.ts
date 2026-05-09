import { contextBridge, ipcRenderer } from 'electron';

export interface IElectronAPI {
  openPDF: () => Promise<{ canceled: boolean; filePath?: string; fileName?: string; data?: number[] }>;
  savePDF: (data: number[], filePath?: string) => Promise<{ canceled: boolean; filePath?: string }>;
  saveAsPDF: (data: number[]) => Promise<{ canceled: boolean; filePath?: string }>;
  exportAs: (data: number[], format: string) => Promise<{ canceled: boolean; filePath?: string }>;
  getVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
}

const api: IElectronAPI = {
  openPDF: () => ipcRenderer.invoke('pdf:open'),
  savePDF: (data, filePath) => ipcRenderer.invoke('pdf:save', data, filePath),
  saveAsPDF: (data) => ipcRenderer.invoke('pdf:saveAs', data),
  exportAs: (data, format) => ipcRenderer.invoke('pdf:exportAs', data, format),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
};

contextBridge.exposeInMainWorld('electronAPI', api);

// Global type declaration must be in a separate .d.ts file or at the bottom

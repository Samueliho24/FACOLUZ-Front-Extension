// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('env', {
    getBackendAddress: async () => {
        return await ipcRenderer.invoke('get_Backend_Address')
    }
})

contextBridge.exposeInMainWorld('api', {
    getDailyReport: () => ipcRenderer.invoke('getDailyReport')
})
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendQuery: (query) => ipcRenderer.send('user-query', query),
    onResponse: (callback) => ipcRenderer.on('bot-response', (event, response) => callback(response))
});

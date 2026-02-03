const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  searchRecords: (term) => ipcRenderer.invoke('search-records', term),
  saveRecord: (record) => ipcRenderer.invoke('save-record', record),
});
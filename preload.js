const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // You can add secure APIs here later!
});

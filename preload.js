// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Exponemos un objeto 'electronAPI' en la ventana de forma segura
contextBridge.exposeInMainWorld('electronAPI', {
  // Para el formulario de reclamaciones
  enviarReclamo: (formData) => ipcRenderer.send('enviar-reclamo', formData),
  onReclamoRespuesta: (callback) => ipcRenderer.on('reclamo-respuesta', (_event, value) => callback(value)),

  // --- NUEVO: Para enviar el pedido con PDF adjunto ---
  enviarPedidoConPDF: (pedidoData) => ipcRenderer.send('enviar-pedido-con-pdf', pedidoData),
  onPedidoConPDFRespuesta: (callback) => ipcRenderer.on('pedido-con-pdf-respuesta', (_event, value) => callback(value))
});

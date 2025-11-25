const { app, BrowserWindow, Menu, ipcMain, net } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'images/icono.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Recommended security practice
      contextIsolation: true // Recommended security practice
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // --- Create Custom Menu ---
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { role: 'quit', label: 'Exit' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Optional: Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Escucha el evento 'enviar-reclamo' desde la ventana
ipcMain.on('enviar-reclamo', (event, formData) => {
  // Estos son tus datos de EmailJS
  const emailJsData = {
    service_id: 'service_xkwibgh', // <-- Tu Service ID
    template_id: 'template_ccrgsoc', // <-- Tu Template ID
    user_id: 'IWkVmJYRmPovjcSJR',   // <-- Pega tu Clave Pública aquí
    accessToken: 'g4pFe6M8e6RuzbTClgu_R', // <-- ¡IMPORTANTE! Pega tu Clave Privada aquí
    template_params: formData      // Los datos del formulario
  };

  const jsonEmailData = JSON.stringify(emailJsData);

  // Hacemos la petición HTTP como lo haría un servidor
  const request = net.request({
    method: 'POST',
    url: 'https://api.emailjs.com/api/v1.0/email/send',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  request.on('response', (response) => {
    // Si la respuesta es exitosa (código 200), enviamos una respuesta de éxito a la ventana
    if (response.statusCode === 200) {
      event.sender.send('reclamo-respuesta', { success: true });
    } else {
      // Si falla, enviamos una respuesta de error
      console.error(`Error en la API de EmailJS: ${response.statusCode}`);
      event.sender.send('reclamo-respuesta', { success: false, status: response.statusCode });
    }
  });

  request.on('error', (error) => {
    console.error(`Error de red al enviar el reclamo: ${error}`);
    event.sender.send('reclamo-respuesta', { success: false, error: error.message });
  });

  // Escribimos los datos en el cuerpo de la petición y la finalizamos
  request.write(jsonEmailData);
  request.end();
});

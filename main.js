const { app, BrowserWindow } = require('electron');

const captureScreenshot = require('./src/scripts/UserRegistrar.js')

isDev = true

function createWindow () {

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile('./src/pages/index.html')


    if (isDev) {
        win.webContents.openDevTools()
    }

    win.once('ready-to-show', () => {
        win.show()
    })
}

app.whenReady().then(() => {
    createWindow()
 
})
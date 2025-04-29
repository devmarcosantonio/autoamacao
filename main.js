const { app, BrowserWindow, ipcMain } = require('electron');

const UserRegistrar = require('./src/scripts/UserRegistrar.js')

isDev = false

function createWindow () {

    const win = new BrowserWindow({
        width: 1000,
        height: 800,
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

    ipcMain.on('start-automation', async (event, arg) => {
        console.log("Iniciando automação...")
        const { dadosExcel, usuario,  senha} = arg
        const registrar = new UserRegistrar(dadosExcel)
        await registrar.init();
        win.webContents.send('status', 'Automação iniciada com sucesso!')
        win.webContents.send('status', 'Tentando realizar login...')
        await registrar.login('https://mipi.equatorialenergia.com.br/Usuarios', usuario, senha);
        win.webContents.send('status', 'Login realizado com sucesso!')
        win.webContents.send('status', 'Abrindo módulo de cadastro de usuários!')
        // await registrar.navigateToRegistrationPage('https://mipi.equatorialenergia.com.br/Usuarios');
        win.webContents.send('status', 'Analisando usuários...')
        win.webContents.send('status', 'Iniciando cadastro...')
        await registrar.openRegistrationModal();
        await registrar.registerAllUsers(win);
        setTimeout(async () => {
            win.webContents.send('status', 'Rotina encerrada!')
            await registrar.close();
          
        }, 5000)
    }) 
}

app.whenReady().then(() => {
    createWindow()
 
})


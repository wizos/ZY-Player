'use strict'

import { app, ipcMain, protocol, BrowserWindow } from 'electron'
import {
  createProtocol
  // installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let mini

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  win = new BrowserWindow({
    width: 1680,
    height: 720,
    frame: false,
    resizable: true,
    transparent: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

function createMini () {
  mini = new BrowserWindow({
    width: 1140,
    height: 360,
    frame: false,
    resizable: true,
    transparent: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    mini.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'mini')
    if (!process.env.IS_TEST) mini.webContents.openDevTools()
  } else {
    mini.loadURL('app://./mini.html')
  }

  mini.on('closed', () => {
    mini = null
  })
}

app.allowRendererProcessReuse = true

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
  if (mini === null) {
    createMini()
  }
})

ipcMain.on('min', () => {
  win.minimize()
})
ipcMain.on('close', () => {
  win.close()
})
ipcMain.on('top', () => {
  if (win) {
    if (win.isAlwaysOnTop()) {
      win.setAlwaysOnTop(false)
    } else {
      win.setAlwaysOnTop(true)
    }
  }
})
ipcMain.on('checkTop', (e) => {
  if (win.isAlwaysOnTop()) {
    e.sender.send('isTop', true)
  } else {
    e.sender.send('isTop', false)
  }
})

ipcMain.on('mini', () => {
  createMini()
})

app.on('ready', async () => {
  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    createProtocol('app')
  }
  createWindow()
  createMini()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
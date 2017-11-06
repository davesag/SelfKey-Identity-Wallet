function createWindow(app, next) {
    return function () {
        app.win = new app.modules.electron.BrowserWindow({
            width: 1000,
            height: 800,
            minWidth: 1000,
            minHeight: 800,
            webPreferences: {
                devTools: app.config.app.debug,
                preload: app.modules.path.join(app.dir.desktopApp, 'preload.js')
            },
            icon: app.modules.path.join(app.dir.root, 'assets/icons/png/256x256.png')
        });

        // If DEV loads electron source files from 'src' folder instead of 'dist' folder
        const loadPath = app.config.DEV ? 'wallet-web-app/dist' : 'wallet-web-app/src';

        app.win.loadURL(app.modules.url.format({
            pathname: app.modules.path.join(app.dir.root, loadPath, 'index.html'),
            protocol: 'file:',
            slashes: true
        }));

        if(app.config.app.debug){
            app.win.webContents.openDevTools();
        }
        
        app.win.on('closed', () => {
            app.win = null
        });

        app.win.webContents.on('did-finish-load', () => {
            app.win.webContents.send('ON_READY');
        });

        next();
    }
}

module.exports = {
    run: function (app, next) {
        app.modules.electron.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.modules.electron.app.quit()
            }
        });

        app.modules.electron.app.on('activate', () => {
            if (app.modules.electron.app.win === null) {
                createWindow(next)
            }
        });
        
        app.modules.electron.app.on('ready', createWindow(app, next));
    }
};
const { app, BrowserWindow, Tray, Menu, Protocol } = require('electron');
var electron = require("electron"), cp = require("child_process");
var path = require('path'), fs = require("fs"), url = require('url'), path = require('path'), os = require("os"), systempreferences = electron.systemPreferences;
var blur = require("electron-vibrancy");
var mainwindow;
var userdata = app.getPath("userData");
var autoUpdater = require("electron-updater").autoUpdater;
autoUpdater.autoDownload = false;

var autoupdatersendevents = ["update-available", "update-not-available", "update-downloaded", "error", "checking-for-update"];

autoupdatersendevents.forEach((ev) =>
{
    autoUpdater.on(ev, () =>
    {
        if (mainwindow)
            mainwindow.webContents.send("asynchronous-reply", JSON.stringify({ type: "autoupdater", data: { type: ev, args: [] } }));
    });
});

var alreadyrunning = app.makeSingleInstance(function (commandLine, workingDirectory)
{
    if (commandLine.length == 2)
    {
        if (commandLine[1].toLowerCase().indexOf("displayus://") === 0)
        {
            onprotcall(commandLine[1].split("displayus://").join(""));
        }
    }
    if (mainwindow)
    {
        if (mainwindow.isMinimized())
            mainwindow.restore();
        mainwindow.show();
    }
    return true;
});

if (alreadyrunning)
{
    app.isQuiting = true;
    app.quit();
    return;
}

var arr_datasentcb = [];
function ondatasent(cb)
{
    arr_datasentcb.push(cb);
}
var mousepos = { x: undefined, y: undefined }, desktopmousein = false;
function mouseondesktop(mouseondesktop)
{
    if (desktopmousein != mouseondesktop)
    {
        walls.concat(previewwalls).forEach(function (wall)
        {
            if (wall.apptype == "js")
                wall.window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "mouseondesktop", args: [mouseondesktop] } }));
            else
                if (wall.apptype == "cs")
                    wall.cp.stdin.write(JSON.stringify({ type: "event", data: { type: "mouseondesktop", args: [mouseondesktop] } }) + "\n");
        });

        desktopmousein = mouseondesktop;
    }
}

function keyevent(event, key)
{
    [].concat(previewwalls[0] ? previewwalls : walls).forEach(function (wall)
    {
        if (wall.apptype == "js")
            wall.window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "keyevent", args: [event, key] } }));
        else
            if (wall.apptype == "cs")
                wall.cp.stdin.write(JSON.stringify({ type: "event", data: { type: "keyevent", args: [event, key] } }) + "\n");
    });
}
function getwindowtype(obj)
{
    var classname = obj.class, title = obj.title;
    if ((classname == "Progman" || classname == "WorkerW" || classname == "SysListView32") && (title == "FolderView"))
        return "desktop";
    else
        return "other";
}
function mouseposchange(x, y)
{
    if (mainwindow)
        mainwindow.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "mousemove", args: [x, y] } }));
    [].concat(previewwalls[0] ? previewwalls : walls).forEach(function (wall)
    {
        if (wall.apptype == "js")
            wall.window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "mousemove", args: [x, y] } }));
        else
            if (wall.apptype == "cs")
                wall.cp.stdin.write(JSON.stringify({ type: "event", data: { type: "mousemove", args: [x, y] } }) + "\n");
    });
    mousepos.x = x;
    mousepos.y = y;
}
function mouseevent(button, type)
{
    if (mainwindow)
        mainwindow.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "mouseevent", args: [button, type] } }));
    [].concat(previewwalls[0] ? previewwalls : walls).forEach(function (wall)
    {
        if (wall.apptype == "js")
            wall.window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "mouseevent", args: [button, type] } }));
        else
            if (wall.apptype == "cs")
                wall.cp.stdin.write(JSON.stringify({ type: "event", data: { type: "mouseevent", args: [button, type] } }) + "\n");
    });
}

function onprotcall(cmd)
{
    mainwindow.send("asynchronous-reply", JSON.stringify({ type: "protocolcall", data: { command: cmd } }));
}

//https://stackoverflow.com/a/34356351
function bytesToHex(bytes)
{
    for (var hex = [], i = 0; i < bytes.length; i++)
    {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

function handlehexfromwindow(window)
{
    return bytesToHex(Array.from(window.getNativeWindowHandle()).reverse().splice(4, 4));
}

var previewwalls = [];

function newwall(arg)
{

    var title = "displayus" + (Math.random() * Math.pow(10, 16)).toFixed(0);

    var bwopts = {
        title: title, frame: false, kiosk: true, show: false, taskbar: false, skipTaskbar: true, webPreferences: {
            preload: __dirname + "\\displayus.js"/*displayusscript+";displayus.plugin='"+arg.data.plugin+"';displayus.item="+JSON.stringify(arg.data.item)+";"*/
        }
    };
    if (arg.data.bw)
    {
        var setopts = Object.keys(arg.data.bw);

        setopts.forEach((opt) =>
        {
            bwopts[opt] = arg.data.bw[opt];
        });
    }
    if (systempreferences.isAeroGlassEnabled())
    {
        bwopts.transparent = true;
    }
    if (arg.data.plugin === "test")
    {
        bwopts.kiosk = false;
        bwopts.parent = walls[0];
        bwopts.modal = true;
    }
    var newwall = new BrowserWindow(bwopts);
    newwall.loadURL(url.format({ pathname: path.join(arg.data.path), protocol: 'file:', slashes: true }));
    setTimeout(function ()
    {
        newwall.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "loaded", args: [(arg.data.preview ? "wallpaperpreview" + arg.data.previewtype : "wallpaper")] } }));
    }, 50);

    //newwall.webContents.executeJavaScript("displayus.plugin='" + arg.data.plugin + "';")
    newwall.webContents.item = arg.data.item;
    newwall.webContents.title = title;
    newwall.webContents.window = newwall;
    newwall.webContents.plugin = arg.data.plugin;
    newwall.webContents.previewtype = arg.data.previewtype;
    (function (title, window)
    {
        window.on("ready-to-show", () =>
        {
            if (arg.data.plugin !== "test")
            {
                socketobj["setasbackgroundbyhandlehex"] = handlehexfromwindow(window);
                senddata();
            }
            else
                setTimeout(() =>
                {
                    socketobj["setasbackgroundbyhandlehex"] = handlehexfromwindow(window);
                    senddata();
                }, 2000);


            window.show();
        });
    })(title, newwall);

    if (arg.data.preview)
        previewwalls.push({ window: newwall, plugin: arg.data.plugin, item: arg.data.item, apptype: "js", preview: true, renderstatus: { reasonsnotto: [], isrendering: true } });
    else
        walls.push({ window: newwall, plugin: arg.data.plugin, item: arg.data.item, apptype: "js", renderstatus: { reasonsnotto: [], isrendering: true } });
    activated = true;
}

function closewalls()
{
    for (var i = 0; i < walls.length; i++)
    {
        if (walls[i].apptype == "js")
        {
            try { walls[i].window.close(); } catch (e) { }
            walls[i].window = null;
            walls.splice(i, 1);
        }
        else
            if (walls[i].apptype == "cs")
            {
                walls[i].cp.stdin.write(JSON.stringify({ type: "cmd", data: { type: "exit" } }) + "\n");
                walls.splice(i, 1);
            }
    }
}
function sendcurrentpointing(pointing)
{
    mainwindow.send("asynchronous-reply", JSON.stringify({ type: "currentpointerpointing", data: { pointing: pointing } }));
}
var cswalls = [];
function newcswall(args)
{
    var title = "displayus" + (Math.random() * Math.pow(10, 16)).toFixed(0);
    var cppluginsharp = cp.spawn(args.data.path, [title], { maxBuffer: 1000 * 1000 * 1000 });
    cppluginsharp.stdin.setEncoding('utf-8');
    cppluginsharp.stdout.on('data', function (data)
    {
        data = JSON.parse(data);
        switch (data.type)
        {
            case "event":
                switch (data.data.type)
                {
                    case "loaded":
                        if (walls[0])
                        {
                            walls[0].window.close();
                            walls[0].window = null;
                            walls.splice(0, 1);
                        }
                        socketobj["setasbackground"] = title;
                        senddata();
                        walls.push({ cp: cppluginsharp, plugin: args.data.plugin, item: args.data.item, apptype: "cs" });
                        activated = true;
                        break;
                }
                break;
        }
    });
    cppluginsharp.stderr.pipe(process.stderr);
}
/*
function checkrenderstatus()
{
    walls.concat(previewwalls).forEach(function (wall)
    {
        var shouldrender = wall.renderstatus.reasonsnotto.length < 1;
        if (shouldrender !== wall.renderstatus.isrendering)
        {
            wall.renderstatus.isrendering = shouldrender;
            if (wall.apptype == "js")
                wall.window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: shouldrender ? "continue" : "pause", args: [wall.renderstatus.reasonsnotto] } }));
        }

    });
}
function modifyrenderreason(type, wall, reason)
{
    if (type == "add")
    {
        var arr = wall.renderstatus.reasonsnotto;
        //replace if exists and add if not, just wanted to see how i can do it in one line :\
        arr[(arr.indexOf(reason) + 1 || arr.length + 1) - 1] = reason;
    }
    else
        if (type == "remove")
        {
            var ind = wall.renderstatus.reasonsnotto.indexOf(reason);
            if (ind > -1)
                wall.renderstatus.reasonsnotto.splice(ind, 1);
        }
}
*/
function anotherwindowfullscreenchanged()
{
    mainwindow.send("asynchronous-reply", JSON.stringify({ type: "anotherwindowfullscreenchanged", data: { isit: anotherwindowfullscreen } }));

    walls.concat(previewwalls).forEach(function (wall)
    {
        if (wall)
            if (wall.apptype == "js")
            {
                /*
                modifyrenderreason(anotherwindowfullscreen ? "add" : "remove", wall, "fullscreen_window_in_foreground");
                */
                if (wall.apptype == "js")
                    wall.window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "coveringwindowchange", args: [anotherwindowfullscreen] } }));
            }
    });
    /*
    checkrenderstatus()
    */
}

var ipcMain = require('electron').ipcMain, walls = [], mainwindowevent, newitem = {}, activated = false;
function onmessage(event, arg)
{
    arg = JSON.parse(arg);
    switch (arg.type)
    {
        case "downloadupdate":
            autoUpdater.downloadUpdate();
            break;
        case "quitandinstallupdate":
            autoUpdater.quitAndInstall(true, true);
            break;
        case "checkforupdates":
            autoUpdater.checkForUpdates();
            break;
        case "togglevisiblewallpaperdevtools":
            if (previewwalls[0])
                previewwalls[0].window.toggleDevTools();
            else
                if (walls[0])
                    walls[0].window.toggleDevTools();
            break;
        case "previewitemchange":
            if (!previewwalls[0])
                return;
            previewwalls[0].item = arg.data.item;
            previewwalls[0].window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "itemchange", args: [arg.data.item] } }));
            break;
        case "appsettingschanged":
            mainwindow.send("asynchronous-reply", JSON.stringify({ type: "appsettingschanged", data: arg.data }));
            break;
        case "tray":
            mainwindow.hide();
            break;
        case "exit":
            cpsharp.kill();
            closewalls();
            mainwindow.close();
            app.isQuiting = true;
            app.quit();
            break;
        case "sendtomainwindow":
            mainwindow.send("asynchronous-reply", JSON.stringify({ type: "otherwindowmsg", data: arg.data }));
            break;
        case "removeallbackgrounds":
            closewalls();
            exec("RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters", function () { });
            activated = false;
            break;
        case "get_event":
            mainwindowevent = event;
            break;
        case "edititem":
            (function (event, arg)
            {

                arg.data.plugin = arg.data.plugin || event.sender.plugin;
                mainwindow.send("asynchronous-reply", JSON.stringify({ type: "edititem", data: arg.data }));

                var plugindata = require(userdata + "\\plugins\\" + arg.data.plugin + "\\data.json");
                var items = plugindata.items;
                for (var i = 0; i < items.length; i++)
                {
                    var item = items[i];
                    if (item.id == arg.data.id)
                    {
                        item.label = arg.data.label;
                        item.description = arg.data.description;
                        item.data = arg.data.data;
                        item.icon = arg.data.icon;
                        if (walls[0] && arg.data.plugin == walls[0].plugin && arg.data.id == walls[0].item.id && event.sender.mainwindow)
                        {
                            walls[0].window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "itemchange", args: [item] } }));
                        }
                        break;
                    }
                }
                fs.writeFile(path.join(userdata, "\\plugins\\" + arg.data.plugin + "\\data.json"), JSON.stringify(plugindata), 'utf8', function (err, data)
                {
                    if (err) console.error(err); else event.sender.send('asynchronous-reply', JSON.stringify({ type: "cb", data: { type: "edititem", id: arg.data.id } }))
                });

            })(event, arg);

            break;
        case "additem":
            (function (event, arg)
            {
                mainwindow.send("asynchronous-reply", JSON.stringify({ type: "additem", data: arg.data }));
                var plugindata = require(userdata + "\\plugins\\" + arg.data.plugin + "\\data.json");
                plugindata.items.push({ icon: arg.data.icon, id: arg.data.id, label: arg.data.label || "", description: arg.data.description || "", data: arg.data.data });
                fs.writeFile(path.join(userdata, "\\plugins\\" + arg.data.plugin + "\\data.json"), JSON.stringify(plugindata), 'utf8', function (err, data) { if (err) console.error(err); else event.sender.send('asynchronous-reply', JSON.stringify({ type: "cb", data: { type: "add", id: arg.data.id } })) });
                mainwindow.webContents.executeJavaScript('plugins.data["' + arg.data.plugin + '"].data=' + JSON.stringify(plugindata) + ';if(savingdata==0) { saveplugindata("' + arg.data.plugin + '");} else adddatasavingdoneevent(function(){saveplugindata("' + arg.data.plugin + '");});');
            })(event, arg);
            break;
        case "checknewitemeventhandler":
            if (arg.data.available)
            {
                walls.forEach(function (wall)
                {
                    if (wall.apptype == "js")
                        wall.window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "itemchange", args: [newitem.item] } }));
                    else
                        if (wall.apptype == "cs")
                            wall.cp.stdin.write(JSON.stringify({ type: "event", data: { type: "itemchange", args: [newitem.item] } }) + "\n");
                });
            }
            else
            {
                walls.forEach((wall, i) =>
                {
                    socketobj["removefrombackgroundbyhandlehex"] = handlehexfromwindow(wall.window);
                    senddata();
                    wall.window.close();
                    wall.window = null;

                    walls.splice(0, 1);
                });
                newwall(newitem.arg);

            }
            break;
        case "newwall":
            if (arg.data.preview)
            {
                if (arg.data.apptype == "js")
                {
                    if (previewwalls[0])
                    {

                        removingwall = previewwalls[0];
                        if (removingwall.apptype == "js")
                        {

                            try
                            {

                                previewwalls[0].window.close();

                            } catch (e) { }
                            previewwalls[0].window = null;
                            previewwalls.splice(0, 1);
                        }
                        else
                            if (removedwall.apptype == "cs")
                            {

                            }
                    }

                    newwall(arg);
                }
                else
                    if (arg.data.apptype == "cs")
                        newcswall(arg);
            }
            else
            {
                if (walls[0] && walls[0].plugin == arg.data.plugin && activated)
                {
                    if (!arg.data.item)
                        return;
                    newitem.item = arg.data.item;
                    newitem.arg = arg;
                    walls.forEach(function (wall)
                    {
                        if (wall)
                        {
                            if (wall.apptype == "js")
                                wall.window.webContents.send("asynchronous-reply", JSON.stringify({ type: "event", data: { type: "checknewitemeventhandler", args: [] } }));
                            else
                                if (wall.apptype == "cs")
                                    wall.cp.stdin.write(JSON.stringify({ type: "event", data: { type: "checknewitemeventhandler", args: [] } }) + "\n");

                        }
                    });
                }
                else
                {
                    if (arg.data.apptype == "js")
                    {
                        walls.forEach((wall, i) =>
                        {
                            socketobj["removefrombackgroundbyhandlehex"] = handlehexfromwindow(wall.window);
                            senddata();
                            wall.window.close();
                            wall.window = null;
                            walls.splice(i, 1);
                        });
                        newwall(arg);
                    }
                    else
                        if (arg.data.apptype == "cs")
                            newcswall(arg);
                }
            }
            break;
        case "getitem":
            event.sender.send('asynchronous-reply', JSON.stringify({ type: "cb", data: { arguments: (event.sender.item ? [event.sender.previewtype === "add" ? undefined : event.sender.item] : undefined), id: arg.data.id, type: "item" } }))
            break;
        case "getdesktopicons":
            event.sender.send('asynchronous-reply', JSON.stringify({ type: "cb", data: { arguments: [desktopicons], id: arg.data.id, type: "desktopicons" } }));
            break;
        case "setasbackground":
            socketobj["setasbackgroundbyhandlehex"] = handlehexfromwindow(event.sender.window);
            senddata();
            break;
        case "removefrombackground":
            socketobj["removefrombackgroundbyhandlehex"] = handlehexfromwindow(event.sender.window);
            senddata();
            break;
        case "removepreviewfrombackground":
            previewwalls.forEach((pw, i) =>
            {
                if (pw.apptype == "js")
                {
                    socketobj["removefrombackgroundbyhandlehex"] = handlehexfromwindow(pw.window);
                    senddata();
                    pw.window.close();
                    pw.window = null;

                    previewwalls.splice(i, 1);


                }
                else
                    if (pw.apptype == "cs")
                    {

                    }
            });

            break;
    }
}
function runmainprogram()
{
    //app.commandLine.appendArgument("-enable-gpu-rasterization");
    //app.commandLine.appendArgument("--force-gpu-rasterization");

    appIcon = new Tray(path.join(__dirname, "Tray.ico"))

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Displayus', click: function ()
            {
                mainwindow.show();
            }
        },
        {
            label: 'Quit', click: function ()
            {
                mainwindow.destroy();
                closewalls();
                app.isQuiting = true;
                app.quit();

            }
        }
    ])
    appIcon.on("click", function ()
    {
        mainwindow.show();
    });
    appIcon.setContextMenu(contextMenu);
    // add message receive eventhandler
    ipcMain.on('asynchronous-message', onmessage);
    var shouldblur = os.platform() === "win32" && os.release().split(".")[0] === "10";
    mainwindow = new BrowserWindow({
        icon: path.join(__dirname, "Tray.ico"), title: "Displayus", resizable: true, width: 800, height: 600, show: false, transparent: shouldblur, frame: false, webPreferences: {
            offscreen: false
        }
    });
    mainwindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    if (shouldblur)
        blur.SetVibrancy(mainwindow, 0);
    mainwindow.webContents.mainwindow = true;
    mainwindow.on('closed', () =>
    {
        for (var i = 0; i < walls.length; i++)
        {
            if (walls[i].apptype == "js")
            {
                try { walls[i].window.close(); } catch (e) { }
                walls[i].window = null;
                walls.splice(i, 1);
            }
            else
                if (walls[i].apptype == "cs")
                {
                    walls[i].cp.stdin.write(JSON.stringify({ type: "cmd", data: { type: "exit" } }) + "\n");
                    walls.splice(i, 1);
                }
        }
        exec("RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters", function ()
        {
            app.isQuiting = true;
            app.quit();
        });
    });
    mainwindow.on("ready-to-show", () =>
    {
        var hidden = false;
        process.argv.map(function (arg) { if (arg == "startup" || arg == "--hidden") { hidden = true; } });
        if (!hidden)
            mainwindow.show();
    });

    app.setAsDefaultProtocolClient("displayus");

}
// execute given command line command
var exec = function (cmd, cb)
{

    var child_process = require('child_process');
    var parts = cmd.split(/\s+/g);
    var p = child_process.spawn(parts[0], parts.slice(1), { stdio: "inherit" });
    p.on('exit', function (code)
    {
        var err = null;
        if (code)
        {
            err = new Error('command "' + cmd + '" exited with wrong status code "' + code + '"');
            err.code = code;
            err.cmd = cmd;
        }
        if (cb) cb(err);
    });
};

var socketobj = {};
var notallowobjs = [];
function senddata()
{

    // write requests for csharp app to csharp app's stdin
    var socketreqs = [];
    for (var key in socketobj)
    {
            socketreqs.push(key + "=" + socketobj[key]);
    }
    cpsharp.stdin.write((socketreqs.join("|") || " ") + "\n");
    console.log((socketreqs.join("|") || " ") + "\n");
    socketobj = {};

    // execute ondatasent event handlers
    for (var i = 0, cblen = arr_datasentcb.length; i < cblen; i++)
    {
        arr_datasentcb[i]();
    }
    arr_datasentcb.splice(0, 1);
}
var cpsharp;

//https://github.com/electron/electron/issues/6262#issuecomment-229043051
function getunpackeddir(dir)
{
    return path.join(app.getAppPath(), dir).replace('app.asar', 'app.asar.unpacked');
}
function startcsharp()
{
    cpsharp = cp.spawn(getunpackeddir("noasar\\controller\\windows\\_DisplayusController.exe"), { maxBuffer: 1000 * 1000 * 1000, detached: false });
    //cp.stdin.setEncoding('utf-8');
    cpsharp.stdout.on('data', function (data)
    {
        data = data + "";
        if (false && data.indexOf("none") < 0)
            console.log(data);
        if (data != "none" && typeof (data) == "string")
        {
            data.split("\r\n").map(function (x) { processdata(x); });
        }
    });
    cpsharp.stderr.pipe(process.stderr);
}
function desktopiconcursorchange(ind)
{
    var str = "displayus._iconcursorchange(" + parseInt(ind) + ");";
    execjsonplugins(parseInt(ind), "iconcursorchange");
}
var desktopicons;
function desktopiconschanged()
{
    var str = "displayus._desktopiconschange(" + JSON.stringify(desktopicons) + ");";
    execjsonplugins(JSON.stringify(desktopicons), "desktopiconschange");
}
function execjsonplugins(str, type)
{
    for (var i = 0; i < walls.length; i++)
    {
        if (walls[i].apptype == "js")
            walls[i].window.webContents.executeJavaScript("displayus._" + type + "(" + str + ");");
        else
            if (walls[i].apptype == "cs")
                walls[i].cp.stdin.write(JSON.stringify({ type: "event", data: { type: type, data: (((typeof str) == "string") ? JSON.parse(str) : str) } }) + "\n");
    }
}
var anotherwindowfullscreen = false;
function processdata(data)
{
    var dataarr = data.split("|").map(function (x) { return x.split("=") });
    /*if ( dataarr.length == 1 && data.indexOf("|") < 0 && data.indexOf("none") < 0)
        console.log(data);*/
    for (var i = 0; i < dataarr.length; i++)
    {
        try
        {
            switch (dataarr[i][0])
            {
                case "anotherwindowfullscreen":
                    console.log(dataarr[i][1].toLowerCase() == "true");
                    anotherwindowfullscreen = dataarr[i][1].toLowerCase() == "true";
                    break;
                case "anotherwindowfullscreenchanged":
                    anotherwindowfullscreenchanged();
                    break;
                case "senttobackground":
                    console.log(dataarr[i][1]);
                    break;
                case "ondesktopiconcursor":
                    var ind = (JSON.parse(dataarr[i][1]).ind);
                    desktopiconcursorchange(ind);
                    break;
                case "log":
                    console.log(dataarr[i][1]);
                    break;
                case "desktopiconschanged":
                    desktopiconschanged();
                    break;
                case "getdesktopicons":
                    desktopicons = JSON.parse(dataarr[i][1]);
                    if (!this.notfirstdesktopiconget)
                    {
                        this.notfirstdesktopiconget = true;
                        runmainprogram();
                    }
                    break;
                case "keyevent":
                    var keyeventtmp = JSON.parse(dataarr[i][1]);
                    keyevent(keyeventtmp.event, keyeventtmp.key);
                    break;
                case "mouseevent":
                    var mouseeventtmp = JSON.parse(dataarr[i][1]);
                    mouseevent(mouseeventtmp.button, mouseeventtmp.event);
                    break;
                case "mousepos":
                    var mousepostmp = JSON.parse(dataarr[i][1]);
                    mouseposchange(mousepostmp.x, mousepostmp.y)
                    break;
                case "currentpointing":
                    var mousepointing = JSON.parse(dataarr[i][1]);
                    mouseondesktop(getwindowtype(mousepointing) == "desktop");
                    sendcurrentpointing(mousepointing);
                    break;
                case "ready":
                    console.log("ready");
                    break;
            }
        }
        catch (e) { console.log(e, data); }
    }
}
app.on('ready', startcsharp);
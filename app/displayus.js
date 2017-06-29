displayus = new (function ()
{
    var arr_cb = { add: [], item: [], desktopicons: [], edititem: [] };
    this.done = function () { require('electron').remote.getCurrentWindow().close(); };
    this.itemchange = function (item) { ipcRenderer.sendToHost(JSON.stringify({ type: "item-change", data: { item: item } })); };
    this.done = function (item) { ipcRenderer.sendToHost(JSON.stringify({ type: "modify-status", data: { type: "save", item: item } })); };
    this.cancel = function () { ipcRenderer.sendToHost(JSON.stringify({ type: "modify-status", data: { type: "cancel" } })); };
    this.close = function () { require('electron').remote.getCurrentWindow().close(); };
    this.addItem = function (data, cb) { var id = "item" + (Math.random() * Math.pow(10, 16)).toFixed(0); ipcRenderer.send("asynchronous-message", JSON.stringify({ type: "additem", data: { plugin: displayus.plugin, id: id, label: data.label || "", description: data.description || "", data: data.data } })); if (cb) { cb.id = id; arr_cb.add.push(cb); } }
    this.editItem = function (data, cb)
    {
        ipcRenderer.send("asynchronous-message", JSON.stringify({ type: "edititem", data: { label: data.label || "", description: data.description || "", id: data.id, data: data.data, icon: data.icon } })); if (cb) { cb.id = itemid; arr_cb.edititem.push(cb); }
    };
    var ipcRenderer = require('electron').ipcRenderer;

    ipcRenderer.on('asynchronous-reply', (event, arg) =>
    {
        arg = JSON.parse(arg);
        switch (arg.type)
        {
            case "event":
                if (arg.data.type == "loaded")
                    console.log(arg.data.type);
                listeners[arg.data.type].apply(null, arg.data.args)
                break;

            case "cb":
                for (var i = 0, arr = arr_cb[arg.data.type], len = arr.length; i < len; i++)
                {

                    if (arr[i].id == arg.data.id)
                    {
                        arr[i].apply(null, arg.data.arguments || []);
                        arr.splice(i, 1);
                        break;
                    }
                }
                break;
        }
    });
    this._pause = (reasons) =>
    {

    }
    this._continue = (reasons) =>
    {

    }
    this.getItem = function (cb) { if (this.type == "wallpaperpreviewadd") return false; var id = "item" + (Math.random() * Math.pow(10, 16)).toFixed(0); cb.id = id; arr_cb.item.push(cb); ipcRenderer.send('asynchronous-message', JSON.stringify({ type: "getitem", data: { id: id } })) }
    var arr_event = {/* pause: { arr: [] }, continue: {arr:[]}*/coveringwindowchange: { arr: [] }, itemchange: { arr: [] }, newitem: { arr: [] }, cursoriconpointingchange: { arr: [] }, nclick: { arr: [] }, mousemove: { arr: [] }, load: { arr: [], loaded: false }, mouseoutdesktop: { arr: [] }, mouseoverdesktop: { arr: [] }, mouseup: { arr: [] }, mousedown: { arr: [] }, keyup: { arr: [] }, keydown: { arr: [] }, desktopiconschange: { arr: [] } };
    this.arr_event = arr_event;
    this._loaded = function (type)
    {
        this.type = type || this.type;
        for (var i = 0, arr = arr_event["load"].arr, len = arr.length; i < len; i++)
            arr[i]();
        arr_event["load"].arr = [];
        arr_event["load"].loaded = true;

    };
    var mouseondesktop = false;
    var mousepos = { x: 0, y: 0 };
    this._mouseondesktop = function (ondesktop)
    {
        mouseondesktop = ondesktop;
        var event = ondesktop ? "mouseoverdesktop" : "mouseoutdesktop";
        for (var i = 0, arr = arr_event[event].arr, len = arr.length; i < len; i++)
            arr[i]({ ondesktop: ondesktop, pos: mousepos });
    }
    this.getMouseInfo = function (cb) { return ({ pos: mousepos, ondesktop: mouseondesktop, mouseonicon: { onicon: cursoriconpointingind > -1, ind: cursoriconpointingind } }) };
    this._desktopiconschange = function (desktopicons)
    {
        var event = "desktopiconschange";
        for (var i = 0, arr = arr_event[event].arr, len = arr.length; i < len; i++)
            arr[i](desktopicons);
    }
    /*
    var pausereasons = ["all"];
    this.setpausereasons = (reasons) =>
    {
        pausereasons = reasons;
    }
    */
    this.getDesktopIcons = function (cb)
    {

        if (cb)
        {
            var id = "cb" + (Math.random() * Math.pow(10, 16)).toFixed(0);
            cb.id = id; arr_cb.desktopicons.push(cb);
            ipcRenderer.send('asynchronous-message', JSON.stringify({ type: "getdesktopicons", data: { id: id } }));
        }
    }
    this._mouseevent = function (button, type)
    {
        for (var i = 0, arr = arr_event["mouse" + type].arr, len = arr.length; i < len; i++)
            arr[i]({ button: button, ondesktop: mouseondesktop, x: mousepos.x, y: mousepos.y, cursoriconpointing: { onicon: cursoriconpointingind > -1, ind: cursoriconpointingind } });

    }
    var cursoriconpointingind = -1;
    this._iconcursorchange = function (ind)
    {
        cursoriconpointingind = ind;
        for (var i = 0, arr = arr_event["cursoriconpointingchange"].arr, len = arr.length; i < len; i++)
            arr[i]({ onicon: ind > -1, index: ind, icon: (ind < 0 ? undefined : this.obj_icons.icons[ind]) });
    };
    this._mousemove = function (x, y)
    {
        mousepos.x = x; mousepos.y = y;
        for (var i = 0, arr = arr_event["mousemove"].arr, len = arr.length; i < len; i++)
            arr[i]({ x: x, y: y, ondesktop: mouseondesktop });
    }
    this.obj_icons;
    this._geticonpositions = function (icons)
    {
        this.obj_icons = icons;
    }
    this._newitem = function (item)
    {
        for (var i = 0, arr = arr_event["itemchange"].arr, len = arr.length; i < len; i++)
            arr[i]({ item: item });
    };
    this._itemchange = function (item)
    {
        for (var i = 0, arr = arr_event["itemchange"].arr, len = arr.length; i < len; i++)
            arr[i]({ item: item });
    }
    this._checknewitemeventhandler = function ()
    {
        ipcRenderer.send('asynchronous-message', JSON.stringify({ type: "checknewitemeventhandler", data: { available: arr_event["itemchange"].arr.length > 0 } }));
    };
    function removeeventlistener(event, cb)
    {
        for (var i = 0, arr = arr_event[event].arr, len = arr.length; i < len; i++)
            if (arr[i].__id === cb.__id)
            {
                arr.splice(i, 1);
                return true;
            }
        return false;
    }
    this.removeEventListener = function (event, cb)
    {
        return removeeventlistener(event, cb);
    }
    this.addEventListener = function (event, cb)
    {
        cb.__id = cb.__id || Math.random() * Math.pow(10, 16);
        removeeventlistener(event, cb);
        switch (event.toLowerCase())
        {

            /*
        case "pause":
            arr_event[event].arr.push(cb);
            break;
        case "continue":
            arr_event[event].arr.push(cb);
            break;
            */

            case "load":
                if (arr_event["load"].loaded)
                    cb();
                else
                    arr_event[event].arr.push(cb);
                break;
            case "newitem":
                arr_event["itemchange"].arr.push(cb);
                break;
            case "coveringwindowchange":
            case "itemchange":
            case "mouseoverdesktop":
            case "mouseoutdesktop":
            case "mousemove":
            case "mousedown":
            case "mouseup":
            case "keydown":
            case "keyup":
            case "desktopiconschange":
            case "cursoriconpointingchange":
                arr_event[event].arr.push(cb);
                break;
                /*
            default:
                
                arr_event[event].arr.push(cb);
                */
        }
    }
    this.setAsBackground = function ()
    {
        ipcRenderer.send('asynchronous-message', JSON.stringify({ type: "setasbackground", data: {} }));
    }
    this.removeFromBackground = function ()
    {
        ipcRenderer.send('asynchronous-message', JSON.stringify({ type: "removefrombackground", data: {} }));
    }
    var keys = { "OemMinus": "-", "Oem3": "`", "D1": "1", "D2": "2", "D3": "3", "D4": "4", "D5": "5", "D6": "6", "D7": "7", "D8": "8", "D9": "9", "D0": "0", "Snapshot": "PrintScreen", "Oem1": ";", "OemComma": ",", "OemPeriod": ".", "OemQuestion": "/", "OemQuotes": "\"", "Oem1": ";", "Oem5": "\\", "Oem6": "]", "OemOpenBrackets": "[", "OemPlus": "=", "RightShift": "shift", "LeftShift": "Shift", "LeftCtrl": "Control", "RightCtrl": "Control", "LeftAlt": "Alt", "RightAlt": "Alt", "Back": "Backspace" };
    this._keyevent = function (event, key)
    {
        for (var i = 0, arr = arr_event["key" + event].arr, len = arr.length; i < len; i++)
            arr[i](keys[key] || key);
    }
    this.connectInputs = function (inputs)
    {
        for (var i = 0; i < inputs.length; i++)
        {
            var input = inputs[i];
            if (this.currentConnectedInputs.join("").indexOf(input) > -1)
                continue;
            this.currentConnectedInputs.push(input);
            switch (input.toLowerCase())
            {
                case "keyboard":
                case "keydown":
                    this.addEventListener("keydown", inputev.keyboard.keydown);
                case "keyboard":
                case "keyup":
                    this.addEventListener("keyup", inputev.keyboard.keyup);
                    break;
                case "mouse":
                case "mousedown":
                    this.addEventListener("mousedown", inputev.mouse.mousedown);
                case "mouse":
                case "mouseup":
                    this.addEventListener("mouseup", inputev.mouse.mouseup);
                case "mouse":
                case "mousemove":
                    this.addEventListener("mousemove", inputev.mouse.mousemove);
                    this.addEventListener("mouseoverdesktop", inputev.mouse.mouseoverdesktop);
                    this.addEventListener("mouseoutdesktop", inputev.mouse.mouseoutdesktop);
                    break;
            }
        }
    };
    this.unRegisternClick = function (cb)
    {
        for (var i = 0; i < arr_event.nclick.arr.length; i++)
        {
            var obj = arr_event.nclick.arr[i];
            if (obj.cb._id == cb._id)
            {
                this.removeEventListener("mousedown", obj.mde);
                arr_event.nclick.arr.splice(i, 1);
                break;
            }
        }
    }
    this._coveringwindowchange=function(iscovering)
    {
        var event = "coveringwindowchange";
        for (var i = 0, arr = arr_event[event].arr, len = arr.length; i < len; i++)
            arr[i](iscovering);
    }
    this.registernClick = function (cb, clickcount, timeout)
    {
        var mousecounter = { count: 0, button: undefined, time: Date.now() };
        var checknclick = function (opts)
        {
            if (opts.ondesktop || true)
            {
                if (mousecounter.count >= 2)
                {
                    mousecounter.count = 0;
                }
                else
                {
                    if (Date.now() - mousecounter.time > (timeout || 300))
                    {
                        mousecounter.count = 0;
                        mousecounter.time = Date.now();
                    }
                    else
                    {
                        mousecounter.count++;
                        mousecounter.time = Date.now();
                    }
                    if (mousecounter.count >= (clickcount || 2) - 1)
                    {
                        mousecounter.count = 0;
                        cb(opts);
                    }
                }
            }
        };
        arr_event.nclick.arr.push({ mde: checknclick, cb: cb });
        cb._id = cb._id || Math.random() * Math.pow(10, 16);
        this.addEventListener("mousedown", checknclick);
    }
    var capslock = false;
    var shift = false;
    var currentwindow = require('electron').remote.getCurrentWindow();
    var windowwebcontents = currentwindow.webContents;
    var inputev = {
        mouse: {
            mouseoverdesktop: function (e)
            {
                windowwebcontents.sendInputEvent({ type: "mouseEnter", x: e.pos.x, y: e.pos.y });
            }, mouseoutdesktop: function (e)
            {
                windowwebcontents.sendInputEvent({ type: "mouseLeave", x: e.pos.x, y: e.pos.y });
            }, mouseup: function (e)
            {
                if (e.ondesktop)
                    windowwebcontents.sendInputEvent({ type: "mouseUp", x: e.x, y: e.y, button: (e.button == 0 ? "left" : (e.button == 3 ? "right" : "Unknown")), clickCount: 1 });
            }, mousedown: function (e)
            {
                if (e.ondesktop)
                    windowwebcontents.sendInputEvent({ type: "mouseDown", x: e.x, y: e.y, button: (e.button == 0 ? "left" : (e.button == 3 ? "right" : "Unknown")), clickCount: 1 });
            }, mousemove: function (e)
            {
                if (e.ondesktop)
                    windowwebcontents.sendInputEvent({ type: "mouseMove", x: e.x, y: e.y });
            }
        }, keyboard: {
            keydown: function (key)
            {
                if (key == "shift")
                    shift = true;
                else
                    shift = false;
                if (!mouseondesktop)
                    return;
                if (key.length == 1)
                {
                    //toggle case if one of shift or caps lock is on or dont if both or none
                    key = !!(capslock ^ shift) ? key : (key.toLowerCase() == key ? key.toUpperCase() : key.toLowerCase());
                    windowwebcontents.sendInputEvent({ type: "char", keyCode: key })

                }
                else
                {
                    windowwebcontents.sendInputEvent({ type: "KeyDown", keyCode: key });
                }
            }, keyup: function (key)
            {
                if (key == "shift")
                    shift = false;
                if (!mouseondesktop)
                    return;
                windowwebcontents.sendInputEvent({ type: "KeyUp", keyCode: key });
            }
        }
    };
    this.init = function ()
    {
        windowwebcontents.insertCSS("*{ -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;}");
    }
    this.disconnectInputs = function (inputs)
    {
        for (var i = 0; i < inputs.length; i++)
        {
            var input = inputs[i];
            if (this.currentConnectedInputs.join("").indexOf(input) < 0)
                continue;
            for (var j = 0; j < this.currentConnectedInputs.length; j++)
            {
                if (this.currentConnectedInputs[j] == input)
                {
                    this.currentConnectedInputs.splice(j, 1);
                    break;
                }
            }
            switch (input.toLowerCase())
            {
                case "keyboard":
                case "keydown":
                    this.removeEventListener("keydown", inputev.keyboard.keydown);
                case "keyboard":
                case "keyup":
                    this.removeEventListener("keyup", inputev.keyboard.keyup);
                    break;
                case "mouse":
                case "mousedown":
                    this.removeEventListener("mousedown", inputev.mouse.mousedown);
                case "mouse":
                case "mouseup":
                    this.removeEventListener("mouseup", inputev.mouse.mouseup);
                case "mouse":
                case "mousemove":
                    this.removeEventListener("mousemove", inputev.mouse.mousemove);
                    this.removeEventListener("mouseoverdesktop", inputev.mouse.mouseoverdesktop);
                    this.removeEventListener("mouseoutdesktop", inputev.mouse.mouseoutdesktop);
                    break;
            }
        }
    };
    this.currentConnectedInputs = [];
    var listeners =
        {
            "mouseondesktop": this._mouseondesktop,
            "keyevent": this._keyevent,
            "mousemove": this._mousemove,
            "mouseevent": this._mouseevent,
            "newitem": this._newitem,
            "checknewitemeventhandler": this._checknewitemeventhandler,
            "loaded": this._loaded,
            "itemchange": this._itemchange,
            "coveringwindowchange": this._coveringwindowchange
            /*
            "pause": this._pause,
            "continue":this._continue*/
        };
})
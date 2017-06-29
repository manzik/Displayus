## Quick Start
So what we are going to do is making a plugin that sets NASA's live feed of earth from space as desktop background.

Plugin development is currently done using web technologies(ElectronJS, NodeJS, html, css).<br/>

You will need [NodeJS](https://nodejs.org/) with NPM installed in order to Develop a plugin.<br/>

The following is the basic minimum structure of a Displayus plugin:
```text
your-plugin/
├── package.json
├── data.json
└── index.html
```

The package.json file indicates plugin specifications and info, further info can be found [Here](package/).<br/>

So the package.json file can be used like this(minimum data provided):

```json
{
  "name" : "my-plugin",
  "title" : "My Plugin",
  "version" : "1.0.0",
  "plugintype" : "wallpaper"
}
```
Then we need our index.html file, this is file used to create your background and control the way it behaves.

So, this is code for a basic plugin that shows "NASA's live feed of earth from space" using youtube.
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        iframe {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }
    </style>
    <script>
        var videoplaying = true;
        function ondoubleclick(eventdata)
        {
            //accept doube click only if double clicked on desktop and not on an icon
            if (eventdata.ondesktop && !eventdata.cursoriconpointing.onicon)
            {
                //toggle live video playing state
                videoplaying = !videoplaying;

                if (videoplaying)
                {
                    //tell youtube iframe to continue playing the live video
                    document.getElementById("livefeed").contentWindow.postMessage(
                        '{ "event": "command", "func": "playVideo" }'
                        , "*");
                }
                else
                {
                    //tell youtube iframe to pause playing the live video
                    document.getElementById("livefeed").contentWindow.postMessage(
                        '{ "event": "command", "func": "pauseVideo" }'
                        , "*");
                }
            }
        };

        // wait for page to load
        window.addEventListener("load", () =>
        {
            // register "ondoubleclick" function as event listener for clicking two times in a row(with maximum delay between each click for double click set to 300 milliseconds)
            displayus.registernClick(ondoubleclick, 2, 300);
        });
    </script>
</head>
<body>
    <iframe id="livefeed" src="https://www.youtube.com/embed/RtU_mdL2vBM?autoplay=1&enablejsapi=1" frameborder="0"></iframe>
</body>
</html>
```

Basically it loads youtube life feed video to and iframe and play/pause the video on double click.

Next, we set plugin data.json so we will have a single item in Displayus app for our plugin.

```json
{
  "chance" : 50,
  "items" : 
  [
    {
      "label" : "Live Earth",
      "id" : "somerandomid12321232"
    }
  ]
}
```
Now we have an item set for our plugin that will appear in user's item list with title "Live Earth".

As this plugin has only one item and user should not be able to add or remove items of this plugin, we modify our package.json file:

```json
{
  "name" : "my-plugin",
  "title" : "My Plugin",
  "version" : "1.0.0",
  "plugintype" : "wallpaper",
  "buttons": 
  {
    "items": 
    {
      "edit": false,
      "add": false
    }
  }
}
```

Now our plugin is ready, you can pack your plugin to an installable .dus file using `displayus-packager` npm module.

First install it using the following command:

```bash
npm install displayus-packager -g
```

Change your current directory to `my-plugin` directory and execute following command:

```bash
displayus-packager . --out=..
```
This command will pack current directory plugin files to a `.dus` file and put it in parent directory.

After executing this command you will have a `my-plugin.dus` file behind `my-plugin` folder.

Open Displayus app and click manage plugins icon in top bar and then click the add(+) button.

Drop your `my-plugin.dus` file to app and plugin will be installed.

Now you can return to list of items in main page and click your item named "Live Earth" and see your plugin working.

That's it!

_Note: We didn't use NodeJS and ElectronJS abilities in this sample, you will be able to make more amazing plugins using them._

For further information about displayus api and plugins options and abilities read the documentation.
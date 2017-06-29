## *API*

## Events

### Usage

```javascript
displayus.addEventListener("cursoriconpointingchange", (event_data)
{
  event_data.index // 23
  event_data.onicon // true
  event_data.icon // {x: 120, y: 450, name: "Google Chrome"}
}
```

### Events List
`"load"` : 

Fires when displayus is ready

<hr>

`"mousemove"`

Fires when mouse position changes

Returns:

* `Object` :
>`x` : `int` - Mouse X coordinates
>`y` : `int` - Mouse Y coordinates
>`ondesktop` : `bool` - Indicates if mouse is pointing to desktop 

<hr>
`"mousedown"` 

Fires when a mouse button is pressed

Returns:

* `Object` :
>`button` : `int` - Indicates the id button pressed: 0, 1, 2 for left middle and right button
>`x` : `int` - Mouse desktop based X coordinates
>`y` : `int` - Mouse desktop based Y coordinates
>`ondesktop` : `bool` - Indicates if mouse is pointing to desktop 
>`cursoriconpointing` : `Icon` - Current mouse pointing icon
>>`Icon`  :  `Object`
>>>`x` : `int` - Desktop based icon x coordinate
>>>`y` : `int` - Desktop based icon y coordinate
>>>`width` : `int` - Icon width
>>`height` : `int` - Icon height
>>>`name` : `string` - Desktop icon name text

<hr>
`"mouseup"` <br/>
Fires when a mouse button is released

Returns:

* `Object` :
>`button` : `int` - Indicates the id button pressed: 0, 1, 2 for left middle and right button
>`x` : `int` - Mouse desktop based X coordinates
>`y` : `int` - Mouse desktop based Y coordinates
>`ondesktop` : `bool` - Indicates if mouse is pointing to desktop 
>`cursoriconpointing` : `Icon` - Current mouse pointing icon
>>`Icon`  :  `Object`
>>>`x` : `int` - Desktop based icon x coordinate
>>>`y` : `int` - Desktop based icon y coordinate
## *API*

## Events

### Usage

```javascript
displayus.addEventListener("cursoriconpointingchange", (event_data)
{
  event_data.index // 23
  event_data.onicon // true
  event_data.icon // {x: 120, y: 450, name: "Google Chrome"}
}
```

### Events List
`"load"` : 

Fires when displayus is ready

<hr>

`"mousemove"`

Fires when mouse position changes

Returns:

* `Object` :
>`x` : `int` - Mouse X coordinates
>`y` : `int` - Mouse Y coordinates
>`ondesktop` : `bool` - Indicates if mouse is pointing to desktop 

<hr>
`"mousedown"` 

Fires when a mouse button is pressed

Returns:

* `Object` :
>`button` : `int` - Indicates the id button pressed: 0, 1, 2 for left middle and right button
>`x` : `int` - Mouse desktop based X coordinates
>`y` : `int` - Mouse desktop based Y coordinates
>`ondesktop` : `bool` - Indicates if mouse is pointing to desktop 
>`cursoriconpointing` : `Icon` - Current mouse pointing icon
>>`Icon`  :  `Object`
>>>`x` : `int` - Desktop based icon x coordinate
>>>`y` : `int` - Desktop based icon y coordinate
>>>`width` : `int` - Icon width
>>>`height` : `int` - Icon height
>>>`name` : `string` - Desktop icon name text

<hr>
`"mouseup"` <br/>
Fires when a mouse button is released

Returns:

* `Object` :
>`button` : `int` - Indicates the id button pressed: 0, 1, 2 for left middle and right button
>`x` : `int` - Mouse desktop based X coordinates
>`y` : `int` - Mouse desktop based Y coordinates
>`ondesktop` : `bool` - Indicates if mouse is pointing to desktop 
>`cursoriconpointing` : `Icon` - Current mouse pointing icon
>>`Icon`  :  `Object`
>>>`x` : `int` - Desktop based icon x coordinate
>>>`y` : `int` - Desktop based icon y coordinate
>>>`width` : `int` - Icon width
>>>`height` : `int` - Icon height
>>>`name` : `string` - Desktop icon name text

<hr>
`"keydown"` <br/>
Fires when a keyboard button is pressed

Returns:

* `string` : Character based on corresponding keyboard button, it is used like keys in [this page](https://electron.atom.io/docs/api/accelerator/)

<hr>
`"keyup"` :<br/>
Fires when a keyboard button is released

Returns:

* `string` : Character based on corresponding keyboard button, it is used like keys in [this page](https://electron.atom.io/docs/api/accelerator/)

<hr>

`"mouseoverdesktop"`<br/>
Fires when cursor moves into desktop

Returns:

* `Object` :
>`ondesktop` : `bool` - Indicates if cursor is pointing to desktop
>`pos` : `Object` - Mouse pointing position
>>`x` : `int` - Desktop based x coordinate
>>`y` : `int` - Desktop based y coordinate


<hr>

`"mouseoutdesktop"`<br/>
Fires when cursor moves outside desktop

Returns:

* `Object` :
>`ondesktop` : `bool` - Indicates if cursor is pointing to desktop
>`pos` : `Object` - Mouse pointing position
>>`x` : `int` - Desktop based x coordinate
>>`y` : `int` - Desktop based y coordinate

<hr>

`"desktopiconschange"`<br/>
Fires when desktop icon's position or name change

Returns:

* `Array` of new `Icons` :
>`Icon`  :  `Object`
>>`x` : `int` - Desktop based icon x coordinate
>>`y` : `int` - Desktop based icon y coordinate
>>`width` : `int` - Icon width
>>`height` : `int` - Icon height
>>`name` : `string` - Desktop icon name text

<hr>

`"cursoriconpointingchange"`

Fires when cursor pointing to icons state change

Returns:

* `Object`:
>`index` : `int` - Index of icon in array of desktop icons, will be `-1` if not pointing to an icon
>`onicon` : `bool` - Indicates if cursor is pointing to an icon
>`icon` :  `Icon` - Current icon that cursor is pointing to
>>`Icon`  :  `Object`
>>>`x` : `int` - Desktop based icon x coordinate
>>>`y` : `int` - Desktop based icon y coordinate
>>>`width` : `int` - Icon width
>>>`height` : `int` - Icon height
>>>`name` : `string` - Desktop icon name text

<hr>

`"coveringwindowchange"`<br/>
Fires when another windows become fullscreen, useful for wallpapers doing heavy operations so when uset opens game-like app it stops

Returns:

* `iscovering`: `bool` - Indicates if there is a fullscreen window covering everything

<hr>

`"itemchange"`<br/>
Fires in wallpaper page, when item settings and data is changed or a new one is chosen to be show by user or displayus.(will restart wallpaper with new item if event listener for this event is not available)

Returns:

* `Object`:
>`item`: `Item` - Data object of new item that should be shown to user
>>`Item`  :  `Object`
>>>`id` : `string` - Unique id for item
>>>`label` : `string` - Name to be shown to user for this item in app
>>>`icon`(Optional) : `string` - Path to icon for this item
>>>`data`:`Object` - Object that plugins can store item specification and settings in it

>>>`name` : `string` - Desktop icon name text

<hr>
`"keydown"` <br/>
Fires when a keyboard button is pressed

Returns:

* `string` : Character based on corresponding keyboard button, it is used like keys in [this page](https://electron.atom.io/docs/api/accelerator/)

<hr>
`"keyup"` :<br/>
Fires when a keyboard button is released

Returns:

* `string` : Character based on corresponding keyboard button, it is used like keys in [this page](https://electron.atom.io/docs/api/accelerator/)

<hr>

`"mouseoverdesktop"`<br/>
Fires when cursor moves into desktop

Returns:

* `Object` :
>`ondesktop` : `bool` - Indicates if cursor is pointing to desktop
>`pos` : `Object` - Mouse pointing position
>>`x` : `int` - Desktop based x coordinate
>>`y` : `int` - Desktop based y coordinate


<hr>

`"mouseoutdesktop"`<br/>
Fires when cursor moves outside desktop

Returns:

* `Object` :
>`ondesktop` : `bool` - Indicates if cursor is pointing to desktop
>`pos` : `Object` - Mouse pointing position
>>`x` : `int` - Desktop based x coordinate
>>`y` : `int` - Desktop based y coordinate

<hr>

`"desktopiconschange"`<br/>
Fires when desktop icon's position or name change

Returns:

* `Array` of new `Icons` :
>`Icon`  :  `Object`
>>`x` : `int` - Desktop based icon x coordinate
>>`y` : `int` - Desktop based icon y coordinate
>>`width` : `int` - Icon width
>>`height` : `int` - Icon height
>>`name` : `string` - Desktop icon name text

<hr>

`"cursoriconpointingchange"`

Fires when cursor pointing to icons state change

Returns:

* `Object`:
>`index` : `int` - Index of icon in array of desktop icons, will be `-1` if not pointing to an icon
>`onicon` : `bool` - Indicates if cursor is pointing to an icon
>`icon` :  `Icon` - Current icon that cursor is pointing to
>>`Icon`  :  `Object`
>>>`x` : `int` - Desktop based icon x coordinate
>>>`y` : `int` - Desktop based icon y coordinate
>>>`width` : `int` - Icon width
>>>`height` : `int` - Icon height
>>>`name` : `string` - Desktop icon name text

<hr>

`"coveringwindowchange"`<br/>
Fires when another windows become fullscreen, useful for wallpapers doing heavy operations so when uset opens game-like app it stops

Returns:

* `iscovering`: `bool` - Indicates if there is a fullscreen window covering everything

<hr>

`"itemchange"`<br/>
Fires in wallpaper page, when item settings and data is changed or a new one is chosen to be show by user or displayus.(will restart wallpaper with new item if event listener for this event is not available)

Returns:

* `Object`:
>`item`: `Item` - Data object of new item that should be shown to user
>>`Item`  :  `Object`
>>>`id` : `string` - Unique id for item
>>>`label` : `string` - Name to be shown to user for this item in app
>>>`icon`(Optional) : `string` - Path to icon image for this item
>>>`data`:`Object` - Object that plugins can store item specification and settings in it

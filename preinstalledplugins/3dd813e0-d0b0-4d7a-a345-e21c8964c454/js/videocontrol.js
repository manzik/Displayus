progressprop = "width";
$(document).ready(function ()
{
    displayus.init();
    displayus.connectInputs(["mouse", "keyboard"]);
    //INITIALIZE
    var video = $('#video');

    //remove default control when JS loaded
    video[0].removeAttribute("controls");
    $('.control').fadeIn(500);
    $('.caption').fadeIn(500);

    //before everything get started
    video.on('loadedmetadata', function ()
    {

        //set video properties
        $('.current').text(timeFormat(0));
        $('.duration').text(timeFormat(video[0].duration));

        //start to get video buffering data
        setTimeout(startBuffer, 150);

        //bind video events
        $('.videoContainer')
            .hover(function ()
            {
                $('.control').stop().fadeIn();
                $('.caption').stop().fadeIn();
            }, function ()
            {
                if (!volumeDrag && !timeDrag)
                {
                    $('.control').stop().fadeOut();
                    $('.caption').stop().fadeOut();
                }
            })
            .on('click', function ()
            {
                $('.btnPlay').find('.icon-play').addClass('icon-pause').removeClass('icon-play');
                $(this).unbind('click');
                video[0].play();
            });
    });

    //display video buffering bar
    var startBuffer = function ()
    {
        var currentBuffer = video[0].buffered.end(0);
        var maxduration = video[0].duration;
        var perc = 100 * currentBuffer / maxduration;
        $('.bufferBar').css(progressprop, perc + '%');

        if (currentBuffer < maxduration)
        {
            setTimeout(startBuffer, 500);
        }
    };

    //display current video play time
    video.on('timeupdate', function ()
    {
        var currentPos = video[0].currentTime;
        var maxduration = video[0].duration;
        var perc = 100 * currentPos / maxduration;
        $('.timeBar').css(progressprop, perc + '%');
        $('.current').text(timeFormat(currentPos));
    });

    //CONTROLS EVENTS
    //video screen and play button clicked
    video.on('click', function () { playpause(); });
    $('.btnPlay').on('click', function () { playpause(); });
    var flip = true,
        pause = "M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28",
        play = "M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26",
        $animation = $('#animation');
    var playpause = function ()
    {
        flip = video[0].paused;
        $animation.attr({
            "from": flip ? pause : play,
            "to": flip ? play : pause
        }).get(0).beginElement();
        if (video[0].paused || video[0].ended)
        {
            video[0].play();
        }
        else
        {
            video[0].pause();
        }
    };


    //fullscreen button clicked
    $('.btnFS').on('click', function ()
    {
        if ($.isFunction(video[0].webkitEnterFullscreen))
        {
            video[0].webkitEnterFullscreen();
        }
        else if ($.isFunction(video[0].mozRequestFullScreen))
        {
            video[0].mozRequestFullScreen();
        }
        else
        {
            alert('Your browsers doesn\'t support fullscreen');
        }
    });

    //sound button clicked
    $('.sound').click(function ()
    {
        video[0].muted = !video[0].muted;
        $(this).toggleClass('muted');
        if (video[0].muted)
        {
            $("#mutebutton").html('<svg class="icon-sound" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <g> <g> <path fill="white" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d=" M47.205,308.271h106.337l163.207-163.205V66.75L179.782,203.721H47.205c-12.317,0-22.303,9.986-22.303,22.303v59.939 C24.902,298.274,34.888,308.271,47.205,308.271z" /> <polygon fill="white" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points=" 212.729,341.215 316.748,445.238 316.748,237.203 " /> </g> <path fill="white" d="M442.856,38.189c7.613-7.612,19.961-7.612,27.574,0l0,0c7.613,7.613,7.613,19.957,0,27.58L62.375,473.803 c-7.623,7.623-19.962,7.623-27.574,0l0,0c-7.623-7.601-7.623-19.95,0-27.573L442.856,38.189z" /> <path fill="white" d="M432.13,130.19c61.616,89.049,53.002,212.365-26.225,291.591c-4.355,4.355-4.355,11.413,0,15.769 c2.179,2.178,5.032,3.268,7.885,3.268c2.854,0,5.707-1.09,7.886-3.268c87.938-87.938,96.553-225.33,26.386-323.297L432.13,130.19z" /> </g> </svg>');
        }
        else
        {

            $("#mutebutton").html('<svg  class="icon-sound" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <g> <path fill="white" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d=" M319.396,47.722l-145.663,145.67H32.735c-13.099,0-23.719,10.621-23.719,23.719v63.746c0,13.094,10.621,23.726,23.719,23.726 h141.002l145.658,145.665V47.722z"/> <path d="M422.602,445.544c-3.034,0-6.069-1.158-8.385-3.475c-4.633-4.633-4.633-12.138,0-16.77 c94.785-94.786,94.785-249.032,0-343.834c-4.633-4.633-4.633-12.138,0-16.771c4.632-4.633,12.137-4.633,16.77,0 c104.039,104.051,104.039,273.335,0,377.375C428.671,444.386,425.636,445.544,422.602,445.544z"/> </g> </svg>');

        }
    });

    //VIDEO EVENTS
    //video canplay event
    video.on('canplay', function ()
    {
        $('.loading').fadeOut(100);
    });

    //video canplaythrough event
    //solve Chrome cache issue
    var completeloaded = false;
    video.on('canplaythrough', function ()
    {
        completeloaded = true;
    });

    //video ended event
    video.on('ended', function ()
    {
        $('.btnPlay').removeClass('paused');
        video[0].pause();
    });

    //video seeking event
    video.on('seeking', function ()
    {
        //if video fully loaded, ignore loading screen
        if (!completeloaded)
        {
            $('.loading').fadeIn(200);
        }
    });

    //video seeked event
    video.on('seeked', function () { });

    //video waiting for more data event
    video.on('waiting', function ()
    {
        $('.loading').fadeIn(200);
    });

    //VIDEO PROGRESS BAR
    //when video timebar clicked
    var timeDrag = false;	/* check for drag event */
    $('.progress').on('mousedown', function (e)
    {
        timeDrag = true;
        updatebar(e[progressprop == "width" ? "pageX" : "pageY"]);
    });
    $(document).on('mouseup', function (e)
    {
        if (timeDrag)
        {
            timeDrag = false;
            updatebar(e[progressprop == "width" ? "pageX" : "pageY"]);

        }
    });
    $(document).on('mousemove', function (e)
    {
        if (timeDrag && showsuccess)
        {
            updatebar(e[progressprop == "width" ? "pageX" : "pageY"]);
        }
    });
    var lastpos = 0;
    updatebar = function (x)
    {
        var progress = $('.progress');

        //calculate drag position
        //and update video currenttime
        //as well as progress bar
        var maxduration = video[0].duration;
        var position = x - progress.offset()[progressprop == "width" ? "left" : "top"];
        var percentage = 100 * position / progress[progressprop]();
        if (percentage > 100)
        {
            percentage = 100;
        }
        if (percentage < 0)
        {
            percentage = 0;
        }
        $('.timeBar').css(progressprop, percentage + '%');
        video[0].currentTime = maxduration * percentage / 100;
    };

    //VOLUME BAR
    //volume bar event
    var volumeDrag = false;
    $('.volume').on('mousedown', function (e)
    {
        if (!showsuccess)
            return;
        volumeDrag = true;
        video[0].muted = false;
        $('.sound').removeClass('muted');
        updateVolume(e.pageX);
    });
    $(document).on('mouseup', function (e)
    {
        if (volumeDrag)
        {
            volumeDrag = false;
            updateVolume(e.pageX);
        }
    });
    $(document).on('mousemove', function (e)
    {
        if (volumeDrag && showsuccess)
        {
            updateVolume(e.pageX);
        }
    });
    var updateVolume = function (x, vol)
    {
        var volume = $('.volume');
        var percentage;
        //if only volume have specificed
        //then direct update volume
        if (vol)
        {
            percentage = vol * 100;
        }
        else
        {
            var position = x - volume.offset().left;
            percentage = 100 * position / volume.width();
        }

        if (percentage > 100)
        {
            percentage = 100;
        }
        if (percentage < 0)
        {
            percentage = 0;
        }

        //update volume bar and video volume
        $('.volumeBar').css('width', percentage + '%');
        video[0].volume = percentage / 100;

        //change sound icon based on volume
        if (video[0].volume == 0)
        {
            $('.sound').removeClass('sound2').addClass('muted');
        }
        else if (video[0].volume > 0.5)
        {
            $('.sound').removeClass('muted').addClass('sound2');
        }
        else
        {
            $('.sound').removeClass('muted').removeClass('sound2');
        }

    };

    //Time format converter - 00:00
    var timeFormat = function (seconds)
    {
        var m = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
        var s = Math.floor(seconds - (m * 60)) < 10 ? "0" + Math.floor(seconds - (m * 60)) : Math.floor(seconds - (m * 60));
        return m + ":" + s;
    };
    if (video[0].muted)
    {
        $("#mutebutton").html('<svg class="icon-sound" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <g> <g> <path fill="white" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d=" M47.205,308.271h106.337l163.207-163.205V66.75L179.782,203.721H47.205c-12.317,0-22.303,9.986-22.303,22.303v59.939 C24.902,298.274,34.888,308.271,47.205,308.271z" /> <polygon fill="white" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points=" 212.729,341.215 316.748,445.238 316.748,237.203 " /> </g> <path fill="white" d="M442.856,38.189c7.613-7.612,19.961-7.612,27.574,0l0,0c7.613,7.613,7.613,19.957,0,27.58L62.375,473.803 c-7.623,7.623-19.962,7.623-27.574,0l0,0c-7.623-7.601-7.623-19.95,0-27.573L442.856,38.189z" /> <path fill="white" d="M432.13,130.19c61.616,89.049,53.002,212.365-26.225,291.591c-4.355,4.355-4.355,11.413,0,15.769 c2.179,2.178,5.032,3.268,7.885,3.268c2.854,0,5.707-1.09,7.886-3.268c87.938-87.938,96.553-225.33,26.386-323.297L432.13,130.19z" /> </g> </svg>');
    }
    else
    {

        $("#mutebutton").html('<svg  class="icon-sound" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <g> <path fill="white" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d=" M319.396,47.722l-145.663,145.67H32.735c-13.099,0-23.719,10.621-23.719,23.719v63.746c0,13.094,10.621,23.726,23.719,23.726 h141.002l145.658,145.665V47.722z"/> <path d="M422.602,445.544c-3.034,0-6.069-1.158-8.385-3.475c-4.633-4.633-4.633-12.138,0-16.77 c94.785-94.786,94.785-249.032,0-343.834c-4.633-4.633-4.633-12.138,0-16.771c4.632-4.633,12.137-4.633,16.77,0 c104.039,104.051,104.039,273.335,0,377.375C428.671,444.386,425.636,445.544,422.602,445.544z"/> </g> </svg>');

    }
});
document.onerror = function (a, b, c) { document.getElementById("p").innerHTML += a + b + c; };

var control = { horizontal: { height: 150, width: undefined }, vertical: { width: 150, height: undefined }, style: "" }
function resize(icons, rect)
{
    var arr_rects = [rect];

    for (var i = 0, leni = icons.length; i < leni; i++)
    {
        for (var j = 0, lenj = arr_rects.length; j < lenj; j++)
        {
            var recti = arr_rects[j];
            var icon = icons[i];
            if (rect.width > rect.height)
            {
                if (intersectRect({ top: recti.y, left: recti.x, bottom: recti.y + recti.height, right: recti.x + recti.width }, { top: icon.y, left: icon.x, bottom: icon.y + icon.height, right: icon.x + icon.width }))
                {
                    arr_rects.splice(j, 1);
                    arr_rects.push({ x: recti.x, y: recti.y, width: icon.x - recti.x, height: recti.height }, { x: icon.x + icon.width, y: rect.y, width: recti.x + recti.width - icon.x - icon.width, height: recti.height })
                }
            }
            else
            {
                if (intersectRect({ top: recti.y, left: recti.x, bottom: recti.y + recti.height, right: recti.x + recti.width }, { top: icon.y, left: icon.x, bottom: icon.y + icon.height, right: icon.x + icon.width }))
                {
                    arr_rects.splice(j, 1);
                    arr_rects.push({ x: recti.x, y: recti.y, width: recti.width, height: icon.y - recti.y }, { x: recti.x, y: icon.y + icon.height, width: recti.width, height: recti.y + recti.height - icon.y - icon.height })
                }
            }
        }
    }
    var max = { val: 0, ind: 0 };
    for (var i = 0, leni = arr_rects.length; i < leni; i++)
    {
        var recti = arr_rects[i];
        if (rect.width > rect.height)
        {
            if (recti.width > max.val)
            {
                max.val = recti.width;
                max.ind = i;
            }
        }
        else
        {
            if (recti.height > max.val)
            {
                max.val = recti.height;
                max.ind = i;
            }
        }
    }
    var res = arr_rects[max.ind];
    res.bigger = rect.width > rect.height ? "width" : "height";
    res.val = res[res.bigger];
    return res;
}
function intersectRect(a, b)
{
    return (a.left <= b.right &&
        b.left <= a.right &&
        a.top <= b.bottom &&
        b.top <= a.bottom)
}
var screen = require('electron').screen, display = screen.getPrimaryDisplay();
var iw = display.workAreaSize.width, ih = display.workAreaSize.height;
function showcontrolcb(icons)
{
    var controlel = document.getElementById("control");


    var nesbat = { width: iw, height: 100 };
    nesbat = nesbat.height / nesbat.width;
    var control = { x: 0, y: 0, w: iw, h: ih };

    var arr_icons = icons.icons;
    var count = 0, rect_prev;
    while (true)
    {
        var arr_rect = [];
        arr_rect.push({ x: 0, y: ih - 100 - count * 1, width: iw, height: 100 }, { x: iw - 100 - count * 1, y: 0, width: 100, height: ih }, { x: 0, y: count * 1, width: iw, height: 100 }, { x: count * 1, y: 0, width: 100, height: ih });

        //arr_rect.map(function (xx) { var res = resize(arr_icons, xx); return res; })
        for (var i = 0, leni = arr_rect.length; i < leni; i++)
        {
            arr_rect[i] = resize(arr_icons, arr_rect[i]);
        }

        var max = { val: 0, ind: 0 };
        for (var i = 0, leni = arr_rect.length; i < leni; i++)
        {
            var recti = arr_rect[i];
            if (recti[recti.bigger] > max.val)
            {
                max.val = recti[recti.bigger];
                max.ind = i;
            }
        }
        var res = arr_rect[max.ind];
        res.val = res[res.bigger];

        res.count = count;
        if (rect_prev)
        {
            if (rect_prev.val >= res.val * 0.3)
            {
                rect = rect_prev;
                break;
            }

        }

        rect_prev = res;
        count++;
    }
    if (rect.width > rect.height)
    {
        $(".control").attr("class", "control");
        $(".progress-bar").attr("class", "progress-bar");
        $('.progress').css("width", "90%");
        $('.progress').css("height", "80%");
        control.style = "horizontal";
        $('.timeBar').css("height", 100 + '%');
        progressprop = "width";

    }
    else
    {
        $(".control").attr("class", "control vert");
        $(".progress-bar").attr("class", "progress-bar vert");
        $('.progress').css("width", "80%");
        $('.progress').css("height", "90%");
        control.style = "vertical";
        progressprop = "height";
        $('.timeBar').css("width", 100 + '%');

    }

    controlel.style.display = "block";
    controlel.style.left = rect.x + "px";
    controlel.style.top = rect.y + "px";
    controlel.style.width = rect.width + "px";
    controlel.style.height = rect.height + "px";

    controlel.style.display = "block";
    setTimeout(function ()
    {
        controlel.style.opacity = "0.9";
        setTimeout(function () { showingcontrol = true; }, 400);
    }, 15)

}
function showcontrol(icons)
{
    if (icons == undefined)
    {
        displayus.getDesktopIcons(function (icons)
        {
            showcontrolcb(icons);

        })
    }
    else
        showcontrolcb(icons);


}
//http://stackoverflow.com/a/13941655
function underelement(elem, e)
{
    var elemWidth = $(elem).width();
    var elemHeight = $(elem).height();
    var elemPosition = $(elem).offset();
    var elemPosition2 = new Object;
    elemPosition2.top = elemPosition.top + elemHeight;
    elemPosition2.left = elemPosition.left + elemWidth;
    e = displayus.getMouseInfo().pos;
    return ((e.x > elemPosition.left && e.x < elemPosition2.left) && (e.y > elemPosition.top && e.y < elemPosition2.top));
}
var showingtype;
var showingcontrol = false;
function togglecontrol(opts)
{
    if (!opts.ondesktop || opts.cursoriconpointing.onicon)
        return;

    if (!showingcontrol)
    {
        
        if (showingtype == "vid")
        {
            showcontrol();
            if (!underelement("#control"))
                hidecontroltimeout = setTimeout(hidecontrol, hidecontroltime);
        }
    }
    else
    {
        hidecontrol();
    }

}
function hidecontrol()
{
    var controlel = document.getElementById("control");
    controlel.style.opacity = "0";
    setTimeout(function ()
    {
        controlel.style.display = "none";
        showingcontrol = false;
    }, 400);
    if (hidecontroltimeout) clearTimeout(hidecontroltimeout);
}
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
    var a = { left: x1, top: y1, right: w1 + x1, bottom: h1 + y1 };
    var b = { left: x2, top: y2, right: w2 + x2, bottom: h2 + y2 };
    return (a.left <= b.right &&
        b.left <= a.right &&
        a.top <= b.bottom &&
        b.top <= a.bottom)
}
var hidecontroltime = 2500;
var hidecontroltimeout;
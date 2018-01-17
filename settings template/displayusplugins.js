window.addEventListener("load", () =>
{
    setclass();
    window.addEventListener("DOMSubtreeModified", setclass);
});
function setclass()
{
        var config = {
            duration: 500,
            delay: 200
        };
        
        Array.from(document.querySelectorAll(".dusplugintempl")).forEach((el) => { if (el.tagName.toLowerCase() == "button") Waves.attach(el, 'waves-light'); });
        Waves.init(config);

        Array.from(document.querySelectorAll("select.dusplugintempl")).forEach((el) => { selectsetclass(el); });
}

function selectsetclass(el)
{
    $(el).dropdown();
}
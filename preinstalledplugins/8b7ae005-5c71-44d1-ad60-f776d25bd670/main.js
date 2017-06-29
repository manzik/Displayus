var fs = require("fs");
module.exports = function (displayus)
{
    displayus.on("itemdelete", onitemdelete)
}
function onitemdelete(item)
{
    fs.exists(item.icon, (exists) =>
    {
        fs.unlink(item.icon);
    });
    
}
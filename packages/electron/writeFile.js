const path = require('path');
var fs = require("fs");

let WriteFile = (path, content) => {
    fs.writeFileSync(path, content, (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
    })
}

let DirName = path.join(__dirname, '')

module.exports.WriteFile = WriteFile;
module.exports.DirName = DirName;
var app = require('express')()
var config = require('../config')

module.exports.start = function(){
    app.listen(config.port, () => {
        console.log("App running on port 3001");
    });
}
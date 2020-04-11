var chalk = require('chalk')

module.exports = function(color, mes){
    console.log(chalk[color](mes))
}
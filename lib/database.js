var fs = require('fs')
var log = require('./log')

module.exports.update = function(schema, element, value){
    let path = schema == 'status' ? './database/status.json' :
    null

    var json = JSON.parse(
        fs.readFileSync(path)
    )

    json[element] = value

    fs.writeFileSync(path, JSON.stringify(json))

}

module.exports.addToBalance = function(address, amount){
    try {
        if (!fs.existsSync(`./database/addresses/${address}`)){
            fs.writeFileSync(`./database/addresses/${address}`, JSON.stringify({
                balance: amount
            }))
        } else {
            let res = JSON.parse(fs.readFileSync(`./database/addresses/${address}`))
            res.balance = Number(res.balance) + Number(amount)
          
            fs.writeFileSync(`./database/addresses/${address}`, JSON.stringify(res))
        }
    } catch (err) {
        log('red', '\n Error adjusting balance')
        throw new Error(err)
    }
}

module.exports.removeFromBalance = function(address, amount){
    try {
        let res = JSON.parse(fs.readFileSync(`./database/addresses/${address}`))
        res.balance = Number(res.balance) - Number(amount)
      
        fs.writeFileSync(`./database/addresses/${address}`, JSON.stringify(res))
    } catch (err) {
        log('red', 'Error adjusting balance')
        throw new Error(err)
    }
}
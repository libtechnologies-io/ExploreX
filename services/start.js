var config = require('../config')
var RpcClient = require('bitcoind-rpc')
var log = require('../lib/log')
var fs = require('fs')
var db_models = require('../lib/database_models')
var server = require('../lib/server')
var database = require('../lib/database')
var bitcoin = require('genesis-js')
var cliProgress = require('cli-progress')

module.exports = function() {

    if (!fs.existsSync('./database')) {
        log('yellow', 'Database not detected, creating new ...')
        fs.mkdirSync('./database');
        fs.mkdirSync('./database/addresses')
        fs.writeFileSync('./database/status.json', JSON.stringify(db_models.status))
    }

    server.start()

    log('green', 'Connecting to daemon ...')

    var rpc = new RpcClient({
        protocol: 'http',
        user: config.daemon.user,
        pass: config.daemon.password,
        host: config.daemon.host,
        port: config.daemon.port,
    })

    // set network parmiters
    bitcoin.networks.bitcoin = {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
          public: config.networkParamiters.ext_publicKey,
          private: config.networkParamiters.ext_privateKey,
        },
        pubKeyHash: config.networkParamiters.publicKey,
        scriptHash: config.networkParamiters.script,
        wif: config.networkParamiters.privateKey,
        }

    sync(rpc)

}

function sync(rpc){

    try {
        var localHeight = JSON.parse(fs.readFileSync('./database/status.json')).blockheight
    } catch (e) {
        fs.writeFileSync('./database/status.json', JSON.stringify(db_models.status))
        var localHeight = -1
    }

    try {
        rpc.getBlockCount(function(err, res){
            if (!res) log('red', 'Error within daemon')
            else initSync(rpc, res.result, localHeight)
        })
    } catch (e) {
        log('red', 'Unable to conenct to daemon> check your RPC cridentials and try again')
    }

}

function initSync(rpc, daemonHeight, localHeight){

    log('yellow', `Starting sync at  ${localHeight + 1}`)

    getBlock(rpc, localHeight + 1)
}


function getBlock(rpc, n){
    //get full block deatils
    rpc.getBlockHash(n, function(err1, blockHash){
        if (!err1) {
            rpc.getBlock(blockHash.result, function(err2, fullBlock){
                if (!err2) {
                    console.log(`Block: ${n} hash: ${blockHash.result}`)
                    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                    bar.start(100, 0);
                    let barIntervals = 100 / fullBlock.result.tx.length
                    let progress = 0
                    fullBlock.result.tx.forEach((txid, txIndex) => {
                        setTimeout(() => {
                            progress = progress + barIntervals
                            bar.update(progress);
                            processTransaction(rpc, txid)
                            if (txIndex == fullBlock.result.tx.length - 1){
                                bar.stop();
                                database.update('status', 'blockheight', n)
                                getBlock(rpc, n + 1)
                            }
                        }, 10 * txIndex)
                    })
                }
            })
        }
    })
}

function processTransaction(rpc, txid){
    getDecodedTransaction(rpc, txid, function(txResult){
        if (txResult.vin !== undefined && txResult.vout !== undefined){
            if (txResult.vin.length !== 0 && txResult.vin[0].txid !== undefined){ // Minded input or sheilded transaction
                txResult.vin.forEach(vin => {
                    //get value of vin to deduct from balance
                    getDecodedTransaction(rpc, vin.txid, function(vinDecodedTx){
                        let vinAddress = getVinAddress(vin.scriptSig.asm)
                        let vinValue = vinDecodedTx.vout[vinDecodedTx.vout.findIndex((x) => x.scriptPubKey.addresses[0] === vinAddress)].value
                        database.removeFromBalance(vinAddress, vinValue)
                    })
                })
            }
            txResult.vout.forEach(vout => {
                database.addToBalance(vout.scriptPubKey.addresses[0], vout.value)
            })
        }
    })
}

function getDecodedTransaction(rpc, txid, cb){
    rpc.getRawTransaction(txid, function(err1, txhex){
        if (!err1) {
            rpc.decodeRawTransaction(txhex.result, function(err2, tx){
                if (!err2) {
                    cb(tx.result)
                }
            })
        }
    })
}

function getVinAddress(asm){
    let x = asm.indexOf('[') + 6
    // get address from public key
     var buff  = Buffer.from(asm.slice(x, asm.length), 'hex')
     return bitcoin.ECPair.fromPublicKeyBuffer(buff).getAddress()
     
}
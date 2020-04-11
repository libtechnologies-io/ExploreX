<p align="center">
  <img src="docs/explorex.png" >
</p>

# ExploreX (In Development)

* :blue_book: See the docs [here](https://github.com/libtechnologies-io/ExploreX/blob/master/docs)
* :globe_with_meridians: Created by [L.I.B. Technologies](https://libtechnologies.io)

ExploreX is designed with simplicity and universality in mind. The purpose is to provide an explorer / api solution to all UTXO based
cryptocurrencies that provides the required infrastructure to build use cases and applications for crypto projects. If ExploreX is not
compatible with your project please feel to [contibute](#Contributing) with support for your project or reach out to [@wkibbler](https://github.com/wkibbler)

## Usage
Clone the repo
```
git clone https://github.com/libtechnologies-io/ExploreX && cd ExploreX
```
Make the required changes to config/index.js
```javascript
module.exports = {
    name: 'Bitcoin', // Display name for explorer
    ticker: 'BTC', // Display ticker for explorer
    daemon: {
        port: 8332, // RPC port
        host: '127.0.0.1', // IP of node
        user: 'user', // rpc username
        password: 'password' // rpc password
    },
    port: 3001, // Port for ExploreX to run on
    networkParamiters: { // Network prefixes in HEX format
        publicKey: 0x1CB8, // https://github.com/bitcoin/bitcoin/blob/master/src/chainparams.cpp#L125
        script: 0x1CBD, // https://github.com/bitcoin/bitcoin/blob/master/src/chainparams.cpp#L126
        privateKey: 0x80, // https://github.com/bitcoin/bitcoin/blob/master/src/chainparams.cpp#L127
        ext_publicKey: 0x0488B21E, // https://github.com/bitcoin/bitcoin/blob/master/src/chainparams.cpp#L128
        ext_privateKey: 0x0488ADE4 // https://github.com/bitcoin/bitcoin/blob/master/src/chainparams.cpp#L129
    }
}
```
Run the project
```
npm install 
npm start
```

## Contributing

If you contribution is to provide support for project specfic features such as masternode tracking that does no apply to all projects make
sure you can turn the feature on and off in the configuration file.

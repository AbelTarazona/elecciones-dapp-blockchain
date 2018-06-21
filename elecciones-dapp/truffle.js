module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.2",
      port: 7545,
      network_id: "*" // Match any network id
    }
  }
};

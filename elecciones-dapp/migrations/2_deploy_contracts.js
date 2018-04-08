var Elecciones = artifacts.require("./Elecciones.sol");

module.exports = function(deployer) {
  deployer.deploy(Elecciones);
};

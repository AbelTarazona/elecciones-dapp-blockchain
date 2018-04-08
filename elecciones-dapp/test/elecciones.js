var Elecciones = artifacts.require("./Elecciones.sol");

contract("Elecciones", function(accounts) {

    var eleccionesInstance;

    //Test para ver si tenemos una cantidad X de candidatos
    it("inicializa con tres candidatos", function(){
        return Elecciones.deployed().then(function(instance){
            return instance.candidatosCount();
        }).then(function(count){
            assert.equal(count, 3);
        });
    });

    //Test para ver si tienen los datos correctos los candidatos
    it("inicializa con los valores correctos de los candidatos", function(){
        return Elecciones.deployed().then(function(instance){
            eleccionesInstance = instance;
            return eleccionesInstance.candidatos(1);
        }).then(function(candidato){ //atributos del candidato 1
            assert.equal(candidato[0], 1, "contiene el ID correcto");
            assert.equal(candidato[1], "PPK", "contiene el nombre correcto");
            assert.equal(candidato[2], 0, "contiene la cantidad de votos correcto");
            return eleccionesInstance.candidatos(2);
        }).then(function(candidato){
            assert.equal(candidato[0], 2, "contiene el ID correcto");
            assert.equal(candidato[1], "Keiko", "contiene el nombre correcto");
            assert.equal(candidato[2], 0, "contiene la cantidad de votos correcto");
            return eleccionesInstance.candidatos(3);
        }).then(function(candidato){
            assert.equal(candidato[0], 3, "contiene el ID correcto");
            assert.equal(candidato[1], "Alan", "contiene el nombre correcto");
            assert.equal(candidato[2], 0, "contiene la cantidad de votos correcto");
        });
    });

    //Permitir a un votante emitir su voto
    it("permitir a un votante emitir su voto", function(){
        return Elecciones.deployed().then(function(instance){
            eleccionesInstance = instance;
            candidatoID = 1;
            return eleccionesInstance.vote(candidatoID, { from: accounts[0] });
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "evento fue activado");
            assert.equal(receipt.logs[0].event, "votedEvento", "El tipo de evento es correcto");
            assert.equal(receipt.logs[0].args._candidatoID.toNumber(), candidatoID, "el id del candidato es correcto");
            return eleccionesInstance.votantes(accounts[0]);
        }).then(function(voted){
            assert(voted, "El votante fue marcado como votante");
            return eleccionesInstance.candidatos(candidatoID);
        }).then(function(candidato){
            var voteCount = candidato[2];
            assert.equal(voteCount, 1, "Incremento el voto del candidato");
        })
    });

    //Excepcion para candidatos invalidos
    it("lanza una excepción para candidatos inválidos", function() {
        return Elecciones.deployed().then(function(instance) {
          eleccionesInstance = instance;
          return eleccionesInstance.vote(99, { from: accounts[1] })
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, "el mensaje de error debe contener revertir");
          return eleccionesInstance.candidatos(1);
        }).then(function(candidate1) {
          var voteCount = candidate1[2];
          assert.equal(voteCount, 1, "el candidato 1 no recibió ningún voto");
          return eleccionesInstance.candidatos(2);
        }).then(function(candidate2) {
          var voteCount = candidate2[2];
          assert.equal(voteCount, 0, "el candidato 2 no recibió ningún voto");
        });
      });
    
      it("lanza una excepcion para votos dobles", function() {
        return Elecciones.deployed().then(function(instance) {
          eleccionesInstance = instance;
          candidatoID = 2;
          eleccionesInstance.vote(candidatoID, { from: accounts[1] });
          return eleccionesInstance.candidatos(candidatoID);
        }).then(function(candidate) {
          var voteCount = candidate[2];
          assert.equal(voteCount, 1, "primer voto aceptado");
          // Intentar votar de nuevo
          return eleccionesInstance.vote(candidatoID, { from: accounts[1] });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
          return eleccionesInstance.candidatos(1);
        }).then(function(candidate1) {
          var voteCount = candidate1[2];
          assert.equal(voteCount, 1, "el candidato 1 no recibió ningún voto");
          return eleccionesInstance.candidatos(2);
        }).then(function(candidate2) {
          var voteCount = candidate2[2];
          assert.equal(voteCount, 1, "el candidato 2 no recibió ningún voto");
        });
    });
});
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  //Inicializa la conex. del lado cliente a nuestro blockchain local (con metamask con conectamos a la 
  // red de etherium)
  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // Si Meta Mask ya proporciona una instancia web3.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Especifique la instancia predeterminada si no se proporciona una instancia de web3
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract(); //Una vez conectado inicializamos el contrato
  },

  //Renderiza todo nuestro codigo que aparece en formato JSON
  initContract: function() {
    $.getJSON("Elecciones.json", function(election) {
      // Crear una instancia de un nuevo contrato de truffle del artefacto
      App.contracts.Elecciones = TruffleContract(election);
      // Conectar proveedor para interactuar con contrato
      App.contracts.Elecciones.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Escuche los eventos emitidos por el SC
  listenForEvents: function() {
    App.contracts.Elecciones.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvento({}, { //mostrar los atributos del bloque
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("evento activado", event)
        // recargar cuando un voto es registrado
        App.render();
      });
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    var mensaje = $("#mensajeVoto");

    loader.show();
    content.hide();
    mensaje.hide();

    // Mostrar data de la cuenta
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Tu cuenta: " + account);
      }
    });

    // Mostrar data del contrato
    App.contracts.Elecciones.deployed().then(function(instance) { //obtenemos una copia de nuestro contrato desplegado
      electionInstance = instance;
      return electionInstance.candidatosCount();
    }).then(function(candidatosCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      //Listamos nuestros candidatos
      for (var i = 1; i <= candidatosCount; i++) {
        electionInstance.candidatos(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Presentar la opción de votación candidata
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
     return electionInstance.votantes(App.account);
    }).then(function(hasVoted) {
      // no permitir al usuario votar
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
      mensaje.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Elecciones.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#mensajeVoto").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

pragma solidity ^0.4.2;

contract Elecciones {
    //Modelar un candidato
    struct Candidato{
        uint id;
        string nombre;
        uint votoCount;
    }

    //Almacenar cuentas que han votado
    mapping (address=>bool) public votantes;
    //Almacenamos un candidato usando Hash Table
    mapping (uint=>Candidato) public candidatos;

    //Almacenar cantidad candidatos (No se puede recorrer el Hash)
    uint public candidatosCount;

    //evento voto
    event votedEvento (
        uint indexed _candidatoID
    );

    //Constructor
    function Elecciones() public {
        //Agregamos candidatos
        addCandidato("PPK");
        addCandidato("Keiko");
        addCandidato("Alan");
    }

    //Nos permite contabilizar la cantidad de candidatos y agregarlos
    function addCandidato(string _nombre) private {
        candidatosCount++;
        candidatos[candidatosCount] = Candidato(candidatosCount, _nombre, 0);
    }

    function vote(uint _candidatoID) public {

        //requerir que no haya votado antes
        require(!votantes[msg.sender]); //si es falso se sale del metodo


        //requerir un candidato valido
        require(_candidatoID > 0 && _candidatoID <= candidatosCount);

        //registrar al votante
        //con msg sender automaticamente tenemos la direccion de cuenta del que registra
        votantes[msg.sender] = true;

        // actualizar cantidad de voto del candidato
        candidatos[_candidatoID].votoCount ++;

        // activar evento votado
        votedEvento(_candidatoID);
    }

}
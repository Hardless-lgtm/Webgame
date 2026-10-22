let state = "quarto";

let dados;

let dialogoAtual;
let indiceFala = 0;

// CENARIOS -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function atualizarTela() { // state = "quarto"
    let cenarioAtual = dados.cenarios[state]; // dados.cenarios["quarto"]

    document.getElementById("fundo").src = cenarioAtual.fundo; // "imagens/quarto.png"

    let interact = document.querySelectorAll("[data-cenario]");  

    for (let item of interact) {  // item = <div id="personagem" data-cenario="cozinha">
        if (item.dataset.cenario === state) { // item.dataset.cenario = "quarto" === "quarto"
            item.style.display = "block"; // mostra o item
        } else {
            item.style.display = "none"; // esconde o item
        }
    }
}

function mudarCenario(destino) {
    state = destino;
    atualizarTela();
}

// DIALOGO -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function mostrarFala() {
    let fala = dialogoAtual.falas[indiceFala];

    document.getElementById("remetente").textContent = fala.remetente;
    document.getElementById("conteudo-dialogo").textContent = fala.conteudo;

    let protagonista = document.getElementById("protagonista-dialogo");
    let personagem = document.getElementById("personagem-dialogo");

    if (fala.remetente === "Você") {
        protagonista.className = "destaque";
        personagem.className = "escuro";
    } else {
        protagonista.className = "escuro";
        personagem.className = "destaque";
    }
}

function iniciarDialogo(idInteragivel) {
    for (let chave in dados.dialogos) {
        let dialogo = dados.dialogos[chave];

        if (dialogo.interagivel === idInteragivel) {
            dialogoAtual = dialogo;
            indiceFala = 0;

            document.getElementById("dialogo").style.display = "block";
            document.getElementById("filtro-dialogo").style.display = "block";
            document.getElementById("personagem-dialogo").style.display = "flex";
            document.getElementById("protagonista-dialogo").style.display = "flex";

            mostrarFala();
            break;
        }
    }
}

// CARREGAR DADOS -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
fetch("dados.json")
    .then(function(resposta) {
        return resposta.json();
    })
    .then(function(conteudo) {
        dados = conteudo;
        console.log(dados);
        console.log(dados.cenarios.quarto);
        atualizarTela();
    });

// EVENTOS -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
let portas = document.querySelectorAll("[data-destino]");

for (let porta of portas) {
    porta.addEventListener(
        "click",
        mudarCenario.bind(null, porta.dataset.destino)
    );
};

document.getElementById("personagem").addEventListener("click", function() {iniciarDialogo("personagem")});

document.getElementById("continuar-dialogo").addEventListener(
    "click",
    function() {
        indiceFala++;

        if (indiceFala < dialogoAtual.falas.length) {
            mostrarFala();
        } else {
        document.getElementById("dialogo").style.display = "none";
        document.getElementById("filtro-dialogo").style.display = "none";
        document.getElementById("personagem-dialogo").style.display = "none";
        document.getElementById("protagonista-dialogo").style.display = "none";

        dialogoAtual = null;
        }
    }
);
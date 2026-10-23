//#region ESTADO DO JOGO
// Guarda o cenário atual, os dados carregados e a posição da fala exibida.
//#region VARIAVEIS -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
let state = "quarto";

let dados;

let dialogoAtual;
let indiceFala = 0;
//#endregion
//#endregion

//#region CENÁRIOS
// Atualiza o cenário e alterna a visibilidade dos elementos associados a cada local.
//#region CENÁRIOS -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function atualizarTela() { // state = "quarto"
    let cenarioAtual = dados.cenarios[state]; // Busca no JSON os dados do cenário selecionado.

    document.getElementById("fundo").src = cenarioAtual.fundo; // Atualiza a imagem de fundo para a imagem deste cenário.

    let interact = document.querySelectorAll("[data-cenario]"); // Seleciona portas e personagens que pertencem a algum cenário.

    for (let item of interact) {
        if (item.dataset.cenario === state) { // Compara o cenário do elemento com o cenário atual.
            item.style.display = "block"; // Mostra o elemento que pertence ao cenário atual.
        } else {
            item.style.display = "none"; // Esconde os elementos dos outros cenários.
        }
    }
}

// Troca o cenário atual e redesenha a tela.
function mudarCenario(destino) {
    state = destino; // Salva qual cenário deve ser mostrado.
    atualizarTela();
}
//#endregion
//#endregion

//#region DIÁLOGOS
// Exibe a fala atual e destaca visualmente quem está falando.
//#region DIÁLOGO -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function mostrarFala() {
    let fala = dialogoAtual.falas[indiceFala]; // Busca a fala atual usando sua posição na lista.

    document.getElementById("remetente").textContent = fala.remetente; // Exibe o nome de quem está falando.
    document.getElementById("conteudo-dialogo").textContent = fala.conteudo; // Exibe o texto da fala.

    let protagonista = document.getElementById("protagonista-dialogo"); // Obtém a representação do protagonista na conversa.
    let personagem = document.getElementById("personagem-dialogo"); // Obtém a representação do NPC na conversa.

    if (fala.remetente === "Você") { // Usa o nome do remetente para descobrir quem está falando.
        protagonista.className = "destaque"; // Ilumina o protagonista enquanto ele fala.
        personagem.className = "escuro"; // Escurece o NPC enquanto ele não fala.
    } else {
        protagonista.className = "escuro"; // Escurece o protagonista enquanto ele não fala.
        personagem.className = "destaque"; // Ilumina o NPC enquanto ele fala.
    }
}

// Localiza o diálogo do elemento clicado e inicia pela primeira fala.
function iniciarDialogo(idInteragivel) {
    for (let chave in dados.dialogos) { // Percorre os diálogos definidos no arquivo de dados.
        let dialogo = dados.dialogos[chave]; // Obtém os dados do diálogo desta chave.

        if (dialogo.interagivel === idInteragivel) { // Confere se o diálogo pertence ao elemento clicado.
            dialogoAtual = dialogo; // Guarda o diálogo encontrado para avançar suas falas.
            indiceFala = 0; // Começa sempre pela primeira fala.

            // Exibe a caixa, o filtro escuro e os dois personagens da conversa.
            document.getElementById("dialogo").style.display = "block";
            document.getElementById("filtro-dialogo").style.display = "block";
            document.getElementById("personagem-dialogo").style.display = "flex";
            document.getElementById("protagonista-dialogo").style.display = "flex";

            mostrarFala();
            break; // Interrompe a busca porque o diálogo correspondente já foi encontrado.
        }
    }
}
//#endregion
//#endregion

//#region CARREGAMENTO DOS DADOS
// Carrega os cenários e diálogos do arquivo JSON antes de desenhar a tela.
//#region CARREGAR DADOS -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

fetch("dados.json")
    .then(function(resposta) {
        return resposta.json(); // Converte o conteúdo recebido de JSON para um objeto JavaScript.
    })
    .then(function(conteudo) {
        dados = conteudo; // Guarda os cenários e diálogos para as outras funções usarem.
        console.log(dados); // Mostra os dados carregados no console para facilitar a depuração.
        console.log(dados.cenarios.quarto); // Exibe os dados do quarto como exemplo durante a depuração.
        atualizarTela(); // Desenha o cenário inicial depois que os dados estiverem disponíveis.
    });

//#endregion
//#endregion

//#region EVENTOS DA INTERFACE
// Conecta cliques nas portas, personagens interagíveis e botão de diálogo.
//#region EVENTOS -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

//#region Criação das Portas
let portas = document.querySelectorAll("[data-destino]"); // Seleciona cada porta que declara para onde leva.

for (let porta of portas) {
    porta.addEventListener(
        "click",
        mudarCenario.bind(null, porta.dataset.destino) // Prepara a troca de cenário usando o destino desta porta.
    );
};
//#endregion

//#region Iniciar e Continuar Diálogos
let interagiveis = document.querySelectorAll('[data-tipo="interagivel"]'); // Seleciona elementos que podem iniciar uma conversa.

for (let item of interagiveis) {
    item.addEventListener("click",
        function() {
            iniciarDialogo(item.id); // Usa o ID do elemento para localizar seu diálogo.
        });
}

document.getElementById("continuar-dialogo").addEventListener(
    "click",
    function() { 
        indiceFala++; // Avança para a próxima posição na lista de falas.

        if (indiceFala < dialogoAtual.falas.length) { // Confere se ainda existe uma fala nessa posição.
            mostrarFala();
        } else { // Quando não há mais falas, fecha a conversa e limpa seu estado.
        document.getElementById("dialogo").style.display = "none";
        document.getElementById("filtro-dialogo").style.display = "none";
        document.getElementById("personagem-dialogo").style.display = "none";
        document.getElementById("protagonista-dialogo").style.display = "none";

        dialogoAtual = null; // Indica que não existe mais um diálogo em andamento.
        }
    }
);
//#endregion

//#endregion
//#endregion
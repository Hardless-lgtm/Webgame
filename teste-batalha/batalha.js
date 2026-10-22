
let arena = document.getElementById("arena");
let alma = document.getElementById("alma");
let campo = document.getElementById("campo");

let projeteis = [];

// CONFIGURAÇÕES DOS ATAQUES
let configuracoesAtaque = {
    linhaReta: {
        quantidade: 4,
        intervalo: 1000,
        velocidade: 3,

        posicoes: [
            { x: -20, y: 50 },
            { x: 620, y: 100 },
            { x: 200, y: -20 },
            { x: 400, y: 370 }
        ]
    },

    parede: {
        fileiras: 10,
        intervalo: 500,
        velocidade: 5,
        espacamento: 18,
        tamanhoAbertura: 4
    }
};

// METADE DO TAMANHO DA ALMA
let raioAlma = alma.offsetWidth / 2;

// POSIÇÃO INICIAL DA ALMA
alma.style.left = arena.clientWidth / 2 + "px";
alma.style.top = arena.clientHeight / 2 + "px";

// MOVIMENTO DA ALMA
window.addEventListener("mousemove", function(event) {
    let limites = arena.getBoundingClientRect();

    let x = event.clientX - limites.left - arena.clientLeft;
    let y = event.clientY - limites.top - arena.clientTop;

    x = Math.max(raioAlma, x);
    x = Math.min(arena.clientWidth - raioAlma, x);

    y = Math.max(raioAlma, y);
    y = Math.min(arena.clientHeight - raioAlma, y);

    alma.style.left = x + "px";
    alma.style.top = y + "px";
});

// CRIAR PROJÉTIL QUE MIRA NA ALMA
function criarProjetil(posicao, velocidade, aoSair) {
    let x = posicao.x;
    let y = posicao.y;

    let alvoX = parseFloat(alma.style.left);
    let alvoY = parseFloat(alma.style.top);

    let dx = alvoX - x;
    let dy = alvoY - y;

    let distancia = Math.sqrt(dx * dx + dy * dy);

    if (distancia === 0) {
        distancia = 1;
    }

    let velocidadeX = dx / distancia * velocidade;
    let velocidadeY = dy / distancia * velocidade;

    criarProjetilDirecional(
        posicao,
        velocidadeX,
        velocidadeY,
        aoSair
    );
}

// CRIAR PROJÉTIL COM DIREÇÃO DEFINIDA
function criarProjetilDirecional(
    posicao,
    velocidadeX,
    velocidadeY,
    aoSair
) {
    let elemento = document.createElement("div");
    elemento.classList.add("projetil");

    campo.appendChild(elemento);

    let projetil = {
        elemento: elemento,
        x: posicao.x,
        y: posicao.y,
        velocidadeX: velocidadeX,
        velocidadeY: velocidadeY,
        entrouNaArena: false,
        aoSair: aoSair
    };

    projeteis.push(projetil);

    posicionarProjetil(projetil);
}

// AJUSTAR A POSIÇÃO VISUAL DO PROJÉTIL
function posicionarProjetil(projetil) {
    let limitesArena = arena.getBoundingClientRect();
    let limitesCampo = campo.getBoundingClientRect();

    let x = limitesArena.left - limitesCampo.left
        - campo.clientLeft + arena.clientLeft + projetil.x;

    let y = limitesArena.top - limitesCampo.top
        - campo.clientTop + arena.clientTop + projetil.y;

    projetil.elemento.style.left = x + "px";
    projetil.elemento.style.top = y + "px";
}

// VERIFICAR COLISÃO ENTRE PROJÉTIL E ALMA
function verificarColisao(projetil) {
    let almaX = parseFloat(alma.style.left);
    let almaY = parseFloat(alma.style.top);

    let raioProjetil = projetil.elemento.offsetWidth / 2;

    let dx = almaX - (projetil.x + raioProjetil);
    let dy = almaY - (projetil.y + raioProjetil);

    let distancia = Math.sqrt(dx * dx + dy * dy);

    return distancia <= raioAlma + raioProjetil;
}

// MOVIMENTAR E REMOVER PROJÉTEIS
function atualizarProjeteis() {
    for (let i = projeteis.length - 1; i >= 0; i--) {
        let projetil = projeteis[i];

        projetil.x += projetil.velocidadeX;
        projetil.y += projetil.velocidadeY;

        posicionarProjetil(projetil);

        // VERIFICAR COLISÃO
        if (verificarColisao(projetil)) {
            console.log("A alma foi atingida!");

            projetil.elemento.remove();
            projeteis.splice(i, 1);

            continue;
        }

        // VERIFICAR SE ENTROU NA ARENA
        let dentro =
            projetil.x + projetil.elemento.offsetWidth >= 0 &&
            projetil.x <= arena.clientWidth &&
            projetil.y + projetil.elemento.offsetHeight >= 0 &&
            projetil.y <= arena.clientHeight;

        if (dentro) {
            projetil.entrouNaArena = true;
        }

        // REMOVER QUANDO SAIR DA ARENA
        if (
            projetil.entrouNaArena &&
            (
                projetil.x < -20 ||
                projetil.x > arena.clientWidth + 20 ||
                projetil.y < -20 ||
                projetil.y > arena.clientHeight + 20
            )
        ) {
            projetil.elemento.remove();
            projeteis.splice(i, 1);

            if (projetil.aoSair) {
                projetil.aoSair();
            }
        }
    }

    requestAnimationFrame(atualizarProjeteis);
}

// INICIAR UM PADRÃO PELO NOME
function iniciarAtaque(nomePadrao, configuracao) {
    let funcaoAtaque = padroesAtaque[nomePadrao];

    if (!funcaoAtaque) {
        console.error("Padrão não encontrado:", nomePadrao);
        return;
    }

    funcaoAtaque(configuracao, function() {
        console.log("Ataque finalizado:", nomePadrao);
    });
}

// INICIAR COMBATE
atualizarProjeteis();

// ESCOLHER QUAL ATAQUE TESTAR
iniciarAtaque("parede", configuracoesAtaque.parede);

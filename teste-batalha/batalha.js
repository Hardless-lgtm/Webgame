
//#region ELEMENTOS E CONFIGURAÇÕES
// Obtém os elementos da arena e cria a lista dos projéteis ativos.
let arena = document.getElementById("arena");
let alma = document.getElementById("alma");
let campo = document.getElementById("campo");

let projeteis = [];

// CONFIGURAÇÕES DOS ATAQUES
let configuracoesAtaque = {
    // Define quantidade, intervalos em milissegundos, velocidade e posições do ataque.
    linhaReta: {
        quantidade: 9,
        intervaloAvisos: 100,
        intervaloTiros: 250,
        velocidade: 10,

        // Posições em porcentagem da tela: x vai da esquerda para a direita; y, de cima para baixo.
        posicoes: [
            { x: 16, y: 10 },
            { x: 49, y: 10 },
            { x: 84, y: 10 },
            { x: 16, y: 20 },
            { x: 49, y: 20 },
            { x: 84, y: 20 },
            { x: 16, y: 30 },
            { x: 49, y: 30 },
            { x: 84, y: 30 },
        ]
    },

    // Define quantidade e espaçamento das fileiras do ataque de parede.
    parede: {
        fileiras: 10,
        intervalo: 500,
        velocidade: 5,
        espacamento: 18,
        tamanhoAbertura: 4
    }
};
//#endregion

//#region CONTROLE DO JOGADOR
// Guarda o raio da alma para limitar seu movimento e detectar colisões.
let raioAlma = alma.offsetWidth / 2;

// Inicia a alma no centro da arena.
alma.style.left = arena.clientWidth / 2 + "px"; // clientWidth mede a largura interna da arena, sem as bordas.
alma.style.top = arena.clientHeight / 2 + "px"; // clientHeight mede sua altura interna, sem as bordas.

// Mantém a alma dentro da arena e acompanha o cursor do mouse.
window.addEventListener("mousemove", function(event) {
    let limites = arena.getBoundingClientRect(); // Lê a posição e o tamanho da arena em relação à janela do navegador.

    let x = event.clientX - limites.left - arena.clientLeft; // Tira a posição da arena e sua borda para obter o mouse dentro dela.
    let y = event.clientY - limites.top - arena.clientTop; // Faz a mesma conversão para a posição vertical.

    x = Math.max(raioAlma, x); // Impede a alma de passar pela borda esquerda.
    x = Math.min(arena.clientWidth - raioAlma, x); // Impede a alma de passar pela borda direita.

    y = Math.max(raioAlma, y); // Impede a alma de passar pela borda superior.
    y = Math.min(arena.clientHeight - raioAlma, y); // Impede a alma de passar pela borda inferior.

    alma.style.left = x + "px";
    alma.style.top = y + "px";
});
//#endregion

//#region POSIÇÕES E AVISOS DE ATAQUE
// Converte coordenadas percentuais da tela para pixels e cria avisos e projéteis.
function converterPosicaoDaTela(posicao) {
    return {
        x: Math.max(6, Math.min( // Limita X para o marcador continuar visível dentro da tela.
            window.innerWidth - 6, // innerWidth é a largura visível da janela; 6px mantém o ponto longe da borda.
            window.innerWidth * posicao.x / 100 // Transforma o percentual horizontal em pixels.
        )),
        y: Math.max(6, Math.min( // Limita Y para o marcador continuar visível dentro da tela.
            window.innerHeight - 6, // innerHeight é a altura visível da janela; 6px mantém o ponto longe da borda.
            window.innerHeight * posicao.y / 100 // Transforma o percentual vertical em pixels.
        ))
    };
}

// Mostra um marcador de aviso na posição configurada da tela.
function mostrarPontoAtaque(posicao) {
    let ponto = document.createElement("div"); // Cria um círculo de aviso novo no HTML.
    let coordenadas = converterPosicaoDaTela(posicao); // Converte os percentuais configurados para pixels na tela.
    ponto.classList.add("ponto-aviso-ataque"); // Aplica o visual definido no CSS.
    ponto.style.left = coordenadas.x + "px"; // Posiciona o centro do aviso no eixo horizontal.
    ponto.style.top = coordenadas.y + "px"; // Posiciona o centro do aviso no eixo vertical.
    document.body.appendChild(ponto); // Insere o aviso na página para que ele fique visível.
    return ponto; // Devolve o elemento para removê-lo quando o tiro for disparado.
}

// Cria um projétil que parte da posição da tela e mira na alma.
function criarProjetil(posicao, velocidade, aoSair) {
    let limitesArena = arena.getBoundingClientRect(); // Lê a posição da arena em relação à janela.
    let coordenadas = converterPosicaoDaTela(posicao);
    let x = coordenadas.x - limitesArena.left - arena.clientLeft - 6; // Traduz X da tela para a arena e desconta 6px para alinhar o centro do tiro.
    let y = coordenadas.y - limitesArena.top - arena.clientTop - 6; // Faz os mesmos ajustes no eixo vertical.

    let alvoX = parseFloat(alma.style.left); // Lê a posição horizontal da alma e transforma, por exemplo, "20px" em 20.
    let alvoY = parseFloat(alma.style.top); // Lê a posição vertical da alma em pixels.

    let dx = alvoX - (x + 6); // Distância horizontal entre o centro do projétil e a alma.
    let dy = alvoY - (y + 6); // Distância vertical entre o centro do projétil e a alma.

    let distancia = Math.sqrt(dx * dx + dy * dy); // Pitágoras: calcula a distância reta entre o tiro e a alma.

    if (distancia === 0) {
        distancia = 1; // Evita dividir por zero se o tiro já começar sobre a alma.
    }

    let velocidadeX = dx / distancia * velocidade; // Divide a direção pela distância para manter a velocidade uniforme.
    let velocidadeY = dy / distancia * velocidade; // Calcula a velocidade vertical com a mesma normalização.

    criarProjetilDirecional(
        { x: x, y: y },
        velocidadeX,
        velocidadeY,
        aoSair
    );
}
//#endregion

//#region CRIAÇÃO E POSICIONAMENTO DOS PROJÉTEIS
// Cria um projétil com posição, direção e callback ao sair da arena.
function criarProjetilDirecional(
    posicao,
    velocidadeX,
    velocidadeY,
    aoSair
) {
    let elemento = document.createElement("div"); // Cria o elemento visual que representará o projétil.
    elemento.classList.add("projetil");

    campo.appendChild(elemento);

    let projetil = { // Reúne elemento, posição, velocidade e ação de saída em um único objeto.
        elemento: elemento,
        x: posicao.x,
        y: posicao.y,
        velocidadeX: velocidadeX,
        velocidadeY: velocidadeY,
        entrouNaArena: false,
        aoSair: aoSair
    };

    projeteis.push(projetil); // Guarda o projétil para que o ciclo de animação possa atualizá-lo.

    posicionarProjetil(projetil);
}

// Converte a posição do projétil para as coordenadas visuais da área de batalha.
function posicionarProjetil(projetil) {
    let limitesArena = arena.getBoundingClientRect(); // Posição da arena em relação à janela.
    let limitesCampo = campo.getBoundingClientRect(); // Posição do contêiner onde os projéteis são desenhados.

    let x = limitesArena.left - limitesCampo.left
        - campo.clientLeft + arena.clientLeft + projetil.x; // Converte a coordenada da arena para a coordenada do contêiner.

    let y = limitesArena.top - limitesCampo.top
        - campo.clientTop + arena.clientTop + projetil.y; // Faz a conversão para o eixo vertical.

    projetil.elemento.style.left = x + "px";
    projetil.elemento.style.top = y + "px";
}
//#endregion

//#region COLISÕES E ATUALIZAÇÃO
// Informa se o projétil encostou na alma, comparando seus raios.
function verificarColisao(projetil) {
    let almaX = parseFloat(alma.style.left); // Obtém a posição da alma em pixels, sem o sufixo "px".
    let almaY = parseFloat(alma.style.top); // Obtém a posição vertical da alma em pixels.

    let raioProjetil = projetil.elemento.offsetWidth / 2; // Usa metade da largura para comparar os centros dos círculos.

    let dx = almaX - (projetil.x + raioProjetil); // Distância horizontal entre os centros.
    let dy = almaY - (projetil.y + raioProjetil); // Distância vertical entre os centros.

    let distancia = Math.sqrt(dx * dx + dy * dy); // Distância reta entre os centros dos círculos.

    return distancia <= raioAlma + raioProjetil; // Há colisão se os círculos se tocarem ou se sobrepuserem.
}

// Atualiza os projéteis, verifica colisões e remove os que saíram da arena.
function atualizarProjeteis() {
    for (let i = projeteis.length - 1; i >= 0; i--) {
        let projetil = projeteis[i]; // Percorre de trás para frente para remover itens sem pular o próximo.

        projetil.x += projetil.velocidadeX;
        projetil.y += projetil.velocidadeY;

        posicionarProjetil(projetil);

        // VERIFICAR COLISÃO
        if (verificarColisao(projetil)) {
            console.log("A alma foi atingida!");

            projetil.elemento.remove();
            projeteis.splice(i, 1); // Remove o projétil da página e da lista de atualização.

            continue;
        }

        // VERIFICAR SE ENTROU NA ARENA
        let dentro = // Checa se alguma parte do projétil entrou nos limites da arena.
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
            projeteis.splice(i, 1); // Libera o elemento e remove sua referência da lista.

            if (projetil.aoSair) {
                projetil.aoSair();
            }
        }
    }

    requestAnimationFrame(atualizarProjeteis); // Agenda a próxima atualização no próximo quadro do navegador.
}
//#endregion

//#region INÍCIO DO COMBATE
// Encontra e executa um padrão de ataque pelo nome.
function iniciarAtaque(nomePadrao, configuracao) {
    let funcaoAtaque = padroesAtaque[nomePadrao]; // Busca a função correspondente no mapa de padrões.

    if (!funcaoAtaque) {
        console.error("Padrão não encontrado:", nomePadrao);
        return;
    }

    funcaoAtaque(configuracao, function() {
        console.log("Ataque finalizado:", nomePadrao);
    });
}

// Inicia o ciclo de atualização dos projéteis.
atualizarProjeteis();

// ESCOLHER QUAL ATAQUE TESTAR
iniciarAtaque("linhaReta", configuracoesAtaque.linhaReta);
//#endregion

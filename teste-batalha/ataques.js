
//#region PADRÕES DISPONÍVEIS
// Relaciona cada nome de padrão à função que implementa o ataque.
let padroesAtaque = {
    linhaReta: ataqueLinhaReta,
    parede: ataqueParede
};
//#endregion

//#region ATAQUE EM LINHA RETA
// Exibe os avisos em sequência e, depois, dispara os projéteis nos mesmos pontos.
function ataqueLinhaReta(configuracao, aoTerminar) {
    // Guarda em separado o próximo aviso e o próximo tiro da sequência.
    let indiceAviso = 0;
    let indiceDisparo = 0;
    let ativos = 0;
    let disparosFinalizados = false;
    let finalizado = false;
    let pontosAviso = []; // Mantém as referências dos avisos para removê-los ao disparar.

    let quantidade = Math.min( // Evita tentar usar mais posições do que existem no array.
        configuracao.quantidade,
        configuracao.posicoes.length
    );

    // Finaliza o padrão quando todos os tiros saíram da arena.
    function verificarFim() {
        if (finalizado) {
            return;
        }

        if (disparosFinalizados && ativos === 0) { // Só termina depois do último disparo e da saída de todos os projéteis.
            finalizado = true;

            if (aoTerminar) {
                aoTerminar();
            }
        }
    }

    if (quantidade === 0) { // Não cria temporizadores se não houver pontos para exibir.
        disparosFinalizados = true;
        verificarFim();
        return;
    }

    // Remove o aviso correspondente e dispara o próximo projétil.
    function dispararProximo() {
        let ponto = pontosAviso[indiceDisparo]; // Recupera o aviso da posição correspondente a este tiro.
        ponto.remove(); // Apaga o aviso exatamente quando seu projétil é lançado.
        ativos++;

        criarProjetil(
            configuracao.posicoes[indiceDisparo],
            configuracao.velocidade,
            function() { // É chamado quando este projétil sai da arena.
                ativos--;
                verificarFim();
            }
        );

        indiceDisparo++;

        if (indiceDisparo >= quantidade) { // Para o temporizador depois do último tiro da sequência.
            clearInterval(intervaloDisparos);
            disparosFinalizados = true;
            verificarFim();
        }
    }

    // Mostra o próximo aviso e inicia a etapa dos tiros após o último.
    function mostrarProximoPonto() {
        pontosAviso.push(mostrarPontoAtaque(configuracao.posicoes[indiceAviso])); // Exibe e guarda o aviso desta posição.
        indiceAviso++;

        if (indiceAviso >= quantidade) { // Só começa a etapa dos tiros depois de mostrar todos os avisos.
            clearInterval(intervaloAvisos);
            intervaloDisparos = setInterval(
                dispararProximo,
                configuracao.intervaloTiros
            );
        }
    }

    let intervaloDisparos; // Guarda o temporizador dos tiros para poder encerrá-lo no final.
    let intervaloAvisos = setInterval( // Repete a exibição dos avisos no intervalo configurado.
        mostrarProximoPonto,
        configuracao.intervaloAvisos
    );
}
//#endregion

//#region ATAQUE DE PAREDE
// Dispara fileiras de projéteis com uma abertura aleatória para atravessar.
function ataqueParede(configuracao, aoTerminar) {
    let fileirasCriadas = 0;
    let ativos = 0;
    let disparosFinalizados = false;
    let finalizado = false;

    let quantidadeFileiras = configuracao.fileiras;
    let espacamento = configuracao.espacamento;
    let tamanhoAbertura = configuracao.tamanhoAbertura;

    // Finaliza o padrão quando todas as fileiras foram criadas e os tiros saíram.
    function verificarFim() {
        if (finalizado) {
            return;
        }

        if (disparosFinalizados && ativos === 0) { // Espera a criação das fileiras e a saída de todos os projéteis.
            finalizado = true;

            if (aoTerminar) {
                aoTerminar();
            }
        }
    }

    // Cria uma fileira vertical, deixando um espaço livre aleatório.
    function criarFileira() {
        let quantidade = Math.floor( // Calcula quantos projéteis cabem na altura da arena.
            (arena.clientHeight - 1) / espacamento
        ) + 1;

        // Sorteia a posição vertical da abertura
        let abertura = Math.floor( // Sorteia o índice inicial da abertura na fileira.
            Math.random() * (quantidade - tamanhoAbertura + 1)
        );

        let x = arena.clientWidth + 20; // Começa fora da borda direita para a fileira entrar na arena.

        for (let i = 0; i < quantidade; i++) {
            // Não cria projéteis na abertura
            if (i >= abertura && i < abertura + tamanhoAbertura) {
                continue;
            }

            let y = i * espacamento; // Distribui cada projétil verticalmente com o espaçamento configurado.

            ativos++;

            criarProjetilDirecional(
                { x: x, y: y },
                -configuracao.velocidade,
                0,
                function() { // Atualiza a contagem quando o projétil sair da arena.
                    ativos--;
                    verificarFim();
                }
            );
        }

        fileirasCriadas++;

        if (fileirasCriadas >= quantidadeFileiras) { // Interrompe a criação ao atingir a quantidade pedida.
            clearInterval(intervalo);
            disparosFinalizados = true;
            verificarFim();
        }
    }

    if (quantidadeFileiras <= 0) { // Encerra imediatamente se a configuração pedir zero fileiras.
        disparosFinalizados = true;
        verificarFim();
        return;
    }

    let intervalo = setInterval( // Repete a criação de fileiras até atingir a quantidade configurada.
        criarFileira,
        configuracao.intervalo
    );
}
//#endregion

let padroesAtaque = {
    linhaReta: ataqueLinhaReta,
    parede: ataqueParede
};

// ATAQUE EM LINHA RETA
function ataqueLinhaReta(configuracao, aoTerminar) {
    let indice = 0;
    let ativos = 0;
    let disparosFinalizados = false;
    let finalizado = false;

    let quantidade = Math.min(
        configuracao.quantidade,
        configuracao.posicoes.length
    );

    function verificarFim() {
        if (finalizado) {
            return;
        }

        if (disparosFinalizados && ativos === 0) {
            finalizado = true;

            if (aoTerminar) {
                aoTerminar();
            }
        }
    }

    let intervalo = setInterval(function() {
        let posicao = configuracao.posicoes[indice];

        ativos++;

        criarProjetil(
            posicao,
            configuracao.velocidade,
            function() {
                ativos--;
                verificarFim();
            }
        );

        indice++;

        if (indice >= quantidade) {
            clearInterval(intervalo);
            disparosFinalizados = true;
            verificarFim();
        }
    }, configuracao.intervalo);

    if (quantidade === 0) {
        clearInterval(intervalo);
        disparosFinalizados = true;
        verificarFim();
    }
}

// PAREDE DE PROJÉTEIS COM ABERTURA
function ataqueParede(configuracao, aoTerminar) {
    let fileirasCriadas = 0;
    let ativos = 0;
    let disparosFinalizados = false;
    let finalizado = false;

    let quantidadeFileiras = configuracao.fileiras;
    let espacamento = configuracao.espacamento;
    let tamanhoAbertura = configuracao.tamanhoAbertura;

    function verificarFim() {
        if (finalizado) {
            return;
        }

        if (disparosFinalizados && ativos === 0) {
            finalizado = true;

            if (aoTerminar) {
                aoTerminar();
            }
        }
    }

    function criarFileira() {
        let quantidade = Math.floor(
            (arena.clientHeight - 1) / espacamento
        ) + 1;

        // Sorteia a posição vertical da abertura
        let abertura = Math.floor(
            Math.random() * (quantidade - tamanhoAbertura + 1)
        );

        let x = arena.clientWidth + 20;

        for (let i = 0; i < quantidade; i++) {
            // Não cria projéteis na abertura
            if (i >= abertura && i < abertura + tamanhoAbertura) {
                continue;
            }

            let y = i * espacamento;

            ativos++;

            criarProjetilDirecional(
                { x: x, y: y },
                -configuracao.velocidade,
                0,
                function() {
                    ativos--;
                    verificarFim();
                }
            );
        }

        fileirasCriadas++;

        if (fileirasCriadas >= quantidadeFileiras) {
            clearInterval(intervalo);
            disparosFinalizados = true;
            verificarFim();
        }
    }

    if (quantidadeFileiras <= 0) {
        disparosFinalizados = true;
        verificarFim();
        return;
    }

    let intervalo = setInterval(
        criarFileira,
        configuracao.intervalo
    );
}

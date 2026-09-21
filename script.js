const formulario =
    document.getElementById("formulario");

const descricao =
    document.getElementById("descricao");

const valor =
    document.getElementById("valor");

const tipo =
    document.getElementById("tipo");

const categoria =
    document.getElementById("categoria");

const data =
    document.getElementById("data");

const lista =
    document.getElementById("lista");

const saldo =
    document.getElementById("saldo");

const entradas =
    document.getElementById("entradas");

const despesas =
    document.getElementById("despesas");

const limparTudo =
    document.getElementById("limpar-tudo");


let lancamentos =
    JSON.parse(
        localStorage.getItem("lancamentosFinanceiros")
    ) || [];

const buscar =
    document.getElementById("buscar");

const filtroTipo =
    document.getElementById("filtro-tipo");

const filtroCategoria =
    document.getElementById("filtro-categoria");

const dataInicial =
    document.getElementById("data-inicial");

const dataFinal =
    document.getElementById("data-final");

const tituloFormulario =
    document.getElementById("titulo-formulario");

const botaoCancelar =
    document.getElementById("botao-cancelar");

let idEditando = null;


const nomesCategorias = {
    salario: "Salário",
    alimentacao: "Alimentação",
    transporte: "Transporte",
    moradia: "Moradia",
    contas: "Contas",
    lazer: "Lazer",
    outros: "Outros"
};

/*
=====================================
ADICIONAR LANÇAMENTO
=====================================
*/

formulario.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        const novoLancamento = {

            id:
                idEditando !== null
                    ? idEditando
                    : Date.now(),

            descricao:
                descricao.value.trim(),

            valor:
                Number(valor.value),

            tipo:
                tipo.value,

            categoria:
                categoria.value,

            data:
                data.value

        };

        /*
==============================
ADICIONAR OU EDITAR
==============================
*/

        if (idEditando === null) {

            /*
            NOVO LANÇAMENTO
            */

            lancamentos.push(
                novoLancamento
            );

        } else {

            /*
            EDITAR LANÇAMENTO EXISTENTE
            */

            lancamentos =
                lancamentos.map(
                    function (lancamento) {

                        if (
                            lancamento.id === idEditando
                        ) {

                            return novoLancamento;

                        }

                        return lancamento;

                    }
                );

        }


        /*
        ==============================
        SALVAR E ATUALIZAR
        ==============================
        */

        salvarDados();

        mostrarLancamentos();

        atualizarResumo();

        desenharGrafico();

        atualizarRelatorioCategorias();


        /*
        ==============================
        LIMPAR FORMULÁRIO
        ==============================
        */

        formulario.reset();


        /*
        ==============================
        VOLTAR PARA MODO ADIÇÃO
        ==============================
        */

        idEditando = null;


        const botao =
            formulario.querySelector(
                ".botao-adicionar"
            );

        botao.textContent =
            "+ Adicionar lançamento";

        tituloFormulario.textContent =
            "Novo lançamento";

        botaoCancelar.style.display =
            "none";

    }
);


/*
=====================================
SALVAR
=====================================
*/

function salvarDados() {

    localStorage.setItem(

        "lancamentosFinanceiros",

        JSON.stringify(lancamentos)

    );

}

function obterLancamentosFiltrados() {

    const textoBusca =
        buscar.value
            .toLowerCase()
            .trim();

    const tipoSelecionado =
        filtroTipo.value;

    const categoriaSelecionada =
        filtroCategoria.value;

    const dataInicialSelecionada =
        dataInicial.value;

    const dataFinalSelecionada =
        dataFinal.value;


    return lancamentos.filter(
        function (lancamento) {

            const correspondeBusca =
                lancamento.descricao
                    .toLowerCase()
                    .includes(textoBusca);


            const correspondeTipo =
                tipoSelecionado === "todos" ||
                lancamento.tipo === tipoSelecionado;


            const correspondeCategoria =
                categoriaSelecionada === "todas" ||
                lancamento.categoria === categoriaSelecionada;


            const correspondeDataInicial =
                dataInicialSelecionada === "" ||
                lancamento.data >= dataInicialSelecionada;


            const correspondeDataFinal =
                dataFinalSelecionada === "" ||
                lancamento.data <= dataFinalSelecionada;


            return (
                correspondeBusca &&
                correspondeTipo &&
                correspondeCategoria &&
                correspondeDataInicial &&
                correspondeDataFinal
            );

        }
    );

}

/*
=====================================
MOSTRAR LANÇAMENTOS
=====================================
*/

function mostrarLancamentos() {

    lista.innerHTML = "";


    /*
    ==============================
    FILTROS
    ==============================
    */

    const textoBusca =
        buscar.value
            .toLowerCase()
            .trim();

    const tipoSelecionado =
        filtroTipo.value;

    const categoriaSelecionada =
        filtroCategoria.value;

    const dataInicialSelecionada =
        dataInicial.value;

    const dataFinalSelecionada =
        dataFinal.value;


    /*
    ==============================
    APLICAR FILTROS
    ==============================
    */

    const lancamentosFiltrados =
        lancamentos.filter(
            function (lancamento) {

                const correspondeBusca =
                    lancamento.descricao
                        .toLowerCase()
                        .includes(textoBusca);


                const correspondeTipo =
                    tipoSelecionado === "todos" ||
                    lancamento.tipo === tipoSelecionado;


                const correspondeCategoria =
                    categoriaSelecionada === "todas" ||
                    lancamento.categoria === categoriaSelecionada;

                const correspondeDataInicial =
                    dataInicialSelecionada === "" ||
                    lancamento.data >= dataInicialSelecionada;


                const correspondeDataFinal =
                    dataFinalSelecionada === "" ||
                    lancamento.data <= dataFinalSelecionada;


                return (
                    correspondeBusca &&
                    correspondeTipo &&
                    correspondeCategoria &&
                    correspondeDataInicial &&
                    correspondeDataFinal
                );

            }
        );


    /*
    ==============================
    NENHUM RESULTADO
    ==============================
    */

    if (
        lancamentosFiltrados.length === 0
    ) {

        lista.innerHTML = `
            <div class="lista-vazia">
                Nenhum lançamento encontrado.
            </div>
        `;

        return;

    }


    /*
    ==============================
    MAIS RECENTES PRIMEIRO
    ==============================
    */

    const lancamentosOrdenados =
        [...lancamentosFiltrados].reverse();


    /*
    ==============================
    MOSTRAR LANÇAMENTOS
    ==============================
    */

    lancamentosOrdenados.forEach(
        function (lancamento) {

            const item =
                document.createElement("article");


            item.classList.add(
                "lancamento"
            );


            const valorFormatado =
                formatarMoeda(
                    lancamento.valor
                );


            const dataFormatada =
                formatarData(
                    lancamento.data
                );


            const sinal =
                lancamento.tipo === "entrada"
                    ? "+"
                    : "-";


            const classeValor =
                lancamento.tipo === "entrada"
                    ? "valor-entrada"
                    : "valor-despesa";


            item.innerHTML = `

                <div class="lancamento-info">

                   <div class="lancamento-descricao">
    ${escaparHTML(lancamento.descricao)}
</div>

                   <div class="lancamento-detalhes">
    ${nomesCategorias[lancamento.categoria] || lancamento.categoria} • ${dataFormatada}
</div>

                </div>


                <strong
                    class="lancamento-valor ${classeValor}"
                >
                    ${sinal} ${valorFormatado}
                </strong>


              <div class="acoes-lancamento">

    <button
        class="botao-editar"
        onclick="editarLancamento(${lancamento.id})"
        aria-label="Editar lançamento"
    >
        ✏️
    </button>

    <button
        class="botao-excluir"
        onclick="excluirLancamento(${lancamento.id})"
        aria-label="Excluir lançamento"
    >
        🗑️
    </button>

</div>

            `;


            lista.appendChild(item);

        }
    );

}

/*
=====================================
EVENTOS DOS FILTROS
=====================================
*/

buscar.addEventListener(
    "input",
    function () {

        mostrarLancamentos();
        atualizarResumo();
        desenharGrafico();
        atualizarRelatorioCategorias();

    }
);


filtroTipo.addEventListener(
    "change",
    function () {

        mostrarLancamentos();
        atualizarResumo();
        desenharGrafico();
        atualizarRelatorioCategorias();

    }
);


filtroCategoria.addEventListener(
    "change",
    function () {

        mostrarLancamentos();
        atualizarResumo();
        desenharGrafico();
        atualizarRelatorioCategorias();

    }
);


dataInicial.addEventListener(
    "change",
    function () {

        mostrarLancamentos();
        atualizarResumo();
        desenharGrafico();
        atualizarRelatorioCategorias();
    }
);


dataFinal.addEventListener(
    "change",
    function () {

        mostrarLancamentos();
        atualizarResumo();
        desenharGrafico();
        atualizarRelatorioCategorias();

    }
);

/*
=====================================
ATUALIZAR RESUMO
=====================================
*/

function atualizarResumo() {

    /*
    ==============================
    PEGAR FILTROS
    ==============================
    */

    const textoBusca =
        buscar.value
            .toLowerCase()
            .trim();

    const tipoSelecionado =
        filtroTipo.value;

    const categoriaSelecionada =
        filtroCategoria.value;

    const dataInicialSelecionada =
        dataInicial.value;

    const dataFinalSelecionada =
        dataFinal.value;


    /*
    ==============================
    FILTRAR LANÇAMENTOS
    ==============================
    */

    const lancamentosFiltrados =
        lancamentos.filter(
            function (lancamento) {

                const correspondeBusca =
                    lancamento.descricao
                        .toLowerCase()
                        .includes(textoBusca);


                const correspondeTipo =
                    tipoSelecionado === "todos" ||
                    lancamento.tipo === tipoSelecionado;


                const correspondeCategoria =
                    categoriaSelecionada === "todas" ||
                    lancamento.categoria === categoriaSelecionada;


                const correspondeDataInicial =
                    dataInicialSelecionada === "" ||
                    lancamento.data >= dataInicialSelecionada;


                const correspondeDataFinal =
                    dataFinalSelecionada === "" ||
                    lancamento.data <= dataFinalSelecionada;


                return (
                    correspondeBusca &&
                    correspondeTipo &&
                    correspondeCategoria &&
                    correspondeDataInicial &&
                    correspondeDataFinal
                );

            }
        );


    /*
    ==============================
    CALCULAR TOTAIS
    ==============================
    */

    let totalEntradas = 0;

    let totalDespesas = 0;


    lancamentosFiltrados.forEach(
        function (lancamento) {

            if (
                lancamento.tipo === "entrada"
            ) {

                totalEntradas +=
                    lancamento.valor;

            } else {

                totalDespesas +=
                    lancamento.valor;

            }

        }
    );


    /*
    ==============================
    CALCULAR SALDO
    ==============================
    */

    const saldoAtual =
        totalEntradas -
        totalDespesas;


    /*
    ==============================
    MOSTRAR RESULTADOS
    ==============================
    */

    saldo.textContent =
        formatarMoeda(saldoAtual);


    entradas.textContent =
        formatarMoeda(totalEntradas);


    despesas.textContent =
        formatarMoeda(totalDespesas);

}

function atualizarRelatorioCategorias() {

    const relatorio =
        document.getElementById(
            "relatorio-categorias"
        );


    /*
    ==============================
    PEGAR LANÇAMENTOS FILTRADOS
    ==============================
    */

    const lancamentosFiltrados =
        obterLancamentosFiltrados();


    /*
    ==============================
    SEPARAR DESPESAS
    ==============================
    */

    const despesasFiltradas =
        lancamentosFiltrados.filter(
            function (lancamento) {

                return (
                    lancamento.tipo === "despesa"
                );

            }
        );


    /*
    ==============================
    CALCULAR POR CATEGORIA
    ==============================
    */

    const categorias = {};


    despesasFiltradas.forEach(
        function (lancamento) {

            if (
                categorias[lancamento.categoria]
            ) {

                categorias[lancamento.categoria]
                    += lancamento.valor;

            } else {

                categorias[lancamento.categoria]
                    = lancamento.valor;

            }

        }
    );


    /*
    ==============================
    LIMPAR RELATÓRIO
    ==============================
    */

    relatorio.innerHTML = "";


    /*
    ==============================
    NENHUMA DESPESA
    ==============================
    */

    if (
        Object.keys(categorias).length === 0
    ) {

        relatorio.innerHTML = `
            <p class="relatorio-vazio">
                Nenhuma despesa encontrada.
            </p>
        `;

        return;

    }



    Object.entries(categorias)
        .forEach(
            function ([categoria, valor]) {

                const item =
                    document.createElement("div");

                item.classList.add(
                    "categoria-item"
                );

                item.innerHTML = `

                    <span>
                        ${nomesCategorias[categoria] || categoria}
                    </span>

                    <strong>
                        ${formatarMoeda(valor)}
                    </strong>

                `;

                relatorio.appendChild(item);

            }
        );

}

/*
=====================================
EDITAR LANÇAMENTO
=====================================
*/

function editarLancamento(id) {

    const lancamento =
        lancamentos.find(
            function (item) {
                return item.id === id;
            }
        );


    if (!lancamento) {
        return;
    }


    /*
    ==============================
    COLOCAR DADOS NO FORMULÁRIO
    ==============================
    */

    descricao.value =
        lancamento.descricao;

    valor.value =
        lancamento.valor;

    tipo.value =
        lancamento.tipo;

    categoria.value =
        lancamento.categoria;

    data.value =
        lancamento.data;


    /*
    ==============================
    GUARDAR ID
    ==============================
    */

    idEditando = id;


    /*
    ==============================
    MUDAR TEXTO DO BOTÃO
    ==============================
    */

    const botao =
        formulario.querySelector(
            ".botao-adicionar"
        );

    botao.textContent =
        "✓ Salvar alteração";

    tituloFormulario.textContent =
        "Editar lançamento";

    botaoCancelar.style.display =
        "block";


    /*
    ==============================
    ROLAR ATÉ O FORMULÁRIO
    ==============================
    */

    formulario.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

/*
================================
CANCELAR EDIÇÃO
================================
*/

function cancelarEdicao() {

    idEditando = null;

    formulario.reset();

    tituloFormulario.textContent =
        "Novo lançamento";

    const botao =
        formulario.querySelector(
            ".botao-adicionar"
        );

    botao.textContent =
        "+ Adicionar lançamento";

    botaoCancelar.style.display =
        "none";
}


botaoCancelar.addEventListener(
    "click",
    cancelarEdicao
);

/*
=====================================
EXCLUIR
=====================================
*/

function excluirLancamento(id) {

    lancamentos =
        lancamentos.filter(
            function (lancamento) {

                return lancamento.id !== id;

            }
        );


    salvarDados();

    mostrarLancamentos();
    atualizarResumo();
    desenharGrafico();
    atualizarRelatorioCategorias();

}



/*
=====================================
LIMPAR TUDO
=====================================
*/

limparTudo.addEventListener(
    "click",
    function () {

        if (lancamentos.length === 0) {
            return;
        }


        const confirmar =
            confirm(
                "Deseja realmente apagar todos os lançamentos?"
            );


        if (!confirmar) {
            return;
        }


        lancamentos = [];


        salvarDados();

        mostrarLancamentos();
        atualizarResumo();
        desenharGrafico();
        atualizarRelatorioCategorias();

    }
);



/*
=====================================
FORMATAR MOEDA
=====================================
*/

function formatarMoeda(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}



/*
=====================================
FORMATAR DATA
=====================================
*/

function formatarData(data) {

    if (!data) {
        return "";
    }


    const partes =
        data.split("-");


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}



/*
=====================================
INICIAR
=====================================
*/


function desenharGrafico() {

    const canvas =
        document.getElementById("graficoFinanceiro");

    if (!canvas) {
        return;
    }

    const ctx =
        canvas.getContext("2d");


    /*
    ==============================
    PEGAR LANÇAMENTOS FILTRADOS
    ==============================
    */

    const lancamentosFiltrados =
        obterLancamentosFiltrados();


    /*
    ==============================
    CALCULAR TOTAIS
    ==============================
    */

    const totalEntradas =
        lancamentosFiltrados
            .filter(
                lancamento =>
                    lancamento.tipo === "entrada"
            )
            .reduce(
                (total, lancamento) =>
                    total + lancamento.valor,
                0
            );


    const totalDespesas =
        lancamentosFiltrados
            .filter(
                lancamento =>
                    lancamento.tipo === "despesa"
            )
            .reduce(
                (total, lancamento) =>
                    total + lancamento.valor,
                0
            );


    const saldoAtual =
        totalEntradas -
        totalDespesas;


    /*
    ==============================
    PERCENTUAIS
    ==============================
    */

    const total =
        totalEntradas +
        totalDespesas;


    let percentualEntradas = 0;

    let percentualDespesas = 0;


    if (total > 0) {

        percentualEntradas =
            (totalEntradas / total) * 100;

        percentualDespesas =
            (totalDespesas / total) * 100;

    }


    /*
    ==============================
    TAMANHO DO CANVAS
    ==============================
    */

    const largura =
        canvas.parentElement.clientWidth;

    const altura = 320;


    canvas.width = largura;
    canvas.height = altura;


    ctx.clearRect(
        0,
        0,
        largura,
        altura
    );


    /*
    ==============================
    CONFIGURAÇÕES DAS BARRAS
    ==============================
    */

    const maiorValor =
        Math.max(
            totalEntradas,
            totalDespesas,
            1
        );


    const base = 220;

    const alturaMaxima = 160;

    const larguraBarra = 90;


    const alturaEntradas =
        (totalEntradas / maiorValor)
        * alturaMaxima;


    const alturaDespesas =
        (totalDespesas / maiorValor)
        * alturaMaxima;


    const centro =
        largura / 2;


    const xEntradas =
        centro -
        larguraBarra -
        30;


    const xDespesas =
        centro + 30;


    /*
    ==============================
    BARRA ENTRADAS
    ==============================
    */

    ctx.fillStyle =
        "#22c55e";


    ctx.fillRect(
        xEntradas,
        base - alturaEntradas,
        larguraBarra,
        alturaEntradas
    );


    /*
    ==============================
    BARRA DESPESAS
    ==============================
    */

    ctx.fillStyle =
        "#ef4444";


    ctx.fillRect(
        xDespesas,
        base - alturaDespesas,
        larguraBarra,
        alturaDespesas
    );


    /*
    ==============================
    TEXTO
    ==============================
    */

    ctx.fillStyle =
        "#222";


    ctx.textAlign =
        "center";


    ctx.font =
        "bold 14px Arial";


    /*
    VALOR ENTRADAS
    */

    ctx.fillText(
        formatarMoeda(totalEntradas),
        xEntradas + larguraBarra / 2,
        base - alturaEntradas - 12
    );


    /*
    VALOR DESPESAS
    */

    ctx.fillText(
        formatarMoeda(totalDespesas),
        xDespesas + larguraBarra / 2,
        base - alturaDespesas - 12
    );


    /*
    ==============================
    NOMES
    ==============================
    */

    ctx.font =
        "14px Arial";


    ctx.fillText(
        "Entradas",
        xEntradas + larguraBarra / 2,
        245
    );


    ctx.fillText(
        "Despesas",
        xDespesas + larguraBarra / 2,
        245
    );


    /*
    ==============================
    PERCENTUAIS
    ==============================
    */

    ctx.font =
        "bold 13px Arial";


    ctx.fillText(
        percentualEntradas.toFixed(1) + "%",
        xEntradas + larguraBarra / 2,
        265
    );


    ctx.fillText(
        percentualDespesas.toFixed(1) + "%",
        xDespesas + larguraBarra / 2,
        265
    );


    /*
    ==============================
    SALDO
    ==============================
    */

    ctx.font =
        "bold 16px Arial";


    ctx.fillText(
        "Saldo: " +
        formatarMoeda(saldoAtual),
        centro,
        300
    );

}



atualizarResumo();

desenharGrafico();

atualizarRelatorioCategorias();

window.addEventListener(
    "resize",
    desenharGrafico
);

/*
=====================================
EXPORTAR PARA CSV
=====================================
*/
const exportarCsv = document.getElementById("exportar-csv");

exportarCsv.addEventListener("click", function () {
    if (lancamentos.length === 0) {
        alert("Não existem lançamentos para exportar.");
        return;
    }

    // Usar ponto e vírgula (;) para o Excel em português reconhecer as colunas corretamente
    let csv = "ID;Descrição;Valor;Tipo;Categoria;Data\n";

    lancamentos.forEach(function (lancamento) {
        // Proteger a descrição contra pontos e vírgulas ou aspas usando plicas duplas
        const descricaoTratada = `"${lancamento.descricao.replace(/"/g, '""')}"`;

        // Substituir o ponto por vírgula no valor se quiser o formato monetário pt-PT (opcional, ou manter ponto)
        // Aqui mantemos o formato numérico padrão separado por ponto e vírgula
        const linha = [
            lancamento.id,
            descricaoTratada,
            lancamento.valor.toString().replace(".", ","), // Formato de vírgula decimal para o Excel
            lancamento.tipo,
            lancamento.categoria,
            lancamento.data
        ].join(";");

        csv += linha + "\n";
    });

    // Criar o Blob com codificação UTF-8 com BOM (\ufeff) para os acentos aparecerem bem no Excel
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "meu_controle_financeiro.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
});


/*
=====================================
FUNÇÃO DE SEGURANÇA (SANITIZAÇÃO)
=====================================
*/
function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}
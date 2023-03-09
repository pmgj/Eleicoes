function Grafico(chart) {
    this.xhr = new XMLHttpRequest();
    this.chart = chart;
    this.myChart = null;
    this.xml = null;
    this.ano = null;
    this.turno = null;
    this.cor = ["#FFEBCD", "#0000FF", "#8A2BE2", "#A52A2A", "#DEB887", "#5F9EA0", "#7FFF00", "#D2691E", "#FF7F50", "#6495ED", "#FFF8DC", "#DC143C", "#00FFFF", "#00008B", "#008B8B", "#B8860B", "#B8860B", "#A9A9A9", "#006400", "#BDB76B", "#8B008B", "#556B2F", "#FF8C00"];
}
Grafico.prototype.datasetResultadoAbsoluto = function (labels) {
    var datasets = new Array();
    for (var i = 0, max = labels.nomes.length; i < max; i++) {
        datasets[i] = {label: labels.nomes[i], value: this.votosAbsolutos(labels.numeros[i]), color: this.cor[i], highlight: this.cor[i]};
    }
    return datasets;
};
Grafico.prototype.datasetResultadoPercentual = function (labels) {
    var votos = new Array();
    for (var i = 0, max = labels.nomes.length; i < max; i++) {
        votos[i] = this.votosAbsolutos(labels.numeros[i]);
    }
    var sum = votos.reduce(function (a, b) {
        return a + b;
    });
    var datasets = new Array();
    for (var i = 0, max = labels.nomes.length; i < max; i++) {
        var voto = 100.0 * votos[i] / sum;
        datasets[i] = {label: labels.nomes[i], value: voto, color: this.cor[i], highlight: this.cor[i]};
    }
    return datasets;
};
Grafico.prototype.dadosBar = function () {
    var cand = this.xml.getElementsByTagName("candidatos")[0].getElementsByTagName("candidato");
    var vetor1 = new Array();
    var vetor2 = new Array();
    for (var i = 0, max = cand.length; i < max; i++) {
        vetor1[i] = cand[i].getAttribute("nome");
        vetor2[i] = cand[i].getAttribute("n");
    }
    return {nomes: vetor1, numeros: vetor2};
};
Grafico.prototype.gerarGraficoPizzaResultadoAbsoluto = function () {
    if (this.xhr.readyState === 4) {
        this.xml = this.xhr.responseXML;
        var labels = this.dadosBar();
        var dados = this.datasetResultadoAbsoluto(labels);
        Chart.defaults.global.tooltipTemplate = "<%if (label){%><%=label%>: <%}%><%= new Intl.NumberFormat('pt-br').format(value) %>";
        this.setPieChart(dados);
        document.getElementById("mapa").style.display = "none";
        document.getElementById("chart").style.display = "block";
    }
};
Grafico.prototype.setPieChart = function (dados) {
        if (this.myChart !== null) {
            this.myChart.destroy();
        }
        this.myChart = this.chart.Pie(dados);    
};
Grafico.prototype.gerarGraficoPizzaResultadoPercentual = function () {
    if (this.xhr.readyState === 4) {
        this.xml = this.xhr.responseXML;
        var labels = this.dadosBar();
        var dados = this.datasetResultadoPercentual(labels);
        Chart.defaults.global.tooltipTemplate = "<%if (label){%><%=label%>: <%}%><%= new Intl.NumberFormat('pt-br', {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}).format(value/100) %>";
        this.setPieChart(dados);
        document.getElementById("mapa").style.display = "none";
        document.getElementById("chart").style.display = "block";
    }
};
Grafico.prototype.resultadoAbsoluto = function () {
    this.xhr.open("get", "Eleicao" + this.ano + "-Presidente.xml", true);
    this.xhr.onreadystatechange = this.gerarGraficoPizzaResultadoAbsoluto.bind(this);
    this.xhr.send(null);
};
Grafico.prototype.resultadoPercentual = function () {
    this.xhr.open("get", "Eleicao" + this.ano + "-Presidente.xml", true);
    this.xhr.onreadystatechange = this.gerarGraficoPizzaResultadoPercentual.bind(this);
    this.xhr.send(null);
};
Grafico.prototype.votosAbsolutos = function (n) {
    var iterator = this.xml.evaluate("//turno[@n=" + this.turno + "]//votos[@n=" + n + "]", this.xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    var sum = 0;
    try {
        var thisNode = iterator.iterateNext();
        while (thisNode) {
            if (thisNode.getAttribute("votos") !== "") {
                var votos = parseInt(thisNode.getAttribute("votos"));
                sum += votos;
            }
            thisNode = iterator.iterateNext();
        }
    } catch (e) {
        console.log('Error: Document tree modified during iteration ' + e);
    }
    return sum;
};
Grafico.prototype.escolherOperacao = function () {
    var form = document.forms[0];
    this.ano = parseInt(form.ano.value);
    this.turno = parseInt(form.turno.value);
    var op = parseInt(form.operacao.value);
    switch (op) {
        case 1:
            this.resultadoAbsoluto();
            break;
        case 2:
            this.resultadoPercentual();
            break;
    }
};
Grafico.prototype.attachEvents = function () {
    var form = document.forms[0];
    form.operacao.onchange = this.escolherOperacao.bind(this);
    form.ano.onchange = this.escolherOperacao.bind(this);
    form.turno.onchange = this.escolherOperacao.bind(this);
    document.getElementById("mapa").style.display = "none";
    document.getElementById("chart").style.display = "none";
    this.escolherOperacao();
};
function init() {
    var ctx = document.getElementById("chart").getContext("2d");
    var myNewChart = new Chart(ctx);
    var g = new Grafico(myNewChart);
    g.attachEvents();
}
onload = init;
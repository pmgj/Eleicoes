class Grafico {
    constructor(chart) {
        this.chart = chart;
        this.xhr = new XMLHttpRequest();
        this.myChart = null;
        this.xml = null;
        this.ano = null;
        this.turno = null;
        this.cor = ["#FFEBCD", "#0000FF", "#8A2BE2", "#A52A2A", "#DEB887", "#5F9EA0", "#7FFF00", "#D2691E", "#FF7F50", "#6495ED", "#FFF8DC", "#DC143C", "#00FFFF", "#00008B", "#008B8B", "#B8860B", "#B8860B", "#A9A9A9", "#006400", "#BDB76B", "#8B008B", "#556B2F", "#FF8C00"];
    }
    datasetResultadoAbsoluto(labels) {
        return labels.map((e, i) => ({ label: e.nome, value: e.votos, color: this.cor[i], highlight: this.cor[i] }));
    }
    datasetResultadoPercentual(labels) {
        return labels.map((e, i) => ({ label: e.nome, value: e.perc, color: this.cor[i], highlight: this.cor[i] }));
    }
    dadosBar() {
        let temp = Array.from(this.xml.querySelectorAll("candidato")).map(e => ({ nome: e.getAttribute("nome"), numero: e.getAttribute("n"), votos: this.votosAbsolutos(e.getAttribute("n")) }));
        let sum = temp.reduce((a, b) => a + b.votos, 0);
        temp.forEach(e => e.perc = e.votos / sum);
        return temp;
    }
    gerarGraficoPizzaResultadoAbsoluto() {
        this.xml = this.xhr.responseXML;
        let labels = this.dadosBar();
        let dados = this.datasetResultadoAbsoluto(labels);
        Chart.defaults.global.tooltipTemplate = "<%if (label){%><%=label%>: <%}%><%= new Intl.NumberFormat('pt-br').format(value) %>";
        this.setPieChart(dados);
        document.getElementById("mapa").style.display = "none";
        document.getElementById("chart").style.display = "block";
    }
    setPieChart(dados) {
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.myChart = this.chart.Pie(dados);
    }
    gerarGraficoPizzaResultadoPercentual() {
        this.xml = this.xhr.responseXML;
        let labels = this.dadosBar();
        let dados = this.datasetResultadoPercentual(labels);
        Chart.defaults.global.tooltipTemplate = "<%if (label){%><%=label%>: <%}%><%= new Intl.NumberFormat('pt-br', {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}).format(value) %>";
        this.setPieChart(dados);
        document.getElementById("mapa").style.display = "none";
        document.getElementById("chart").style.display = "block";
    }
    resultadoAbsoluto() {
        this.xhr.open("get", `Eleicao${this.ano}-Presidente.xml`);
        this.xhr.onload = this.gerarGraficoPizzaResultadoAbsoluto.bind(this);
        this.xhr.send(null);
    }
    resultadoPercentual() {
        this.xhr.open("get", `Eleicao${this.ano}-Presidente.xml`);
        this.xhr.onload = this.gerarGraficoPizzaResultadoPercentual.bind(this);
        this.xhr.send(null);
    }
    votosAbsolutos(n) {
        let iterator = this.xml.evaluate(`//turno[@n=${this.turno}]//votos[@n=${n}]`, this.xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
        let sum = 0;
        try {
            var thisNode = iterator.iterateNext();
            while (thisNode) {
                if (thisNode.getAttribute("votos") !== "") {
                    let votos = parseInt(thisNode.getAttribute("votos"));
                    sum += votos;
                }
                thisNode = iterator.iterateNext();
            }
        } catch (e) {
            console.log('Error: Document tree modified during iteration ' + e);
        }
        return sum;
    }
    escolherOperacao() {
        let form = document.forms[0];
        this.ano = parseInt(form.ano.value);
        this.turno = parseInt(form.turno.value);
        let op = parseInt(form.operacao.value);
        switch (op) {
            case 1:
                this.resultadoAbsoluto();
                break;
            case 2:
                this.resultadoPercentual();
                break;
        }
    };
    attachEvents() {
        let form = document.forms[0];
        form.operacao.onchange = this.escolherOperacao.bind(this);
        form.ano.onchange = this.escolherOperacao.bind(this);
        form.turno.onchange = this.escolherOperacao.bind(this);
        document.getElementById("mapa").style.display = "none";
        document.getElementById("chart").style.display = "none";
        this.escolherOperacao();
    }
}
onload = () => {
    let ctx = document.getElementById("chart").getContext("2d");
    let myNewChart = new Chart(ctx);
    let g = new Grafico(myNewChart);
    g.attachEvents();
};
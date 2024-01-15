class Grafico {
    constructor() {
        this.xhr = new XMLHttpRequest();
        this.myChart = null;
        this.xml = null;
        this.ano = null;
        this.turno = null;
        this.cor = ["#FFEBCD", "#0000FF", "#8A2BE2", "#A52A2A", "#DEB887", "#5F9EA0", "#7FFF00", "#D2691E", "#FF7F50", "#6495ED", "#FFF8DC", "#DC143C", "#00FFFF", "#00008B", "#008B8B", "#B8860B", "#B8860B", "#A9A9A9", "#006400", "#BDB76B", "#8B008B", "#556B2F", "#FF8C00"];
    }
    computeData() {
        let temp = Array.from(this.xml.querySelectorAll("candidato")).map(e => ({ nome: e.getAttribute("nome"), numero: e.getAttribute("n"), votos: this.computeVotes(e.getAttribute("n")) }));
        let sum = temp.reduce((a, b) => a + b.votos, 0);
        temp.forEach(e => e.perc = e.votos / sum);
        temp.sort((a, b) => b.votos - a.votos);
        if (this.turno === 2) {
            temp = temp.slice(0, 2);
        }
        return temp;
    }
    createChart() {
        this.xml = this.xhr.responseXML;
        let labels = this.computeData();
        this.setPieChart(labels);
        document.getElementById("chart").style.display = "block";
    }
    setPieChart(dados) {
        if (this.myChart) {
            this.myChart.destroy();
        }
        let ctx = document.getElementById("chart");
        this.myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: dados.map(x => x.nome),
                datasets: [{
                    data: dados.map(x => x.votos),
                    borderWidth: 1,
                    backgroundColor: this.cor
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => {
                                let i = tooltipItem.dataIndex;
                                let perc = new Intl.NumberFormat('pt-br', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(dados[i].perc);
                                return `${tooltipItem.formattedValue} (${perc})`;
                            }
                        }
                    },
                }
            }
        });
    }
    getFile() {
        this.xhr.open("get", `Eleicao${this.ano}-Presidente.xml`);
        this.xhr.onload = this.createChart.bind(this);
        this.xhr.send(null);
    }
    computeVotes(n) {
        let iterator = this.xml.evaluate(`//turno[@n=${this.turno}]//votos[@n=${n}]`, this.xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
        let sum = 0;
        let thisNode = iterator.iterateNext();
        while (thisNode) {
            if (thisNode.getAttribute("votos") !== "") {
                let votos = parseInt(thisNode.getAttribute("votos"));
                sum += votos;
            }
            thisNode = iterator.iterateNext();
        }
        return sum;
    }
    execute() {
        let form = document.forms[0];
        this.ano = parseInt(form.ano.value);
        this.turno = parseInt(form.turno.value);
        this.getFile();
    };
    attachEvents() {
        let form = document.forms[0];
        form.ano.onchange = this.execute.bind(this);
        form.turno.onchange = this.execute.bind(this);
        document.getElementById("chart").style.display = "none";
        this.execute();
    }
}
onload = () => {
    let g = new Grafico();
    g.attachEvents();
};
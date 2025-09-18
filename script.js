const API_URL = 'https://apidemo.geoeducacion.com.ar/api/testing/control/';

window.onload =function(){
showGraphs()
}

async function getData(id) {
    data = await fetch(API_URL + id);
    data = await data.json();
    return data.data;
}

async function graph(id,graph) {
    let data = await getData(id);
    data = data[0];
    const valores = data.valores;
    const media = data.media;
    Analize(valores,media);
    const lsc = data.lsc;
    const lic = data.lic;
    const etiquetas = valores.map(v => v.x);
    const mediaLine = etiquetas.map(() => media);
    const lscLine = etiquetas.map(() => lsc);
    const licLine = etiquetas.map(() => lic);

    const ctx = document.getElementById(graph).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [
                {
                    label: 'Valor',
                    data: valores.map(v => v.y),
                    borderColor: 'blue',
                    fill: false,
                    pointRadius: 4,
                },
                {
                    label: 'Media',
                    data: mediaLine,
                    borderColor: 'green',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                },
                {
                    label: 'LSC',
                    data: lscLine,
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                },
                {
                    label: 'LIC',
                    data: licLine,
                    borderColor: 'orange',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                },
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Gráfico de Control - Valores con Media, LSC y LIC'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Muestras'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valores'
                    }
                }
            }
        }
    });
    
}


function showGraphs() {
    graph(1,'graph_1');
    graph(2,'graph_2');
    graph(3,'graph_3');
    graph(4,'graph_4');
    graph(5,'graph_5');

}

document.addEventListener("DOMContentLoaded",function(){
    const select = document.getElementById("select")
    const garphs = [
        document.getElementById("graph_1").parentElement,
        document.getElementById("graph_2").parentElement,
        document.getElementById("graph_3").parentElement,
        document.getElementById("graph_4").parentElement,
        document.getElementById("graph_5").parentElement
    ]

    garphs.forEach(g => g.style.display = "none")

    select.addEventListener("change",function(){
        const value = select.value

        garphs.forEach(g => g.style.display = "none")

        if (value >= 1 && value <= 5) {
            garphs[value-1].style.display = "block"
        }
    })
})

function Analize(valores,media) {
    const y = valores.map(v => v.y);
    const sigma = desvioEstandar(y);
    const lsc = media + sigma*3;
    const lic = media - sigma*3;
    console.log(y);
    let cont3S = 0;
    let razones = [];
    y.forEach(valor => {
       if (valor > lsc || valor < lic) {
            cont3S++;
       } 
    });
    if (cont3S != 0) {
        razones.push(`Hay ${cont3S} punto/s fuera de 3 Sigma`)
    }
    if (razones.length != 0) {
        document.getElementById("paragraph_razones").innerText += razones;
        document.getElementById("paragraph").style.display = "block";
        
    }
    
    
}
function desvioEstandar(arr) {
  const n = arr.length;
  const media = arr.reduce((acc, val) => acc + val, 0) / n;
  const sumaDiferenciasCuadrado = arr.reduce((acc, val) => acc + Math.pow(val - media, 2), 0);
  return Math.round(Math.sqrt(sumaDiferenciasCuadrado / n));
}

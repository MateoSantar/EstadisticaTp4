const API_URL = 'https://apidemo.geoeducacion.com.ar/api/testing/control/';

window.onload = function () {
    analizeData();
    showGraphs();
}
const dataAnalisis = [];
let dataId = 1;

async function analizeData() {
    const datas = [];
    for (let i = 1; i <= 5; i++) {
        let data = await getData(i);
        datas.push(data[0]);
    }
    for (const data of datas) {
        const valores = data.valores;
        const media = data.media;
        const lsc = data.lsc;
        const lic = data.lic;
        dataAnalisis.push({ id: dataId, razones: await Analize(valores, media, lsc, lic) });
        dataId++;
    }
    console.log(dataAnalisis);

}
async function getData(id) {
    data = await fetch(API_URL + id);
    data = await data.json();
    return data.data;
}

async function graph(id, graph) {
    let data = await getData(id);
    data = data[0];
    const valores = data.valores;
    const media = data.media;
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



document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("select")
    const graphs = [
        document.getElementById("graph_1").parentElement,
        document.getElementById("graph_2").parentElement,
        document.getElementById("graph_3").parentElement,
        document.getElementById("graph_4").parentElement,
        document.getElementById("graph_5").parentElement
    ]
    const paragraph_razones = document.getElementById("paragraph_razones");
    graphs.forEach(g => g.style.display = "none")

    select.addEventListener("change", function () {
        const value = select.value

        graphs.forEach(g => g.style.display = "none")

        if (value >= 1 && value <= 5) {
            graphs[value - 1].style.display = "block"
            const data = dataAnalisis.find(d => d.id == value);
            if (data.razones.length > 0) {
                paragraph_razones.innerHTML = data.razones.join("<br>")
            } else {
                paragraph_razones.innerHTML = "Sistema en Control"
            }
        }
        document.getElementById('paragraph').style.display = 'block';
    })
})



async function Analize(valores, media, lsc, lic) {
    const y = valores.map(v => v.y);
    const sigma = desvioEstandar(media, lsc, lic);
    let razones = [];
    puntosFueraDe3Sigma(y, lsc, lic, razones);
    dosDe3PuntosFueraDe2Sigma(y, sigma, media,razones);
    cuatroDe5PuntosMismoSigma(y, sigma, media, razones);
    ochoPuntosMismoLado(y, media, razones);
    return razones;

}

function puntosFueraDe3Sigma(array, lsc, lic, razones) {
    let cont3S = 0;

    array.forEach(valor => {
        if (valor > lsc || valor < lic) {
            cont3S++;
        }
    });
    if (cont3S != 0) {
        razones.push(`Hay ${cont3S} punto/s fuera de 3 Sigma`)
    }
}

function dosDe3PuntosFueraDe2Sigma(array, sigma, media, razones) {
  const limite2SigmaSuperior = media + 2 * sigma;
  const limite2SigmaInferior = media - 2 * sigma;
  const vistos = new Set();

  for (let i = 0; i <= array.length - 3; i++) {
    const grupo = array.slice(i, i + 3);
    const superiores = grupo.filter(v => v > limite2SigmaSuperior).length;
    const inferiores = grupo.filter(v => v < limite2SigmaInferior).length;

    if (superiores >= 2) {
      const key = `+2:${i}`; 
      if (!vistos.has(key)) {
        razones.push(`Regla: 2 de 3 puntos consecutivos por encima de +2 Sigma en muestras ${i + 1}-${i + 3}`);
        vistos.add(key);
      }
    }
    if (inferiores >= 2) {
      const key = `-2:${i}`;
      if (!vistos.has(key)) {
        razones.push(`Regla: 2 de 3 puntos consecutivos por debajo de -2 Sigma en muestras ${i + 1}-${i + 3}`);
        vistos.add(key);
      }
    }
  }
}

function cuatroDe5PuntosMismoSigma(array,sigma,media,razones) {
    const vistos = new Set();
    const limiteSigmaSuperior = media + sigma;
    const limiteSigmaInferior = media - sigma;
    for (let i = 0; i <= array.length - 5; i++) {
        const grupo = array.slice(i, i + 5);
        const superiores = grupo.filter(v => v > limiteSigmaSuperior).length;
        const inferiores = grupo.filter(v => v < limiteSigmaInferior).length;
        if (superiores >= 4) {
            const key = `+1:${i}`;
            if (!vistos.has(key)) {
                razones.push(`Regla: 4 de 5 puntos consecutivos por encima de +1 Sigma en muestras ${i + 1}-${i + 5}`);
                vistos.add(key);
            }
        }
        if (inferiores >= 4) {
            const key = `-1:${i}`;
            if (!vistos.has(key)) {
                razones.push(`Regla: 4 de 5 puntos consecutivos por debajo de -1 Sigma en muestras ${i + 1}-${i + 5}`);
                vistos.add(key);
            }
        }
    }
}

function ochoPuntosMismoLado(array, media, razones) {
    let cont = 0;
    let lado = null;
    for (let i = 0; i < array.length; i++) {
        if (array[i] > media) {
            if (lado === 'arriba') {
                cont++;
            } else {
                lado = 'arriba';
                cont = 1;
            }
        } else if (array[i] < media) {
            if (lado === 'abajo') {
                cont++;
            } else {
                lado = 'abajo';
                cont = 1;
            }
        } else {
            lado = null;
            cont = 0;
        }
        if (cont >= 8) {
            razones.push(`Regla: 8 puntos consecutivos del mismo lado de la media en muestras ${i - 7 + 1}-${i + 1}`);
            break; 
        }
    }
    
}
function desvioEstandar(lsc, media, lic) {
    const sigmaSuperior = (lsc - media) / 3;
    const sigmaInferior = (media - lic) / 3;

    return (sigmaSuperior + sigmaInferior) / 2;
}
function showGraphs() {
    graph(1, 'graph_1');
    graph(2, 'graph_2');
    graph(3, 'graph_3');
    graph(4, 'graph_4');
    graph(5, 'graph_5');
}

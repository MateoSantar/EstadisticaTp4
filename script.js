const API_URL = 'https://apidemo.geoeducacion.com.ar/api/testing/control/';

window.onload =function(){
showGraphs()
}

async function getData(id) {
    data = await fetch(API_URL + id);
    data = await data.json();
    return data.data;
}

async function graph(id) {
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

    const ctx = document.getElementById('graph_1').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [
                {
                    label: 'Valores',
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

graph(1);

function showGraphs() {
    for (let i = 1; i < 5; i++) {
        graph(i)        
    }

}

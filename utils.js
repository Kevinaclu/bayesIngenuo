const fileInput = document.getElementById("file");
const externfileInput = document.getElementById("externFile");
const fileInfo = [];
const externInfo = [];

const input2 = document.getElementById('input2');
const rbSame = document.getElementById('same_dataset');
const rbExt = document.getElementById('extern_dataset');
const k = document.getElementById('k');

const nombreArchivo = document.getElementById("nombre-archivo");
const datasetNombre = document.getElementById("dataset-name");

const naive = new NaiveBayes();


readFile = function (event) {
    fileInfo.splice(0);
    const reader = new FileReader();
    reader.onload = function () {
        const result = reader.result.split('\n');
        result.forEach(info => {
            if (info.length > 0) {
                fileInfo.push(info.split(','));
            }
        });
        naive.loadDataset(fileInfo);
        datasetNombre.innerHTML = event.srcElement.files[0].name;
    };
    // Empieza a leer el archivo. Una vez termina, llama al evento onload definido arriba
    reader.readAsBinaryString(fileInput.files[0]);
};

fileInput.addEventListener('change', readFile);

readFile2 = function (event) {
    externInfo.splice(0);
    const reader2 = new FileReader();
    reader2.onload = function (ev) {
        const result = reader2.result.split('\n');
        result.forEach(info => {
            if (info.length > 0) {
                externInfo.push(info.split(','));
            }
        });
        nombreArchivo.innerHTML = event.srcElement.files[0].name;
        // console.log(event.srcElement.files[0].name);
        // naive.loadExternDataset(externInfo);
    };
    // Empieza a leer el archivo. Una vez termina, llama al evento onload definido arriba
    reader2.readAsBinaryString(externfileInput.files[0]);
};

externfileInput.addEventListener('change', readFile2);

// hice dos readers pa agilizar las cosas
function Start() {
    try{ 
        if (rbSame.checked) {
            const trainingPercent = input2.value;
            naive.setTrainingPercent(trainingPercent);
            naive.externDataset = [];
        } else if (rbExt.checked) {
            naive.setTrainingPercent(100);
            naive.loadExternDataset(externInfo);
        }

        naive.setK(k.value);

        if (document.getElementById('disc-ancho').checked) {
            naive.isEqualWidth = true;
        } else {
            naive.isEqualWidth = false;
        }

        // console.log(naive.equalFrecuency([0,1,2,3,3,4,5,6,7,7,7], 0));
        // console.log(naive.intervals);
        naive.predict();
        console.log("aver:", naive.results);

        if(rbSame.checked){
            MakeTable(naive.matrix);
            document.getElementById('accuracy').innerHTML = `${(naive.getAccuracy() * 100).toFixed(2)} %`;
            document.getElementById('recall').innerHTML = `${(naive.getRecall() * 100).toFixed(2)} %`;
            document.getElementById('precision').innerHTML = `${(naive.getPrecision() * 100).toFixed(2)} %`;
            document.getElementById('medidaF1').innerHTML = `${(naive.getF1() * 100).toFixed(2)} %`;
        }
        else if(rbExt.checked){
            const table = document.getElementsByClassName("table")[0];
            const predictionTable = document.getElementById("prediction-table");
            if(!table){
                return;
            }
            if(predictionTable){
                predictionTable += MakePredictionTable(naive.results);
            }
            else{
                table.innerHTML += `<p>Predicciones</p>` 
                table.innerHTML += MakePredictionTable(naive.results);
            }
            
        }
    }
    catch(ex){

    }

}

function MakeTable(object) {
    const table = document.getElementsByClassName("table")[0];
    table.classList.add("showing-table");
    table.innerHTML =
        `
        <p>Tabla de Resultados</p>
        <div class="header">
            <p>Seccion</p>
            ${
        Object.entries(object).map((item) => {
            return `<p>${item[0]}</p>`
        }).join('')
        }            
        </div>

    `;

    table.innerHTML += `
            
                ${
        Object.entries(object).map((item) => {
            return `
                            <div class="row"> 
                                <p class="row-title">${item[0]}</p>
                                ${Object.entries(item[1]).map((i) => {
                return `<p>${i[1]}</p> `
            }).join('')}
                            </div>
                        `;
        }).join('')
        }
    `;

    table.innerHTML += `
    
    <div class="results">
        <div>
            Precision: <span id="precision"></span>
        </div>
        <div>
            Recall: <span id="recall"></span>
        </div>
        <div>
            Medida F1: <span id="medidaF1"></span>
        </div>
        <div>
            Accuracy: <span id="accuracy"></span>
        </div>
    </div>
    `; 
}



const MakePredictionTable = (data) => {
    const HtmlData =  `<div class="prediction-table" id="prediction-table">
            ${data.map((item, i) => { 
                return `<div class="prediction-row">
                    ${    
                    `<p>Registro ${i+1}:</p><p>${item.dato[item.dato.length-1]}</p>`   
                    }
                    </div>` 
            }).join('')}
        </div>`;

    return HtmlData;
}



function Limpiar(){
    fileInput.value = "";
    externfileInput.value = "";
    const table = document.getElementsByClassName("table")[0];
    table.innerHTML =""
    table.classList.remove('showing-table');
    nombreArchivo.innerHTML = "----";
    datasetNombre.innerHTML = "----"
}
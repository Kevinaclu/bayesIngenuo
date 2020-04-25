class NaiveBayes {
    dataset = []; // dataset principal
    splittedDataset = []; // dataset por atributos
    class_values = []; // clases del dataset
    intervals = {}; // intervalos para constantes numericas
    trainigPercent = 100; // porcentaje de entrenamiento
    separatedDataset = {}; // tablas de frecuencia
    externDataset = []; // archivo externo
    k = 0; // intervalos de discretizacion
    results = []; // resultados de los datos que predijo
    matrix = {}; // matriz de confusion
    pruebaLength = 0;
    isEqualWidth = true;


    constructor() { }

    /**Metodo que verifica si hay algun atributo numerico, en caso de exista alguno utiliza el metodo de discretizacion por anchos iguales */
    verifyData() {
        this.splittedDataset = [];
        this.shuffleArray(this.dataset);
        this.separateData();
        for (let i = 0; i < this.splittedDataset.length - 1; i++) {
            const s = this.splittedDataset[i];
            if (this.isNumeric(s)) {
                const aux = s.slice();
                aux.sort((a, b) => a - b);
                if (this.isEqualWidth){
                    this.equalWidth(aux, i);
                } else {
                    this.equalFrecuency(aux, i); // Regresa un arreglo de arreglos con los indices de los datos ordenados y discretizados
                    for (let j = 0; j < s.length; j++) {
                        const interval = this.getInterval(i, s[j]);
                        s[j] = interval;
                        this.dataset[j][i] = interval;
                    }
                }
            }
        }
        for (let i = 0; i < this.splittedDataset.length - 1; i++) {
            const s = this.splittedDataset[i];
            if (this.isNumeric(s)) {
                for (let j = 0; j < s.length; j++) {
                    const interval = this.getInterval(i, s[j]);
                    s[j] = interval;
                    this.dataset[j][i] = interval;
                }
            }
        }
    }

    /**Metodo que obtiene el indice del intervalo al cual pertenece un numero, como parametros se tiene el indice del dato que contiene dicho numero y el valor de dicho numero */
    getInterval(index, num) {
        // Una mexicanadita porque no queria funcionar esta onda;
        let interval = -1;
        let auxNum = num;
        this.intervals[index].forEach((bound, k) => {
            if (bound >= auxNum) {
                interval = k
                auxNum = Infinity;
            }
        });
        return interval;
    }

    /**Metodo principal del clasificador en el cual realiza la clasificacion de bayes ingenuo a los datos a probar*/
    predict() {
        // this.splittedDataset = [];
        // this.shuffleArray(this.dataset);
        // this.separateData();
        this.verifyData();
        console.log("Procesando datos...");
        console.log(this.dataset.length - this.getTrainingLength());
        if (this.externDataset.length > 0) {
            this.pruebaLength += this.externDataset.length;
            for (let i = 0; i < this.externDataset.length; i++) {
                // console.log(`Dato ${i+1} de ${this.externDataset}`);
                const dato = this.externDataset[i];
                this.predictRow(dato);
                this.dataset.push(dato);
            }
        } else {
            this.pruebaLength += this.dataset.length - this.getTrainingLength();
            for (let i = this.getTrainingLength(); i < this.dataset.length; i++) {
                // console.log(`Dato ${i+1} de ${this.dataset.length - this.getTrainingLength()}`);
                const dato = this.dataset[i];
                this.predictRow(dato);
            }
        }
        console.log('Datos procesados!!!')

        // console.log(this.separatedDataset);
        // console.log(this.class_values);
        // console.log(this.splittedDataset[0].length)
        console.log(this.intervals);
        console.log(this.results);
        console.log(this.matrix);
        console.log(this.dataset.length);
    }

    /**Metodo que realiza la operacion del bayes ingenuo para un dato de los datos de prueba */
    predictRow(dato) {
        const class_dato = dato[dato.length - 1];
        const probs = [];
        
        this.class_values.forEach(cv => {
            const class_length = this.separatedDataset[cv][0].length;
            let likelyhood = []; // presuncion
            let totalClassProb = 0; // probabilidad de clase
            for (let i = 0; i < dato.length - 1; i++) {
                const d = dato[i];
                const sameClass = this.separatedDataset[cv][i].filter(cl => {
                    return cl === d;
                }).length;
                likelyhood.push(sameClass / class_length);
            }
            likelyhood = likelyhood.reduce((a, b) => a * b);
            totalClassProb = class_length / this.splittedDataset[0].length;

            probs.push({ probability: likelyhood * totalClassProb, class: cv });
        });

        const max = probs.sort(function (a, b) {
            return b.probability - a.probability;
        });

        const result = {
            dato: dato,
            predictedClass: max[0].class,
            realClass: class_dato,
            probabilities: probs
        }

        this.results.push(result);

        
        // if (!finded) {
            // this.matrix[result.predictedClass][result.predictedClass] += 1;    
        // } else {
            this.matrix[result.predictedClass][result.realClass] += 1;
        // }
        // if (result.realClass !== result.predictedClass) {
        //     this.matrix[result.predictedClass][result.realClass] += 1;
        // }

        // console.log(dato);
        // console.log(probs);
        // console.log(`predicted class: ${max[0].class}, real class: ${class_dato}`);

        this.separatedDataset[`${max[0].class}`].forEach((attr, i) => attr.push(dato[i]));
        this.splittedDataset.forEach((attr, i) => {
            attr.push(dato[i]);
        });
    }

    /**Metodo que establece el porcentaje de entrenamiento */
    setTrainingPercent(trainigPercent) {
        this.trainigPercent = trainigPercent
    }

    /**Metodo que carga el dataset en memoria */
    loadDataset(dataset) {
        this.dataset = dataset;
        this.splittedDataset = [];
        this.class_values = [];
        this.separatedDataset = {};
        this.intervals = {};
        this.results = [];
        this.matrix = {};
        this.pruebaLength = 0;

        // clases del dataset
        for (let j = 0; j < this.dataset.length; j++) {
            const data = this.dataset[j][this.dataset[j].length - 1];
            if (!this.class_values.find(c => data === c)) {
                this.class_values.push(data);
            }
        }

        // Matriz de confusion
        for (let i = 0; i < this.class_values.length; i++) {
            this.matrix[this.class_values[i]] = {};
            for (let j = 0; j < this.class_values.length; j++) {
                const classValue = this.class_values[j];
                this.matrix[this.class_values[i]][classValue] = 0;
            }
        }
    }

    /**Metodo que carga el dataset externo en memoria */
    loadExternDataset(dataset) {
        this.externDataset = dataset;
    }

    /**Metodo que obtiene la cantidad de datos que seran de entrenamiento */
    getTrainingLength() {
        const numElement = Math.round(this.trainigPercent * this.dataset.length / 100);
        return numElement;
    }

    /**Metodo que separa el dataset por atributos */
    separateData() {

        // arreglos por atributos
        const attributes = this.dataset[0].length;
        for (let i = 0; i < attributes; i++) {
            const attributeArray = [];
            for (let j = 0; j < this.getTrainingLength(); j++) {
                const data = this.dataset[j][i];
                attributeArray.push(data);
            }
            this.splittedDataset.push(attributeArray);
        }

        // clases del dataset
        // for (let j = 0; j < this.getTrainingLength(); j++) {
        //     const data = this.dataset[j][this.dataset[j].length - 1];
        //     if (!this.class_values.find(c => data === c)) {
        //         this.class_values.push(data);
        //     }
        // }

        const attrLength = this.splittedDataset.length - 1;

        // tablas de frecuencia
        for (let i = 0; i < this.getTrainingLength(); i++) {
            const class_value = this.splittedDataset[attrLength][i];
            for (let j = 0; j < attrLength; j++) {
                const attr = this.splittedDataset[j][i];

                this.class_values.forEach(cv => {
                    if (!this.separatedDataset.hasOwnProperty(cv)) {
                        this.separatedDataset[cv] = [];
                        for (let k = 0; k < attrLength; k++) {
                            this.separatedDataset[cv].push([]);
                        }
                    }
                });
                this.separatedDataset[class_value][j].push(attr);
            }
        }

        // creacion matriz de confusion
        // for (let i = 0; i < this.class_values.length; i++) {
        //     this.matrix[this.class_values[i]] = {};
        //     for (let j = 0; j < this.class_values.length; j++) {
        //         const classValue = this.class_values[j];
        //         this.matrix[this.class_values[i]][classValue] = 0;
        //     }
        // }
    }

    /**Metodo que verifica si un arreglo es de variables de tipo numericas */
    isNumeric(attributeArray) {
        let flag = true;
        attributeArray.forEach(element => {
            if (isNaN(element)) {
                flag = false;
            }
        });
        return flag;
    }

    /**Funcion que revuelve un arreglo aleatoriamente*/
    shuffleArray(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    }

    /**Metodo que establece el numero de intervalos que tendra el dataset */
    setK(k) {
        this.k = k;
    }

    /**Metodo que establece intervalos por la discretizacion por anchos */
    equalWidth(arr, index) {
        const max = Math.max(...arr);
        const min = Math.min(...arr);
        const range = (max - min) / this.k;
        let pivot = min;
        const temp = []
        for (let i = 0; i < this.k; i++) {
            temp.push(pivot + range);
            pivot += range;
        }

        this.intervals[index] = temp;
    }

    equalFrecuency(arr, index) {
        const len = arr.length;
        const n = Math.floor(len / this.k);
        let temp = [];
        const arrAux = [];
        let aux = 0;
        // for (let i = 1; i <= len; i++) {
        //     temp.push(arr[i-1]);
        //     if (i % n === 0) {
        //         aux++;
        //         if (aux === parseInt(this.k)) {
        //             let res = len - i;
        //             for (let j = 0; j < res; j++) {
        //                 temp.push(arr[i-1+j]);
        //             }
        //         }
        //         arrAux.push(temp);
        //         temp = [];
        //     }
        // }
        for (let i = 1; i <= len; i++) {
            temp.push(i-1);
            if (i % n === 0) {
                aux++;
                if (aux === parseInt(this.k)) {
                    let res = len - i;
                    for (let j = 0; j < res; j++) {
                        temp.push(i+j);
                    }
                }
                arrAux.push(temp);
                temp = [];
                if (aux === parseInt(this.k)) {
                    break;
                }
            }
        }
        return arrAux;
    }

    getAccuracy() {
        const corrects = [];
        const iterable = Object.entries(this.matrix);
        for (let i = 0; i < this.class_values.length; i++) {
            // console.log(this.class_values[i], iterable[i][0])
            if (iterable[i][0] === this.class_values[i]) {
                corrects.push(iterable[i][1][this.class_values[i]]);
            }
        }

        const correctTotal = corrects.reduce((a, b) => a + b);
        const accuracy = correctTotal / this.pruebaLength
        return accuracy;
    }

    getPrecision() {
        let totalOfClass = 0;
        let correctOfClass = 0;
        let precision = 0;
        const iterable = Object.entries(this.matrix);

        for (let i = 0; i < this.class_values.length; i++) {
            // console.log(this.class_values[i], iterable[i][0])
            // totalOfClass += iterable[i][1][this.class_values[i]];
            for (let j = 0; j < this.class_values.length; j++) {
                totalOfClass += iterable[j][1][this.class_values[i]];
                if (iterable[i][0] === this.class_values[j]) {
                    correctOfClass = iterable[i][1][this.class_values[i]];
                }
            }
            precision += (correctOfClass / totalOfClass);
            totalOfClass = 0;
        }

        precision /= this.class_values.length;
        return precision;
    }

    getRecall() {
        let totalOfClass = 0;
        let correctOfClass = 0;
        let recall = 0;
        const iterable = Object.entries(this.matrix);

        for (let i = 0; i < this.class_values.length; i++) {
            // console.log(this.class_values[i], iterable[i][0])
            // totalOfClass += iterable[i][1][this.class_values[i]];
            for (let j = 0; j < this.class_values.length; j++) {
                totalOfClass += iterable[i][1][this.class_values[j]];
                if (iterable[i][0] === this.class_values[i]) {
                    correctOfClass = iterable[i][1][this.class_values[i]];
                }
            }
            recall += (correctOfClass / totalOfClass);
            totalOfClass = 0;
        }

        recall /= this.class_values.length;
        return recall;
    }

    getF1() {
        const p = this.getPrecision();
        const r = this.getRecall();

        return 2 * (p * r / (p + r));
    }
}
class LogisticRegression {
    constructor(learningRate = 0.01, numIterations = 1000) {
        this.learningRate = learningRate;
        this.numIterations = numIterations;
        this.weights = null;
        this.bias = null;
    }

    sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }

    fit(X, y) {
        const numSamples = X.length;
        const numFeatures = X[0].length;
        this.weights = new Array(numFeatures).fill(0);
        this.bias = 0;

        for (let i = 0; i < this.numIterations; i++) {
            let linearModel = 0;
            for (let j = 0; j < numSamples; j++) {
                linearModel += X[j].reduce((acc, feature, idx) => acc + feature * this.weights[idx], 0) + this.bias;
            }
            const predictions = this.sigmoid(linearModel / numSamples);

            let dw = new Array(numFeatures).fill(0);
            let db = 0;
            for (let j = 0; j < numSamples; j++) {
                for (let k = 0; k < numFeatures; k++) {
                    dw[k] += (1 / numSamples) * X[j][k] * (predictions - y[j]);
                }
                db += (1 / numSamples) * (predictions - y[j]);
            }

            for (let j = 0; j < numFeatures; j++) {
                this.weights[j] -= this.learningRate * dw[j];
            }
            this.bias -= this.learningRate * db;
        }
    }

    predict(X) {
        const predictions = [];
        for (let i = 0; i < X.length; i++) {
            const linearModel = X[i].reduce((acc, feature, idx) => acc + feature * this.weights[idx], 0) + this.bias;
            predictions.push(this.sigmoid(linearModel) >= 0.5 ? 1 : 0);
        }
        return predictions;
    }

    saveModel(filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(this));
    }
}


function preprocessData(data) {
    const X = [];
    const y = [];
    for (const row of data) {
      const features = [];
      for (const key in row) {
        if (key !== "Class") {
          let value = row[key];
          if (key === "sex") {
            value = (value == "F" || value=="female") ? 1 : 0;
          }  else if (value == "t" || value == "true") {
            value = 1;
          } else if (value == "f"|| value == "false" || value === "?") {
            value = 0;
          }
          features.push(parseFloat(value));
        }else{
            if(row[key] == "negative"){
                row[key] = 0
            }else if(row[key] == "compensated hypothyroid"){
                row[key] = 1
            }
            else if(row[key] == "hyperthyroid"){
                row[key] = 2
            }
            else if(row[key] == "primary hypothyroid"){
                row[key] = 3
            }
            else if(row[key] == "primary hypothyroid"){
                row[key] = 3
            }
        }
      }
      X.push(features);
      y.push(parseInt(row["Class"]));
    }
    return { X, y };
  }


const csv = require('csv-parser');
const fs = require('fs');

const filename = 'thyroid.csv';
const data = [];

fs.createReadStream(filename)
    .pipe(csv())
    .on('data', (row) => {
        data.push(row);
    })
    .on('end', () => {
        const { X, y } = preprocessData(data);
        console.log(X, y);
        const numSamples = X.length;
        const numTrainSamples = Math.floor(0.8 * numSamples);
        const XTrain = X.slice(0, numTrainSamples);
        const yTrain = y.slice(0, numTrainSamples);
        const XTest = X.slice(numTrainSamples);
        const yTest = y.slice(numTrainSamples);
        const model = new LogisticRegression(0.1, 1000);
        model.fit(XTrain, yTrain);
        model.saveModel('logistic_regression_model.json');
        const yPred = model.predict(XTest);
        const accuracy = yPred.reduce((acc, pred, idx) => acc + (pred === yTest[idx] ? 1 : 0), 0) / yTest.length * 100;
        console.log("Accuracy:", accuracy, "%");
    });

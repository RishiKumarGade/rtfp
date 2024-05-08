const modelData = require('../logistic_regression_model.json'); // Assuming model data is stored in logistic_regression_model.json

class LogisticRegression {
  constructor(model) {
      if (model) {
          this.learningRate = model.learningRate;
          this.numIterations = model.numIterations;
          this.weights = model.weights;
          this.bias = model.bias;
      } else {
          console.error("Error");
      }
  }

  sigmoid(z) {
      return 1 / (1 + Math.exp(-z));
  }

  predict(X) {
      const predictions = [];
      for (let i = 0; i < X.length; i++) {
          const linearModel = X[i].reduce((acc, feature, idx) => acc + feature * this.weights[idx], 0) + this.bias;
          predictions.push(this.sigmoid(linearModel) >= 0.5 ? 1 : 0);
      }
      return predictions;
  }
}

const model = new LogisticRegression(modelData);

const inputData = [
    {
        "Age": 63,
        "Sex": "F",
        "on thyroxine": "f",
        "query on thyroxine": "f",
        "on antithyroid medication": "f",
        "sick": "f",
        "pregnant": "f",
        "thyroid surgery": "f",
        "I131 treatment": "f",
        "lithium": "f",
        "goitre": "f",
        "tumor": "f",
        "hypopituitary": "f",
        "psych": "f",
        "TSH measured": "t",
        "TSH": 0.03,
        "T3 measured": "t",
        "T3": 5.5,
        "TT4 measured": "t",
        "TT4": 199,
        "T4U measured": "t",
        "T4U": 1.05,
        "FTI measured": "t",
        "FTI": 190, 
        "TBG measured": "f",
        "TBG": 0,
        "referral source": "other"
      }
];



function preprocessData(data) {
  const X = [];
  const y = [];
  for (const row of data) {
      const features = [];
      for (const key in row) {
          if (key !== 'Result') {
              let value = row[key];
              if (key === 'Sex') {
                  value = value === 'F' ? 1 : 0;
              } else if (key === 'referral source') {
                  switch (value) {
                      case 'other':
                          value = 0;
                          break;
                      case 'SVI':
                          value = 1;
                          break;
                      case 'SVHC':
                          value = 2;
                          break;
                      default:
                          value = 3;
                  }
              } else if (value === 't') {
                  value = 1;
              } else if (value === 'f' || value === '?') {
                  value = 0;
              }
              features.push(parseFloat(value));
          }
      }
      X.push(features);
      y.push(parseInt(row['Result']));
  }
  return { X, y };
}

const { X, y } = preprocessData(inputData);
const predictions = model.predict(X);
console.log(X);

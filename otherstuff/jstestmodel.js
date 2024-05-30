const modelData = require('./logistic_regression_model.json'); // Assuming model data is stored in logistic_regression_model.json

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
        "age": 88,
        "sex": "F",
        "on_thyroxine": "f",
        "query_on_thyroxine": "f",
        "on_antithyroid_medication": "f",
        "sick": "f",
        "query_hyperthyroid":"f",
        "query_hypothyroid":"f",
        "pregnant": "f",
        "thyroid surgery": "f",
        "I131 treatment": "f",
        "lithium": "f",
        "goitre": "f",
        "tumor": "f",
        "hypopituitary": "f",
        "psych": "f",
        "TSH": 13,
        "T3": 0,
        "TT4": 123,
        "T4U": 0.99,
        "FTI": 124, 
        
      }
];



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



const { X, y } = preprocessData(inputData);
const predictions = model.predict(X);
console.log(predictions);

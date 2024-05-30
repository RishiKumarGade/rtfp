const http = require("http");
const url = require("url");
const fs = require("fs");
const modelData = require("./logistic_regression_model.json");

// class logistic regression
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
      const linearModel =
        X[i].reduce(
          (acc, feature, idx) => acc + feature * this.weights[idx],
          0
        ) + this.bias;
      predictions.push(this.sigmoid(linearModel) >= 0.5 ? 1 : 0);
    }
    return predictions;
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
          
      }
    }
    X.push(features);
    y.push(parseInt(row["Class"]));
  }
  return { X, y };
}


function PredictForServer(inputData) {
  const model = new LogisticRegression(modelData);
  const { X, y } = preprocessData(inputData);
  const predictions = model.predict(X);
  return predictions;
}

function readHtmlFile(fileName, callback) {
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${fileName}:`, err);
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}

function serveForm(req, res) {
  readHtmlFile("frontend/index.html", (err, formHtml) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(formHtml);
      res.end();
    }
  });
}

function serveResult(req, res, result) {
  readHtmlFile("frontend/result.html", (err, resultHtml) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      resultHtml = resultHtml.replace("{result}", result);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(resultHtml);
      res.end();
    }
  });
}

const server = http.createServer((req, res) => {
  const path = url.parse(req.url).pathname;

  if (req.method === "GET" && path === "/") {
    serveForm(req, res);
  } else if (req.method === "POST" && path === "/result") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const formData = new URLSearchParams(body);
      const age = formData.get("age");
      const sex = formData.get("sex");
      const onthyroxine = formData.get("on_thyroxine");
      const queryonthyroxine = formData.get("query_on_thyroxine");
      const onantithyroidmedication = formData.get("on_antithyroid_medication");
      const sick = formData.get("sick");
      const pregnant = formData.get("pregnant");
      const thyroidsurgery = formData.get("thyroid_surgery");
      const I131treatment = formData.get("I131_treatment");
      const lithium = formData.get("lithium");
      const goitre = formData.get("goitre");
      const tumor = formData.get("tumor");
      const queryhypothyroid = formData.get("query_hypothyroid");
      const queryhyperthyroid = formData.get("query_hyperthyroid");
      const hypopituitary = formData.get("hypopituitary");
      const psych = formData.get("psych");
      const TSH = formData.get("TSH");
      const T3 = formData.get("T3");
      const TT4 = formData.get("TT4");
      const T4U = formData.get("T4U");
      const FTI = formData.get("FTI");
      const inputData = [
        {
          "age": age,
          'sex': sex,
          "on_thyroxine": onthyroxine,
          "query_on_thyroxine": queryonthyroxine,
          "on_antithyroid_medication": onantithyroidmedication,
          'sick': sick,
          'pregnant': pregnant,
          "thyroid_surgery": thyroidsurgery,
          "I131_treatment": I131treatment,
          'lithium': lithium,
          'goitre': goitre,
          'tumor': tumor,
          "hypopituitary": hypopituitary,
          "psych": psych,
          "TSH":TSH,
          "T3": T3,
          'TT4': TT4,
          'T4U': T4U,
          'FTI': FTI,
          'query_hypothyroid':queryhypothyroid,
          'query_hyperthyroid':queryhyperthyroid,
        },
      ];
      const result = PredictForServer(inputData);
      serveResult(req, res, result[0]);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.write("<h1>404 Not Found</h1>");
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

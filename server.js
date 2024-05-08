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
      if (key !== "Result") {
        let value = row[key];
        if (key === "Sex") {
          value = (value == "F" || value=="female") ? 1 : 0;
        } else if (key === "referral source") {
          switch (value) {
            case "other":
              value = 0;
              break;
            case "SVI":
              value = 1;
              break;
            case "SVHC":
              value = 2;
              break;
            default:
              value = 3;
          }
        } else if (value == "t" || value == "true") {
          value = 1;
        } else if (value == "f"|| value == "false" || value === "?") {
          value = 0;
        }
        features.push(parseFloat(value));
      }
    }
    X.push(features);
    y.push(parseInt(row["Result"]));
  }
  return { X, y };
}

function PredictForServer(inputData) {
  const model = new LogisticRegression(modelData);
  const { X, y } = preprocessData(inputData);
  console.log(X)
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
      const gender = formData.get("gender");
      const onthyroxine = formData.get("on thyroxine");
      const queryonthyroxine = formData.get("query on thyroxine");
      const onantithyroidmedication = formData.get("on antithyroid medication");
      const sick = formData.get("sick");
      const pregnant = formData.get("pregnant");
      const thyroidsurgery = formData.get("thyroid surgery");
      const I131treatment = formData.get("I131 treatment");
      const lithium = formData.get("lithium");
      const goitre = formData.get("goitre");
      const tumor = formData.get("tumor");
      const hypopituitary = formData.get("hypopituitary");
      const psych = formData.get("psych");
      const TSHmeasured = formData.get("TSH measured");
      const TSH = formData.get("TSH");
      const T3measured = formData.get("T3 measured");
      const T3 = formData.get("T3");
      const TT4measured = formData.get("TT4 measured");
      const TT4 = formData.get("TT4");
      const T4Umeasured = formData.get("T4U measured");
      const T4U = formData.get("T4U");
      const FTImeasured = formData.get("FTI measured");
      const FTI = formData.get("FTI");
      const TBGmeasured = formData.get("TBG measured");
      const TBG = formData.get("TBG");
      const referralsource = formData.get("referral source");
      const inputData = [
        {
          "Age": age,
          'Sex': gender,
          "on thyroxine": onthyroxine,
          "query on thyroxine": queryonthyroxine,
          "on antithyroid medication": onantithyroidmedication,
          'sick': sick,
          'pregnant': pregnant,
          "thyroid surgery": thyroidsurgery,
          "I131 treatment": I131treatment,
          'lithium': lithium,
          'goitre': goitre,
          'tumor': tumor,
          "hypopituitary": hypopituitary,
          "psych": psych,
          "TSH measured": TSHmeasured,
          "TSH":TSH,
          "T3 measured": T3measured,
          "T3": T3,
          "TT4 measured": TT4measured,
          'TT4': TT4,
          "T4U measured": T4Umeasured,
          'T4U': T4U,
          "FTI measured": FTImeasured,
          'FTI': FTI,
          "TBG measured": TBGmeasured,
          'TBG': TBG,
          "referral source": referralsource,
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

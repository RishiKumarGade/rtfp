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
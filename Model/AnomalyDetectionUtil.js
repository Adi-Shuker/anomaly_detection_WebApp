const math = require('mathjs')

class AnomalyDetectionUtil {
    static getVariance(values) {
        return math.variance(values)
    }

    static getCovariance(xValues, yValues) {
        const xExpectancy = math.mean(xValues)
        const yExpectancy = math.mean(yValues)
        let sum = 0
        const length = xValues.length
        for (let i = 0; i < length; i++) {
            sum += (xValues[i] - xExpectancy) * (yValues[i] - yExpectancy)
        }
        return sum / length
    }

    static getPearson(xValues, yValues) {
        const xDeviation = math.sqrt(this.getVariance(xValues))
        const yDeviation = math.sqrt(this.getVariance(yValues))
        const cov = this.getCovariance(xValues, yValues)
        return cov / (xDeviation * yDeviation)
    }

    static getLinearRegression(xValues, yValues) {
        const cov = this.getCovariance(xValues, yValues)
        const xVariance = this.getVariance(xValues)
        const m = cov / xVariance
        const n = math.mean(yValues) - m * math.mean(xValues)

        return {m: m, n: n}
    }

    static getDeviation(point, line) {
        const yLine = line.m * point.x + line.n
        return math.abs(yLine - point.y)
    }
}

module.exports = AnomalyDetectionUtil

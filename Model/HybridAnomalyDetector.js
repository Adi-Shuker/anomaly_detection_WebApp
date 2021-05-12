const enclosingCircle = require('smallest-enclosing-circle')
const math = require('mathjs')

const SimpleAnomalyDetector = require('./SimpleAnomalyDetector')
const AnomalyDetectionUtil = require('./AnomalyDetectionUtil')
const CorrelationType = require('./CorrelationType')

const RADIUS_BIAS = 1.1
const DEV_THRESHOLD_BIAS = 1.15

class HybridAnomalyDetector extends SimpleAnomalyDetector {
    constructor(high_threshold, low_threshold) {
        super(high_threshold);
        this.low_threshold = low_threshold
    }

    learnNormal(timeSeries) {
        const features = timeSeries.getFeatures()

        features.forEach(feature => {
            const { max_correlated_feature, max_correlation } = super.getMaxCorrelation(feature, timeSeries)

            const feature1_values = timeSeries.getFeatureValues(feature)
            const feature2_values = timeSeries.getFeatureValues(max_correlated_feature)

            // high correlation
            if (max_correlation >= this.threshold) {
                const linear_reg = AnomalyDetectionUtil.getLinearRegression(feature1_values, feature2_values)
                const deviation = super.getMaxDeviation(feature1_values, feature2_values, linear_reg)
                // add to correlated features
                this.correlatedFeatures.push({
                    correlationType: CorrelationType.high,
                    feature1: feature,
                    feature2: max_correlated_feature,
                    linear_reg: linear_reg,
                    correlation: max_correlation,
                    threshold: deviation * DEV_THRESHOLD_BIAS
                })
            // low correlation
            } else if (max_correlation >= this.low_threshold) {
                const min_circle = this.getMinEnclosingCircle(feature1_values, feature2_values)
                this.correlatedFeatures.push({
                    correlationType: CorrelationType.low,
                    feature1: feature,
                    feature2: max_correlated_feature,
                    circle: {center: min_circle.center, radius: min_circle.radius * RADIUS_BIAS}
                })
            }
        })
    }

    setCorrelatedFeatures(correlatedFeatures){
        this.correlatedFeatures = correlatedFeatures;
    }

    // **************** Private Methods *********************

    getMinEnclosingCircle(feature1_values, feature2_values) {
        const points = this.arraysToPoints(feature1_values, feature2_values)
        const circle = enclosingCircle(points)
        return {center: {x: circle.x, y: circle.y}, radius: circle.r}
    }

    arraysToPoints(feature1_values, feature2_values) {
        let points = []
        for (let i = 0; i < feature2_values.length; i++) {
            points.push({x: feature1_values[i], y: feature2_values[i]})
        }
        return points
    }

    isAnomaly(value1, value2, correlatedFeaturesData) {
        if (correlatedFeaturesData.correlationType === CorrelationType.high) {
            return super.isAnomaly(value1, value2, correlatedFeaturesData)
        }
        return !this.isPointInCircle({x: value1, y: value2}, correlatedFeaturesData.circle)
    }

    isPointInCircle(point, circle) {
        const distance = HybridAnomalyDetector.distance(point, circle.center)
        return distance <= circle.radius
    }

    static distance(p1, p2) {
        const squareX = math.pow(p1.x - p2.x, 2)
        const squareY = math.pow(p1.y - p2.y, 2)
        return math.sqrt(squareX + squareY)
    }
}

module.exports = HybridAnomalyDetector

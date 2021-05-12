const math = require('mathjs')

const AnomalyDetectionUtil = require('./AnomalyDetectionUtil')
const CorrelationType = require('./CorrelationType')

const DEV_THRESHOLD_BIAS = 1.15

class SimpleAnomalyDetector {
    constructor(threshold) {
        this.threshold = threshold
        this.correlatedFeatures = []
    }

    setCorrelatedFeatures(correlatedFeatures){
        this.correlatedFeatures = correlatedFeatures;
    }

    learnNormal(timeSeries) {
        const features = timeSeries.getFeatures()

        features.forEach(feature => {
            const { max_correlated_feature, max_correlation } = this.getMaxCorrelation(feature, timeSeries)
            if (max_correlation < this.threshold) {
                return
            }
            const feature1_values = timeSeries.getFeatureValues(feature)
            const feature2_values = timeSeries.getFeatureValues(max_correlated_feature)
            const linear_reg = AnomalyDetectionUtil.getLinearRegression(feature1_values, feature2_values)
            const deviation = this.getMaxDeviation(feature1_values, feature2_values, linear_reg)
            // add to correlated features
            this.correlatedFeatures.push({
                correlationType: CorrelationType.high,
                feature1: feature,
                feature2: max_correlated_feature,
                linear_reg: linear_reg,
                correlation: max_correlation,
                threshold: deviation * DEV_THRESHOLD_BIAS
            })
        })
    }
    detect(timeSeries) {
        let report = []
        this.correlatedFeatures.forEach(cf => {
            const feature1 = cf.feature1
            const feature2 = cf.feature2
            const feature1_values = timeSeries.getFeatureValues(feature1)
            const feature2_values = timeSeries.getFeatureValues(feature2)
            const size = feature1_values.length
            for (let i = 0; i < size; i++) {
                if (this.isAnomaly(feature1_values[i], feature2_values[i], cf)) {
                    report.push({
                        description: feature1 + "-" + feature2,
                        timeStep: i
                    })
                }
            }
        })

        return report
    }

    // *************** Private Methods **********************

    getMaxCorrelation(feature1, timeSeries) {
        const features = timeSeries.getFeatures()
        const feature1_values = timeSeries.getFeatureValues(feature1)

        let max_correlation = 0
        let max_correlated_feature = null
        const feature1_index = features.indexOf(feature1)
        // starting from index + 1 because we want to check only for features that appear after out feature
        for (let i = feature1_index + 1; i < features.length; i++) {
            const feature2_values = timeSeries.getFeatureValues(features[i])
            const temp_correlation = math.abs(AnomalyDetectionUtil.getPearson(feature1_values, feature2_values))
            if (temp_correlation > max_correlation) {
                max_correlation = temp_correlation
                max_correlated_feature = features[i]
            }
        }

        return { max_correlated_feature: max_correlated_feature, max_correlation: max_correlation }
    }

    getMaxDeviation(feature1_values, feature2_values, linear_reg) {
        let max_dev = 0
        for (let i = 0; i < feature1_values.length; i++) {
            const point = {x: feature1_values[i], y: feature2_values[i]}
            const temp_dev = AnomalyDetectionUtil.getDeviation(point, linear_reg)
            if (temp_dev > max_dev) {
                max_dev = temp_dev
            }
        }
        return max_dev
    }

    isAnomaly(value1, value2, correlatedFeaturesData) {
        const dev = AnomalyDetectionUtil.getDeviation({x: value1, y: value2}, correlatedFeaturesData.linear_reg)
        return dev > correlatedFeaturesData.threshold
    }
}

module.exports = SimpleAnomalyDetector

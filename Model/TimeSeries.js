const fs = require('fs')

class TimeSeries {

    // ***************** Public Methods **************************

    constructor(line) {
        const lines = line
        this.features = lines[0].split(',') // features are in the first line
        lines.shift()
        this.data = this.extractDataFromCsvLines(lines)
        this.num_of_rows = this.data[this.features[1]].length
    }

    getFeatures() {
        return this.features
    }

    getFeatureValues(feature) {
        return this.data[feature]
    }

    getData() {
        return this.data
    }

    getNumOfRows() {
        return this.num_of_rows
    }

    // ***************** Internal Methods ************************

    extractCsvLines(csvPath) {
        const allData = fs.readFileSync(csvPath, 'utf-8')
        return allData.split('\r\n') // split by lines
    }

    extractDataFromCsvLines(lines) {
        let data = {}
        for (let i = 0; i < this.features.length; i++) {
            if (this.features[i] in data) {
                delete data[this.features[i - 1]]
                this.features[i - 1] += " 1"
                data[this.features[i - 1]] = []
                this.features[i] += " 2"
                data[this.features[i]] = []
            } else {
                data[this.features[i]] = []
            }
        }
        lines.forEach(line => {
            const splitLine = line.split(',')
            for (let i = 0; i < splitLine.length; i++) {
                data[this.features[i]].push(parseFloat(splitLine[i]))
            }
        })
        return data
    }
}

module.exports = TimeSeries;

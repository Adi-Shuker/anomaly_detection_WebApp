//imports modules
const express = require('express')
const fileUpload = require('express-fileupload')
const app = express()
const SimpleAnomalyDetector = require("../Model/SimpleAnomalyDetector");
const HybridAnomalyDetector = require("../Model/HybridAnomalyDetector");
const TimeSeries = require("../Model/TimeSeries");
const fs = require('fs')


function createTableRow(feature1, feature2, timeStep) {
    const openTd = "<td class=\"mdl-data-table__cell--non-numeric\">"
    const closeTd = "</td>"
}

function createAnomaliesView(anomalies) {
    let basicHtml = fs.readFileSync('View/showAnomalies.html', 'utf-8')
    const tbody = "<tbody>"
    const tillBody = basicHtml.slice(0, basicHtml.indexOf(tbody) + tbody.length)
    const fromBody = basicHtml.slice(basicHtml.indexOf(tbody) + tbody.length)
    const openTr = "<tr>"
    const closeTr = "</tr>"
    const openTd = "<td class=\"mdl-data-table__cell--non-numeric\" style=\"text-align: center\">"
    const closeTd = "</td>"

    let tableRows = ""
    let anomaliesItems = JSON.stringify(anomalies).split('description')
    for (let itemIndex = 1; itemIndex < anomaliesItems.length; itemIndex++) {
        tableRows += "\n" + openTr
        let feature1 = anomaliesItems[itemIndex].split(",")[0].split(':')[1].
                                                 split('-')[0].split('"')[1]
        tableRows += "\n" + openTd + feature1 + closeTd

        let feature2 = anomaliesItems[itemIndex].split(",")[0].split(':')[1].
                                                 split('-')[1].split('"')[0]
        tableRows += "\n" + openTd + feature2 + closeTd

        let timeStep = anomaliesItems[itemIndex].split(",")[1].split(":")[1].
                                                 split("}")[0]
        tableRows += "\n" + openTd + timeStep + closeTd
        tableRows += "\n" + closeTr
    }

    return tillBody + "\n" + tableRows + "\n" + fromBody
}

//define app uses
app.use(express.urlencoded({
    extended: false
}))
app.use(fileUpload({}))
app.use(express.static('View'))
//Get Method for '/' url
app.get('/', (req, res) => {
    res.sendFile('index.html')
})
app.post('/detect', async (req, res) =>{
    const modelType = req.body.algorithms
    const trainData = req.files.train_data.data.toString();
    const predictData = req.files.predict_data.data.toString();
    const trainTimeSeries = new TimeSeries(trainData);
    const predictTimeSeries = new TimeSeries(predictData);
    let detector;

    if(modelType ==='hybrid'){
        detector = new HybridAnomalyDetector(0.9, 0.5);
    }else{
        detector = new SimpleAnomalyDetector(0.9);
    }
    try {
        detector.learnNormal(trainTimeSeries);
        const anomalies = await detector.detect(predictTimeSeries);
        res.send(createAnomaliesView(anomalies))
    } catch (e) {
        console.log("")
        res.sendFile('showError.html', {root: 'View'})
    }
})
//starting server on port 8080
app.listen(8080, ()=>console.log("server started at 8080"))

//imports modules
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const fileUpload = require('express-fileupload')
const app = express()
const SimpleAnomalyDetector = require("../Model/SimpleAnomalyDetector");
const HybridAnomalyDetector = require("../Model/HybridAnomalyDetector");
const TimeSeries = require("../Model/TimeSeries");
const fs = require('fs')

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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


app.post('/showAnomalies', async (req, res) => {
    const data = {
        algorithms: req.body.algorithms,
        trainData: req.files.train_data.data.toString(),
        predictData: req.files.predict_data.data.toString()
    }
    axios.post('http://localhost:8080/detect', data)
        .then(response => {
            res.send(createAnomaliesView(response.data))
        })
        .catch(error => {
            res.status(400)
            res.sendFile('showError.html', {root: 'View'})
        })
})


app.post('/detect', async (req, res) =>{
    const modelType = req.body.algorithms
    const trainData = req.body.trainData
    const predictData = req.body.predictData
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
        // res.send(createAnomaliesView(anomalies))
        res.send(anomalies)
    } catch (e) {
        res.status(400)
    }
})
//starting server on port 8080
app.listen(8080, ()=>console.log("server started at 8080"))

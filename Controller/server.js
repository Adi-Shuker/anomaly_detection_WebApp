//imports modules
const express = require('express')
const fileUpload = require('express-fileupload')
const model = require('../Model/SearchInFile')
const app = express()
const SimpleAnomalyDetector = require("../Model/SimpleAnomalyDetector");
const HybridAnomalyDetector = require("../Model/HybridAnomalyDetector");
const TimeSeries = require("../Model/TimeSeries");
//define app uses
app.use(express.urlencoded({
    extended: false
}))
app.use(fileUpload({}))
app.use(express.static('../View'))
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
    detector.learnNormal(trainTimeSeries);
    const anomalies = await detector.detect(predictTimeSeries);
    res.json({anomalies});
    res.end();
})
//starting server on port 8080
app.listen(8080, ()=>console.log("server started at 8080"))
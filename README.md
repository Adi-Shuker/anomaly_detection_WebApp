# Anomaly Detection Server

# About The Project

Anomaly Detection Server is a web application for detecting anomalies based on a specific algorithm. The user can select an algorithm in a drop-down list
that includes a based algorithm regression and an hybrid algorithm and upload two csv files. To submit, he has to click on the button "submit" and then the files are uploaded to the server.<br>

The two data files to upload are:  <br>
1) csv file for the valid flight  <br>
2) csv file for the the flight to detect. <br>

Each file contains the values of the features per second during the flight. <br>

The server learns from the valid data file the normal behavior of the flight and according to it, detects anomalies in the second file. <br>
The detected anomalies are displayed in a table. This table lists all the anomalies with 3 columns: the 2 most correlatives features and the time when the anomaly occurs.

<br>


 ![alt tag](https://user-images.githubusercontent.com/81378726/119662574-35819f00-be3a-11eb-8b7c-0600d24e81c4.PNG)
<br>


# Getting Started

# Prerequisites

1) Install node.js   https://nodejs.org/en/download/  <br>
2) Make sure that npm is well installed   https://www.npmjs.com/get-npm  <br>


# Download

Options to download the app: <br>

- Clone the repository https://github.com/Adi-Shuker/anomaly_detection_WebApp.
- Download the zip.

# Usage

1) Enter in the command line of the clone repository <br>
2) Run the following commands <br>

```bash
npm install
cd Controller
npm install
cd ..
npm start
```
<br>


3) Open the browser at the address http://localhost:8080/
4) Upload your csv files and choose an anomaly detector algorithm. <br>
5) Press *Submit* to start the anomalies detection. <br>

<br>


 ![alt tag](https://user-images.githubusercontent.com/81378726/120083029-bf499a80-c0ce-11eb-99e0-47e040bda3c4.PNG)
<br>

# Code Design and UML:

<br>


 ![alt tag](https://user-images.githubusercontent.com/81378726/119666759-52b86c80-be3e-11eb-9051-38f140096914.PNG)
<br>
   
<br>


 ![alt tag](https://user-images.githubusercontent.com/81378726/119666808-5f3cc500-be3e-11eb-968b-58a13a7996af.PNG)
<br>

The architecture of the app is based on the *MVC* architectural pattern. <br>
The Model-View-Controller (MVC) is an architectural pattern that separates an application into three main logical components: the model, the view, and the controller.<br>
Each of these components are built to handle specific development aspects of an application.<br>
MVC is one of the most frequently used industry-standard web development framework to create scalable and extensible projects.




# Video Explanation 

https://youtu.be/Vu_vjSpWLh8

# Contributors
This program was developed by Adi-Shuker, Shana026, yairshp

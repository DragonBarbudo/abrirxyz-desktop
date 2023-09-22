

import {blobToWebP, arrayBufferToWebP } from 'webp-converter-browser'


import './index.css';

const {ipcRenderer, remote} = require('electron');

//const ipcRenderer = window.ipcRenderer;



document.body.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
});



function convertFilePathToResult(filePath) {
    // Use string manipulation to extract the name from the filePath
    var fileName = filePath.split('/').pop().split('.').shift();
  
    var result = {
      name: fileName,
      origin: filePath,
      webp: filePath.replace(/\.[^.]+$/, '.webp'), // Replace any file extension with .webp
    };
  
    return result;
  }


const convertit = async(fileBuffer, fileBlob, filePath, fileWebp) => {

    const webpBlob = await blobToWebP(fileBlob, { /** options */ })
    const webpBuffer = await webpBlob.arrayBuffer()
    const url = URL.createObjectURL(webpBlob);
    

    var reader = new FileReader();
    reader.readAsDataURL(webpBlob); 
    reader.onloadend = function() {
        var base64data = reader.result;

        const sendData = JSON.parse(JSON.stringify({ fileWebp, base64data }))
        console.log(sendData)
       ipcRenderer.send('write-webp-file', sendData);
    }
    }


document.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    readfiles(event)
});

async function readfiles(event) {
    for (const f of event.dataTransfer.files) {
        const reader = new FileReader();

        reader.onload = async function () {

            const thefileBuffer = await readFileAsArrayBuffer(f); // Read the file as ArrayBuffer
            const thefileBlob = new Blob([thefileBuffer], { type: f.type });
            const thefilePath = f.path
            const thefileWebp = modifyFilePath(f.path); // Modify the file path

            // Now you can do something with the fileBlob, fileBuffer, and the modified filepath
            convertit(thefileBuffer, thefileBlob, thefilePath, thefileWebp);
        };

        reader.readAsDataURL(f); // You can use readAsArrayBuffer() for other types of data
    }
}

async function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}

function modifyFilePath(originalFileName) {
    // Use string manipulation to remove the extension and add ".webp"
    const fileNameWithoutExtension = originalFileName.split('.').shift();
    const modifiedFilePath = `${fileNameWithoutExtension}.webp`;
    return modifiedFilePath;
}
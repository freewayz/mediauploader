import {htmlContainer} from './template'


function FSMediaUploader(selector) {
    if (typeof selector === 'string') {
        this.els = document.getElementById(selector);
    } else if (selector.length) {
        this.els = selector;
    } else {
        this.els = [selector];
    }
}


function validateFiles(uploadedFiles) {
    for (var x = 0; x < uploadedFiles.length; x++) {
        console.log(uploadedFiles[x]);
    }
}

function fileInfo(file) {

    return `
            <span> ${file.name}</span>
            <span>Size:${file.size} MB</span>
        `
}

function uploadError(file, errorMsg) {
    return ` <span> ${file.name} </span> <span> ${errorMsg} </span>`
}

function convertImageStream(imagePreviewer, file) {
    var fileReader = new FileReader();
    fileReader.onload = function () {
        imagePreviewer.src = fileReader.result;
    }
    fileReader.readAsDataURL(file);
}

function preview(src) {
    var imageContainer = document.createElement('div')
    imageContainer.classList.add('column')
    imageContainer.classList.add('is-3')
    var image = document.createElement('img')
    image.setAttribute('id', 'imgPreview')
    imageContainer.appendChild(image)
    return  { imageContainer, image }
}

function sendUpload(url, jsonData) {
    return new Promise(function (success, fail) {
        var req = new XMLHttpRequest();
        req.open('POST', url, true);
        req.addEventListener('load', function () {
            if (req.status < 400) {
                success(req)
            } else {
                fail(new Error('Network Error ....'))
            }
        });
        req.addEventListener('error', function () {
            fail(req);
        });

        req.send(jsonData)
    });
}




FSMediaUploader.prototype = {
    allowedFiles: [
        '.jpg', '.png'
    ],

    initialize: function (uploadUrl) {
        // create our uploader widget
        this.uploadUrl = uploadUrl;
        this.els.innerHTML = this.html();
        this.registerEvents();
    },

    closeHandler: function(closeCallback) {
        this.closeCallback = closeCallback
    },

    /**
     * Hack to allow our application 
     * to have reference to it self
     * Since event listener this are bounded
     * to the event trigger
     */
    registerEvents: function () {
        var self = this;
        this.els.querySelector('#uploadButton').addEventListener('click', function (e) {
            return self.processUpload(e)
        });
        this.els.querySelector('#cancleButton').addEventListener('click',this.closeCallback);
        var uploaderInput = this.els.querySelector('#fileUpload')
        uploaderInput.addEventListener('change', function (e) {
            return self.renderFilesInfo(e);
        })
        uploaderInput.addEventListener('dragover', function (e) {
            return self.dropOver(e);
        });
        uploaderInput.addEventListener('drop', function (e) {
            return self.renderFilesInfo(e)
        });

    },

    processUpload: function (event) {
        event.preventDefault();
        const uploadedInputFiles = this.els.querySelector('#fileUpload');
        const files = uploadedInputFiles.files;
        var errorLog = document.getElementById('uploadError');
        for (var f = 0; f < files.length; f++) {
            var formData = new FormData();
            formData.append('file', files[f], files[f].name);
            sendUpload(this.uploadUrl, formData).then(function (response) {
                // todo add a callback to the users of this module
            }).catch(function (error) {
                const err = document.createElement('div');
                err.innerHTML = uploadError(files[f], error.statusMsg)
                errorLog.appendChild(err);
            });
        }
    },

    renderFilesInfo: function (event) {
        var uploadedInputFiles = document.getElementById('fileUpload');
        var files = uploadedInputFiles.files;
        var infoElm = document.getElementById('fileInfos');
        var imageContainer = document.getElementById('imagesContainer');
        for (var i = 0; i < files.length; i++) {
            var infoDetails = document.createElement('div')
            infoDetails.innerHTML = fileInfo(files[i])
            infoElm.appendChild(infoDetails);
            // show the image container preview
            var imageToShow = preview()
            imageContainer.appendChild(imageToShow.imageContainer)
            convertImageStream(imageToShow.image, files[i])
        }
    },

    setUrl: function(url) {
        this.uploadUrl = url;
    },

    html: function () {
        return htmlContainer;
    },

    dropOver: function (event) {
        event.preventDefault()
    },

    drop: function (event) {
        event.preventDefault()
    },

    map: function (callback) {
        var results = [],
            i = 0;
        for (; i < this.length; i++) {
            results.push(callback.call(this, this[i], i));
        }
        return results;
    },
}
export default FSMediaUploader
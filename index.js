window._mu = (function () {
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

    function convertImageStream(imagePreviewer, file) {
        var fileReader = new FileReader();
        fileReader.onload = function () {
            imagePreviewer.src = fileReader.result;
        }
        fileReader.readAsDataURL(file);
    }

    function preview (src) {
        var imageContainer = document.createElement('img')
        imageContainer.setAttribute('id', 'imgPreview')
        return imageContainer
    }
    function sendUpload (url, jsonData) {
        return new Promise(function(success, fail) {
            var req  = new XMLHttpRequest();
            req.open('POST', url, true );
            req.addEventListener('load', function(){
                if (req.status < 400) {
                    success(req)
                } else {
                    fail(new Error('Network Error ....'))
                }
            });

            req.addEventListener('error', function() {
                fail(req);
            });

            req.send(jsonData)
        });
    }

    function FSMediaUploader(els) {
        this.els = els;
    }



    FSMediaUploader.prototype = {
        allowedFiles: [
            '.jpg', '.png'
        ],

        show: function (uploadUrl) {
            // create our uploader widget
            this.uploadUrl = uploadUrl;
            this.els.innerHTML = this.html();
        },


        /**
         * Hack to allow our application 
         * to have reference to it self
         * Since event listener this are bounded
         * to the event trigger
         */
        registerEvents: function() {
            var self = this;
            this.els.querySelector('#uploadButton').addEventListener('click', function(e){
                return self.processUpload(e)
            })
            var uploaderInput = this.els.querySelector('#fileUpload')
            uploaderInput.addEventListener('change', function(e){
                return self.renderFilesInfo(e);
            })
            uploaderInput.addEventListener('dragover', function(e){
                return self.dropOver(e);
            });
            uploaderInput.addEventListener('drop', function(e){
                return this.renderFilesInfo(e)
            });
        },

        processUpload: function (event) {
            event.preventDefault();
            console.log('Self ', this.querySelector('#fileUpload'))
            const uploadedInputFiles = document.getElementById('fileUpload');
            const files = uploadedInputFiles.files;
            var formData = new FormData();            
            for (var f = 0; f < files.length; f++) {
                formData.append(`photo_${f}`, files[f]);
            }
            // validateFiles(uploadedFiles.files);
            sendUpload(this.uploadUrl, formData).then(function(response) {
                console.log('Response from server ', JSON.stringify(response))
            }).catch(function(error) {
                console.log('Error loading images')
            })

        },

        renderFilesInfo: function (event) {
            // console.log('This is processing', this.)
            var uploadedInputFiles = document.getElementById('fileUpload');
            var files = uploadedInputFiles.files;
            var infoElm = document.getElementById('fileInfos');
            var imageContainer = document.getElementById('imagesContainer');
            for (var i = 0; i < files.length; i++) {
                var infoDetails = document.createElement('div')
                infoDetails.innerHTML = fileInfo(files[i])
                infoElm.appendChild(infoDetails);
                // show the image container preview
                let imageToShow = preview()
                imageContainer.appendChild(imageToShow)
                convertImageStream(imageToShow, files[i])
            }
        },


        html: function () {
            let htmlTemplate = `
            <div> 
                <input type="file" id="fileUpload" multiple/>
            </div>
            <div>
                <input type="text" placeholder="Album Name" />
            </div>
            <button id="uploadButton"> Upload </button>

            <div id="fileInfos">
                Files Info
            </div>

            <div id="imagesContainer">

            </div>
        `
            return htmlTemplate;
        },



        dropOver: function (event) {
            event.preventDefault()
            console.log('Drop over ')
        },

        drop: function (event) {
            event.preventDefault()
            console.log('Dropped file')
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

    var mu = {
        init: function (selector) {
            var els;
            if (typeof selector === 'string') {
                els = document.getElementById(selector);
                console.log('FsMediaUpload() initialize');
            } else if (selector.length) {
                els = selector;
            } else {
                els = [selector];
            }
            return new FSMediaUploader(els);
        }
    }

    return mu;
}());
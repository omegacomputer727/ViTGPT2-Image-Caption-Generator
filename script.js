const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const uploadBtn = document.getElementById('uploadBtn');
const captionElement = document.getElementById('caption');
const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadBtn.style.display = 'inline-block';
            dropArea.style.display = 'none';
            captionElement.textContent = '';
            uploadAnotherBtn.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}

uploadBtn.addEventListener('click', uploadImage);

function uploadImage() {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);

    fetch('/caption', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        captionElement.textContent = data.description;
        uploadBtn.style.display = 'none';
        uploadAnotherBtn.style.display = 'inline-block';
    })
    .catch(error => {
        console.error('Error:', error);
        captionElement.textContent = 'An error occurred while generating the caption: ' + error.message;
        uploadAnotherBtn.style.display = 'inline-block';
    });
}

uploadAnotherBtn.addEventListener('click', resetUpload);

function resetUpload() {
    imagePreview.style.display = 'none';
    uploadBtn.style.display = 'none';
    captionElement.textContent = '';
    uploadAnotherBtn.style.display = 'none';
    dropArea.style.display = 'block';
    fileInput.value = '';
}
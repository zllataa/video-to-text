
const uploadButton = document.getElementById('video-upload');
const fileInput = document.getElementById('file-input');

// Обробник події кліка на зображення, яке викличе клік на прихованому input-полі
uploadButton.addEventListener('click', function() {
    fileInput.click();
});

const startButton = document.getElementById('start-process');
const deleteButton = document.getElementById('delete-data');



// Start Process
startButton.addEventListener('click', function() {
    const file = fileInput.files[0];
    const selectedLanguage = document.getElementById('language-select').value;

    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', selectedLanguage);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Сталася помилка при завантаженні файлу.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Відповідь сервера:', data);
            const textarea = document.querySelector('textarea');
            textarea.value = data.transcription;
        })
        .catch(error => {
            console.error('Помилка завантаження файлу:', error.message);
            alert('Сталася помилка при завантаженні файлу. Будь ласка, спробуйте ще раз.');
        });

        const videoElement = document.getElementById('uploaded-video');
        videoElement.src = URL.createObjectURL(file);
        videoElement.style.display = 'block';
    }
});

// Delete Data
deleteButton.addEventListener('click', function() {
    // Видаляємо аудіозапис з сервера
    fetch('/delete', {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log('Дані успішно видалено');
            // Очищаємо значення textarea та приховуємо відео
            document.querySelector('textarea').value = '';
            document.getElementById('uploaded-video').style.display = 'none';
        } else {
            console.error('Не вдалося видалити дані');
        }
    })
    .catch(error => {
        console.error('Помилка видалення даних:', error);
    });
});



// Language
const languageSelect = document.getElementById('language-select');
languageSelect.addEventListener('change', function(event) {
    const selectedLanguage = event.target.value; // Отримуємо вибрану мову
    const file = fileInput.files[0]; // Отримуємо вибраний файл

    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', selectedLanguage); // Додаємо мову до formData

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            const textarea = document.querySelector('textarea');
            textarea.value = data.transcription;
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });

        const videoElement = document.getElementById('uploaded-video');
        videoElement.src = URL.createObjectURL(file);
        videoElement.style.display = 'block';
    }
});


const copyButton = document.getElementById('copy-button');

copyButton.addEventListener('click', function() {
    const textarea = document.getElementById('textarea');
    textarea.select(); // Виділяємо текст у полі textarea
    document.execCommand('copy'); // Копіюємо виділений текст у буфер обміну
    alert('Text copied to clipboard'); // Повідомлення про успішне копіювання
});

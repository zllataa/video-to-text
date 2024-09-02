//imports
const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({ dest: __dirname + '/upload' });
const fs = require('fs');
const { exec } = require('child_process');
const { SpeechClient } = require('@google-cloud/speech');
const path = require('path');


// Configuration for SpeechClient
const speechClient = new SpeechClient();
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'key.json';

// static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))

// set views
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('', (req, res) => {
    res.render('index')
})

// Upload files
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const videoPath = req.file.path;
        const language = req.body.language || 'uk-UA'; 
        const transcriptionResult = await transcribeVideo(videoPath, language);
        res.json({ transcription: transcriptionResult });
    } catch (error) {
        console.error('Помилка:', error);
        res.status(500).json({ error: 'Виникла помилка при розпізнаванні тексту' });
    }
});

// розпізнавання тексту у відео з підтримкою мови
async function transcribeVideo(videoPath, language) {
    const audioPath = await extractAudioFromVideo(videoPath);
    const file = fs.readFileSync(audioPath);
    const audioBytes = file.toString('base64');
    const audio = { content: audioBytes };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 44100,
        languageCode: language 
    };
    const [response] = await speechClient.recognize({ audio, config });
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    return transcription;
}

// вилучення аудіодоріжки з відео
function extractAudioFromVideo(videoPath) {
    return new Promise((resolve, reject) => {
        const outputPath = 'output_audio.wav'; 

        // ffmpeg для вилучення аудіо з відео та конвертації у моно
        const command = `ffmpeg -i ${videoPath} -vn -ac 1 -acodec pcm_s16le ${outputPath}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(outputPath);
        });
    });
}

// маршрут для видалення даних
app.delete('/delete', (req, res) => {
    try {
        fs.unlinkSync('output_audio.wav');
        const uploadDir = path.join(__dirname, 'upload');
        
        const files = fs.readdirSync(uploadDir);

        files.forEach(file => {
            const filePath = path.join(uploadDir, file);
            fs.unlinkSync(filePath);
            console.log('File deleted:', filePath);
        });
        console.log('Data deleted successfully');
        res.sendStatus(200);
    } catch (error) {
        console.error('Failed to delete data:', error);
        res.sendStatus(500);
    }
});

//listen on port
const port = 3000;
app.listen(port, () => console.info(`Listening on port ${port}`))

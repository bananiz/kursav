let mediaRecorder;
let audioChunks = [];

document.getElementById('startRecording').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('audio', audioBlob);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('result').textContent = data.text;
                } else {
                    document.getElementById('result').textContent = 'Ошибка при распознавании речи';
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('result').textContent = 'Ошибка при отправке аудио';
            }

            audioChunks = [];
        };

        mediaRecorder.start();
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('stopRecording').style.display = 'inline-block';
        document.getElementById('status').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при доступе к микрофону');
    }
});

document.getElementById('stopRecording').addEventListener('click', () => {
    mediaRecorder.stop();
    document.getElementById('startRecording').style.display = 'inline-block';
    document.getElementById('stopRecording').style.display = 'none';
    document.getElementById('status').style.display = 'none';
});

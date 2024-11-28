import os
from flask import render_template, request, jsonify
from app import app, db
from models import AudioRecord
import speech_recognition as sr

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = f"audio_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.wav"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    audio_file.save(filepath)

    # Распознавание речи
    recognizer = sr.Recognizer()
    with sr.AudioFile(filepath) as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data, language='ru-RU')
        except:
            text = "Не удалось распознать речь"

    # Сохранение в базу данных
    record = AudioRecord(filename=filename, text_content=text)
    db.session.add(record)
    db.session.commit()

    return jsonify({
        'success': True,
        'text': text,
        'filename': filename
    })

from flask import Flask, request, jsonify, send_from_directory
from transformers import VisionEncoderDecoderModel, VisionEncoderDecoderConfig
from transformers import AutoTokenizer, ViTImageProcessor, pipeline
import torch
from PIL import Image
import io

app = Flask(__name__, static_url_path='')

path = "checkpoint"
config = VisionEncoderDecoderConfig.from_pretrained(path)
model = VisionEncoderDecoderModel.from_pretrained(path, config=config)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

feature_extractor = ViTImageProcessor.from_pretrained(path)
tokenizer = AutoTokenizer.from_pretrained(path)

image_captioner = pipeline("image-to-text", model=model, tokenizer=tokenizer, feature_extractor=feature_extractor)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/script.js')
def serve_script():
    return send_from_directory('.', 'script.js')

@app.route('/caption', methods=['POST'])
def caption_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        file = request.files['image']
        image = Image.open(io.BytesIO(file.read())).convert('RGB')        
        captions = image_captioner(image, max_new_tokens=100)        
        caption_text = captions[0]['generated_text'] if captions else "No caption generated"        
        return jsonify({'description': caption_text}), 200
    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
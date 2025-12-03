from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import requests
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Cargar el modelo al iniciar
model = tf.keras.models.load_model('modeloCNN.h5')

# Etiquetas
labels = [
    'Anthracnose', 'Bacterial_Blight', 'Black_Spot', 'Canker', 'Curl_Virus',
    'Deficiency', 'Dry_Leaf', 'Greening', 'Healthy', 'Sooty_Mould', 'Spider_Mites'
]

# Recomendaciones de tratamiento para cada enfermedad
recommendations = {
    'Anthracnose': [
        'Aplicar fungicidas preventivos como clorotalonil o mancozeb',
        'Mejorar la circulación de aire entre las plantas',
        'Eliminar y destruir hojas infectadas',
        'Evitar riego por aspersión, usar riego por goteo',
        'Aplicar tratamientos cada 7-10 días durante la temporada húmeda'
    ],
    'Bacterial_Blight': [
        'Aplicar antibióticos bacterianos como estreptomicina',
        'Podar ramas infectadas y desinfectar herramientas',
        'Mejorar el drenaje del suelo para evitar humedad excesiva',
        'Usar variedades resistentes cuando sea posible',
        'Aplicar cobre bactericida como medida preventiva'
    ],
    'Black_Spot': [
        'Aplicar fungicidas sistémicos como tebuconazol',
        'Eliminar hojas caídas y restos vegetales',
        'Mejorar la ventilación y espaciado entre plantas',
        'Evitar humedad excesiva en el follaje',
        'Aplicar tratamientos preventivos antes de la temporada de lluvias'
    ],
    'Canker': [
        'Aplicar cobre bactericida como oxicloruro de cobre',
        'Podar áreas infectadas y desinfectar herramientas',
        'Controlar insectos vectores que transmiten la enfermedad',
        'Usar material vegetal certificado libre de enfermedades',
        'Aplicar tratamientos preventivos en épocas de crecimiento activo'
    ],
    'Curl_Virus': [
        'Eliminar plantas infectadas inmediatamente',
        'Controlar insectos vectores con insecticidas sistémicos',
        'Usar material vegetal sano y certificado',
        'Implementar barreras físicas para proteger las plantas',
        'Monitorear regularmente para detectar síntomas tempranos'
    ],
    'Deficiency': [
        'Aplicar fertilizantes balanceados según análisis de suelo',
        'Corregir pH del suelo si es necesario (6.0-7.0)',
        'Mejorar nutrición mineral con micronutrientes',
        'Realizar análisis de suelo para identificar deficiencias específicas',
        'Aplicar fertilizantes foliares para absorción rápida'
    ],
    'Dry_Leaf': [
        'Ajustar programa de riego según necesidades de la planta',
        'Mejorar drenaje del suelo para evitar encharcamiento',
        'Proteger plantas de vientos secos y fuertes',
        'Aplicar mulch orgánico para retener humedad',
        'Monitorear humedad del suelo regularmente'
    ],
    'Greening': [
        'Eliminar plantas infectadas para evitar propagación',
        'Controlar psílidos vectores con insecticidas sistémicos',
        'Usar material vegetal certificado libre de enfermedades',
        'Implementar programas de monitoreo regular',
        'Aplicar tratamientos preventivos en épocas de crecimiento'
    ],
    'Healthy': [
        'Mantener prácticas de cultivo saludables',
        'Monitorear regularmente para detectar problemas tempranos',
        'Aplicar fertilizantes balanceados según necesidades',
        'Mantener riego adecuado y drenaje apropiado',
        'Implementar manejo integrado de plagas'
    ],
    'Sooty_Mould': [
        'Controlar insectos productores de melaza (áfidos, escamas)',
        'Aplicar jabones insecticidas para eliminar insectos',
        'Mejorar la ventilación entre plantas',
        'Lavar hojas con agua jabonosa para eliminar melaza',
        'Aplicar aceites hortícolas como medida preventiva'
    ],
    'Spider_Mites': [
        'Aplicar acaricidas específicos como abamectina',
        'Mejorar la humedad ambiental para desfavorecer ácaros',
        'Usar depredadores naturales como ácaros fitoseidos',
        'Aplicar aceites hortícolas para control mecánico',
        'Monitorear regularmente para detectar infestaciones tempranas'
    ]
}

# Formatos de imagen soportados
SUPPORTED_FORMATS = ['JPEG', 'JPG', 'PNG', 'BMP', 'TIFF', 'WEBP']

def preprocess_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convertir a RGB
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        img = img.resize((224, 224))
        arr = np.array(img) / 255.0
        arr = np.expand_dims(arr, axis=0)
        return arr
    except Exception as e:
        raise ValueError(f"Error procesando imagen: {str(e)}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Verificar formato de archivo
        filename = file.filename.lower()
        if not any(filename.endswith(fmt.lower()) for fmt in SUPPORTED_FORMATS):
            return jsonify({
                'error': f'Formato no soportado. Formatos válidos: {", ".join(SUPPORTED_FORMATS)}'
            }), 400
        
        img_bytes = file.read()
        
        # Verificar que es una imagen válida
        try:
            img = Image.open(io.BytesIO(img_bytes))
            img.verify()  # Verificar que es una imagen válida
        except Exception:
            return jsonify({'error': 'Archivo no es una imagen válida'}), 400
        
        input_arr = preprocess_image(img_bytes)
        preds = model.predict(input_arr)[0]
        idx = int(np.argmax(preds))
        confidence = float(preds[idx])
        label = labels[idx]
        
        return jsonify({
            'label': label, 
            'confidence': confidence, 
            'all': preds.tolist(),
            'filename': file.filename,
            'format': img.format if hasattr(img, 'format') else 'Unknown',
            'recommendations': recommendations.get(label, [])
        })
        
    except Exception as e:
        return jsonify({'error': f'Error procesando imagen: {str(e)}'}), 500

@app.route('/predict-url', methods=['POST'])
def predict_url():
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'No URL provided'}), 400
        
        url = data['url'].strip()
        
        # Validar URL
        try:
            parsed_url = urlparse(url)
            if not parsed_url.scheme or not parsed_url.netloc:
                raise ValueError("Invalid URL format")
            
            # Verificar que sea HTTP o HTTPS
            if parsed_url.scheme not in ['http', 'https']:
                return jsonify({'error': 'Only HTTP and HTTPS URLs are supported'}), 400
                
        except Exception:
            return jsonify({'error': 'Invalid URL format'}), 400
        
        # Descargar imagen desde URL
        try:
            # Headers para simular un navegador
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, timeout=30, headers=headers, stream=True)
            response.raise_for_status()
            
            # Verificar que es una imagen
            content_type = response.headers.get('content-type', '').lower()
            if not content_type.startswith('image/'):
                # Proporcionar mensaje de error más útil
                if 'text/html' in content_type:
                    return jsonify({
                        'error': 'URL points to a webpage, not an image. Please use a direct link to an image file (ending in .jpg, .png, .jpeg, etc.)'
                    }), 400
                else:
                    return jsonify({
                        'error': f'URL does not point to an image. Content-Type: {content_type}. Please use a direct link to an image file.'
                    }), 400
            
            # Verificar tamaño antes de descargar completamente
            content_length = response.headers.get('content-length')
            if content_length and int(content_length) > 10 * 1024 * 1024:
                return jsonify({'error': 'Image too large. Maximum size: 10MB'}), 400
            
            img_bytes = response.content
            
            # Verificar tamaño final (máximo 10MB)
            if len(img_bytes) > 10 * 1024 * 1024:
                return jsonify({'error': 'Image too large. Maximum size: 10MB'}), 400
            
        except requests.exceptions.RequestException as e:
            return jsonify({'error': f'Error downloading image: {str(e)}'}), 400
        
        # Procesar imagen
        try:
            img = Image.open(io.BytesIO(img_bytes))
            img.verify()  # Verificar que es una imagen válida
        except Exception:
            return jsonify({'error': 'Invalid image format'}), 400
        
        input_arr = preprocess_image(img_bytes)
        preds = model.predict(input_arr)[0]
        idx = int(np.argmax(preds))
        confidence = float(preds[idx])
        label = labels[idx]
        
        return jsonify({
            'label': label, 
            'confidence': confidence, 
            'all': preds.tolist(),
            'url': url,
            'recommendations': recommendations.get(label, [])
        })
        
    except Exception as e:
        return jsonify({'error': f'Error processing image from URL: {str(e)}'}), 500

@app.route('/validate-url', methods=['POST'])
def validate_url():
    """Validar si una URL apunta a una imagen válida sin procesarla"""
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'No URL provided'}), 400
        
        url = data['url'].strip()
        
        # Validar URL
        try:
            parsed_url = urlparse(url)
            if not parsed_url.scheme or not parsed_url.netloc:
                raise ValueError("Invalid URL format")
            
            if parsed_url.scheme not in ['http', 'https']:
                return jsonify({'error': 'Only HTTP and HTTPS URLs are supported'}), 400
                
        except Exception:
            return jsonify({'error': 'Invalid URL format'}), 400
        
        # Verificar URL con HEAD request (más eficiente)
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.head(url, timeout=10, headers=headers)
            response.raise_for_status()
            
            content_type = response.headers.get('content-type', '').lower()
            content_length = response.headers.get('content-length')
            
            if not content_type.startswith('image/'):
                return jsonify({
                    'valid': False,
                    'error': f'URL does not point to an image. Content-Type: {content_type}'
                })
            
            if content_length and int(content_length) > 10 * 1024 * 1024:
                return jsonify({
                    'valid': False,
                    'error': 'Image too large. Maximum size: 10MB'
                })
            
            return jsonify({
                'valid': True,
                'content_type': content_type,
                'content_length': content_length,
                'url': url
            })
            
        except requests.exceptions.RequestException as e:
            return jsonify({
                'valid': False,
                'error': f'Error accessing URL: {str(e)}'
            })
            
    except Exception as e:
        return jsonify({'error': f'Error validating URL: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'model_loaded': True})

if __name__ == '__main__':
    app.run(debug=True) 
# Clasificador Multiclase de Enfermedades en la Hoja de Limón

Este proyecto es una aplicación web para la detección y clasificación de enfermedades en hojas de limón utilizando Inteligencia Artificial.

## 📋 Características

- **Clasificación de 11 Clases**: Detecta diversas condiciones como Antracnosis, Cáncer, Virus del Rizado, entre otras, además de hojas saludables.
- **Análisis de Imágenes**: Permite subir imágenes locales o proporcionar URLs de imágenes para su análisis.
- **Recomendaciones de Tratamiento**: Proporciona consejos específicos y pasos a seguir para cada enfermedad detectada.
- **API REST**: Backend construido con Flask que sirve el modelo de Deep Learning.

## 🛠️ Tecnologías

- **Backend**: Python, Flask, TensorFlow/Keras.
- **Frontend**: Next.js (Estructura de carpetas en `src/`).
- **IA**: Red Neuronal Convolucional (CNN) (`modeloCNN.h5`).

## 🚀 Instalación y Uso

### Requisitos Previos
- Python 3.11+
- Node.js (para el frontend)

### Configuración del Backend

1.  Instalar las dependencias:
    ```bash
    pip install -r requirements.txt
    ```

2.  Ejecutar el servidor Flask:
    ```bash
    python app.py
    ```
    El servidor correrá en `http://localhost:5000`.

### Notas sobre el Frontend
El código fuente del frontend se encuentra en la carpeta `src/`. Sin embargo, **falta el archivo `package.json`**, por lo que no es posible instalar las dependencias ni ejecutar el frontend directamente sin regenerar este archivo.

## 🏥 Clases Detectadas

1.  Anthracnose (Antracnosis)
2.  Bacterial Blight (Tizón Bacteriano)
3.  Black Spot (Mancha Negra)
4.  Canker (Cáncer de los Cítricos)
5.  Curl Virus (Virus del Rizado)
6.  Deficiency (Deficiencia Nutricional)
7.  Dry Leaf (Hoja Seca)
8.  Greening (Huanglongbing / Dragón Amarillo)
9.  Healthy (Saludable)
10. Sooty Mould (Fumagina)
11. Spider Mites (Ácaros)

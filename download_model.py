import os
import requests

MODEL_URL = "https://drive.google.com/uc?export=download&id=1GIIgeGYzYoNd4C0nXo7wfpDLE3-3TjfT"
MODEL_PATH = "modeloCNN.h5"

def download_model():
    if not os.path.exists(MODEL_PATH):
        print(f"Descargando modelo desde {MODEL_URL}...")
        try:
            response = requests.get(MODEL_URL, timeout=300)
            with open(MODEL_PATH, 'wb') as f:
                f.write(response.content)
            print(f"Modelo descargado exitosamente: {MODEL_PATH}")
        except Exception as e:
            print(f"Error descargando modelo: {e}")
    else:
        print(f"Modelo ya existe: {MODEL_PATH}")

if __name__ == "__main__":
    download_model()

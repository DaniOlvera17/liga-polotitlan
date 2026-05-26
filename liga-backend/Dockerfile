# Backend Flask — Liga Polotitlán
FROM python:3.11-slim

WORKDIR /app

# Copiar e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY . .

# Exponer el puerto 8000
EXPOSE 8000

# Comando para arrancar Flask
CMD ["python", "app.py"]

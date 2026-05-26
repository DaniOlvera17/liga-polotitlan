# Frontend React — Liga Polotitlán
# Etapa 1: construir el proyecto React
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código y construir
COPY . .
RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine

# Copiar build al servidor Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de Nginx para React Router (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app
RUN apk add --no-cache openssl
# Copiamos primero package.json y package-lock.json
COPY package*.json ./
# Instalamos TODAS las dependencias (incluyendo dev)
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto
EXPOSE 4000

# Ajustamos permisos para el usuario node
RUN chown -R node:node /usr/src/app

# Cambiamos a usuario no root
USER node
# Ejecutamos la app en modo desarrollo
CMD ["npm", "run", "dev"]

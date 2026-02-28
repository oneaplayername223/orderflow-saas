# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app
RUN apk add --no-cache openssl
# Copiamos primero package.json y package-lock.json
COPY package*.json ./
# variable de conexión por defecto dentro del contenedor (no para producción)
ENV DATABASE_URL='postgres://postgres:postgres@localhost:5432/billing_db'
# Instalamos TODAS las dependencias (incluyendo dev)
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de la app (se configura en la variable PORT)
EXPOSE 6002

# Ajustamos permisos para el usuario node
RUN chown -R node:node /usr/src/app

# Cambiamos a usuario no root
USER node
# Ejecutamos la app en modo desarrollo
CMD ["npm", "run", "start:dev"]

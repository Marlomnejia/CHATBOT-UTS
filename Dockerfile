# Etapa de construcción
FROM node:20 AS build

WORKDIR /app

# Copiar los archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Etapa de ejecución
FROM node:20
WORKDIR /app

# Copiar lo construido
COPY --from=build /app /app

# Exponer el puerto de la app
EXPOSE 3000

# Comando para ejecutar el servidor
CMD ["npm", "start"]

FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY server ./server

RUN npx prisma generate --schema=server/prisma/schema.prisma

EXPOSE 5000

CMD ["node", "server/server.js"]
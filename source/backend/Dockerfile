FROM node:18-bullseye-slim

WORKDIR /app

RUN npm cache clean --force
RUN npm config set registry https://registry.npmjs.org/

# OpenSSL cho Prisma
RUN apt-get update && apt-get install -y libssl1.1 && rm -rf /var/lib/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install -g nodemon

COPY . .
RUN npx prisma generate

# Fix line endings (Windows host → Linux container)
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 3000
CMD ["./entrypoint.sh"]

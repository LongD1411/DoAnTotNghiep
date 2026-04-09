FROM node:18-bullseye-slim

WORKDIR /app

# Clear npm cache and set registry
RUN npm cache clean --force
RUN npm config set registry https://registry.npmjs.org/

# Install OpenSSL 1.1 for Prisma
RUN apt-get update && apt-get install -y libssl1.1 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "start"]

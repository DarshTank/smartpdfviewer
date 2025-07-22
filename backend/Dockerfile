# Use official Node.js image
FROM node:18

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install || true

COPY . .

EXPOSE 5000

CMD ["npm", "start"] 
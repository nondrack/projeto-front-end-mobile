FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8081 19000 19001 19002

ENV HOST=0.0.0.0

CMD ["npx", "expo", "start", "--host", "lan", "--port", "8081"]

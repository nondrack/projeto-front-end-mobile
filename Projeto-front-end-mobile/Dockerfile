FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8081 19000 19001 19002

ENV HOST=localhost

CMD ["npx", "expo", "start", "--host", "localhost", "--port", "8081", "--tunnel", "--clear"]

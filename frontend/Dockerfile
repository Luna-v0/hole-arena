# Dockerfile for the frontend

FROM node:24

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev","--", "--host"]

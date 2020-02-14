FROM node:10 as build-stage

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 5000

CMD [ "node", "index.js" ]
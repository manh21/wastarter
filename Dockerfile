FROM node:14-alpine

RUN apt-get update

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./src ./src

RUN npm install

RUN npm run build

CMD ["node", "./build/src/main.js"]

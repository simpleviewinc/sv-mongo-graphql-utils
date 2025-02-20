FROM node:16.20.2

COPY package.json /app/package.json
RUN cd /app && npm install

WORKDIR /app
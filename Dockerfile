FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm build
CMD npm start

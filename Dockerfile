FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3010

EXPOSE 3010

CMD ["npm", "start"]
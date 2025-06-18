FROM node:14 AS build

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . /app/

RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy build output to Nginx html folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 and start Nginx in foreground
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
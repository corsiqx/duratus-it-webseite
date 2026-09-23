FROM node:22-alpine AS build
ARG c=production
WORKDIR /app
COPY ./duratus-it-shop-frontend/package*.json ./duratus-it-shop-frontend/
RUN cd duratus-it-shop-frontend && npm ci
COPY ./duratus-it-shop-frontend ./duratus-it-shop-frontend
RUN cd duratus-it-shop-frontend && npx ng build -c $c

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf && rm /etc/nginx/nginx.conf
COPY ./duratus-it-shop-frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./duratus-it-shop-frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/duratus-it-shop-frontend/dist/duratus-it-shop-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
 
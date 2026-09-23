FROM node:22-alpine AS build
ARG c=production
WORKDIR /app
COPY ./duratus-it-frontend/package*.json ./duratus-it-frontend/
RUN cd duratus-it-frontend && npm ci
COPY ./libs ./libs
COPY ./duratus-it-frontend ./duratus-it-frontend
RUN cd duratus-it-frontend && npx ng build -c $c

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf && rm /etc/nginx/nginx.conf
COPY ./duratus-it-frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./duratus-it-frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/duratus-it-frontend/dist/duratus-it-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
 
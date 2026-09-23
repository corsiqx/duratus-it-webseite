FROM node:22-alpine AS build
ARG c=production
WORKDIR /app
COPY ./duratus-it-kundenportal-frontend/package*.json ./duratus-it-kundenportal-frontend/
RUN cd duratus-it-kundenportal-frontend && npm ci
COPY ./duratus-it-kundenportal-frontend ./duratus-it-kundenportal-frontend
RUN cd duratus-it-kundenportal-frontend && npx ng build -c $c

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf && rm /etc/nginx/nginx.conf
COPY ./duratus-it-kundenportal-frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./duratus-it-kundenportal-frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/duratus-it-kundenportal-frontend/dist/duratus-it-kundenportal-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
 
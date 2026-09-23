FROM node:22-alpine AS build
ARG c=production
WORKDIR /app
COPY ./duratus-it-knowledgebase-frontend/package*.json ./duratus-it-knowledgebase-frontend/
RUN cd duratus-it-knowledgebase-frontend && npm ci
COPY ./duratus-it-knowledgebase-frontend ./duratus-it-knowledgebase-frontend
RUN cd duratus-it-knowledgebase-frontend && npx ng build -c $c

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf && rm /etc/nginx/nginx.conf
COPY ./duratus-it-knowledgebase-frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./duratus-it-knowledgebase-frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/duratus-it-knowledgebase-frontend/dist/duratus-it-knowledgebase-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
 
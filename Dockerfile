# Dockerfile для тестирования плагина Rocket Docker Compose
FROM nginx:alpine

LABEL maintainer="Седунов Андрей М3104"
LABEL description="Test container for Rocket Docker Compose plugin"
LABEL version="1.0"

COPY app/ /usr/share/nginx/html/

RUN echo "Build complete" > /var/log/build.log

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# To build image for this dockerfile use this command:
#   docker build -t terrabrasilis/amazon-alert-daily:v2.2-beta --build-arg INDEX_FILE=deter-amazon-daily -f environment/Dockerfile .
#
# To run without compose and without shell terminal use this command:
#   docker run -d --rm -p 80:80 --name terrabrasilis_amazon_alerts_daily terrabrasilis/amazon-alert-daily:v2.2-beta
# 
# Information from doc of help about run one container without an explicit service. Run in background
# --------------------------------------------------------------------------------
# --rm,                      Tell to docker engine to remove container after container is stopped
# --name,                    Define one name for running container
# -d, --detach=false         Run container in background and print container ID
# -t, --tty=false            Allocate a pseudo-TTY
# --no-cache                 Ignore all cached intermediary layer
# --build-arg                Build args
# --------------------------------------------------------------------------------
#
#--------- Generic stuff all our Dockerfiles should start with -----------------------------
FROM nginx:latest

LABEL "br.inpe.dpi"="INPE/DPI-TerraBrasilis"
LABEL br.inpe.dpi.terrabrasilis="microservice"
LABEL version="v2.2-beta"
LABEL author="Andre Carvalho"
LABEL author.email="andre.carvalho@inpe.br"
LABEL description="This container provides an http server including the beta version for Legal Amazon dashboards to DETER data."
#-------------Application Specific Stuff ----------------------------------------------------

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

COPY environment/config/nginx.conf /etc/nginx/nginx.conf
COPY environment/config/403.html /usr/share/nginx/html/403.html

COPY webapp/ /usr/share/nginx/html/

ARG INDEX_FILE=deter-amazon-daily
ENV INDEX_FILE_NAME=$INDEX_FILE

RUN mv /usr/share/nginx/html/$INDEX_FILE_NAME.html /usr/share/nginx/html/index.html

EXPOSE 80 443

ENTRYPOINT ["nginx"]

# Extras parameters for entrypoint
CMD ["-g", "daemon off;"]
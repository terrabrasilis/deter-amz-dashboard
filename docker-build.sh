#!/bin/bash

VERSION=$(git describe --tags --abbrev=0)
export VERSION
# Stopping all containers
#docker container stop terrabrasilis_amazon_alert_daily
#docker container stop terrabrasilis_amazon_alert_aggregated

# build all images
docker build -t terrabrasilis/amazon-alert-daily:v$VERSION --build-arg VERSION=$VERSION --build-arg INDEX_FILE=deter-amazon-daily -f environment/Dockerfile .
docker build -t terrabrasilis/amazon-alert-aggregated:v$VERSION --build-arg VERSION=$VERSION --build-arg INDEX_FILE=deter-amazon-aggregated -f environment/Dockerfile .

# send to dockerhub
## docker login
docker push terrabrasilis/amazon-alert-daily:v$VERSION
docker push terrabrasilis/amazon-alert-aggregated:v$VERSION

# If you want run containers, uncomment this lines
#docker run -d --rm -p 83:80 --name terrabrasilis_amazon_alert_daily terrabrasilis/amazon-alert-daily:v$VERSION
#docker run -d --rm -p 84:80 --name terrabrasilis_amazon_alert_aggregated terrabrasilis/amazon-alert-aggregated:v$VERSION
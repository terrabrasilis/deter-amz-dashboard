#!/bin/bash

# Stopping all containers
#docker container stop terrabrasilis_dashboard_alert_daily
#docker container stop terrabrasilis_dashboard_alert_aggregated

# build all images
docker build -t terrabrasilis/dashboard-alert-daily:beta --build-arg INDEX_FILE=deter-amz-daily -f environment/Dockerfile .
docker build -t terrabrasilis/dashboard-alert-aggregated:beta --build-arg INDEX_FILE=deter-amz-aggregated -f environment/Dockerfile .

# send to dockerhub
docker login
docker push terrabrasilis/dashboard-alert-daily:beta
docker push terrabrasilis/dashboard-alert-aggregated:beta

# If you want run containers, uncomment this lines
#docker run -d --rm -p 83:80 --name terrabrasilis_dashboard_alert_daily terrabrasilis/dashboard-alert-daily:beta
#docker run -d --rm -p 84:80 --name terrabrasilis_dashboard_alert_aggregated terrabrasilis/dashboard-alert-aggregated:beta
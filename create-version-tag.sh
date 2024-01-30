#!/bin/bash

if [ "$1" = "" ]; then
    echo "Missing version parameter. Ex: ./create-version 'v2.11.0'"
    exit
fi


VERSION=$1

echo $VERSION > VERSION
git add VERSION
git commit -m "Generating version: $VERSION"
git tag $VERSION
git push origin $VERSION
    
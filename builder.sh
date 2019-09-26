#!/bin/sh

set -e

USER=gnatty
PKG="node-chrome"

if [[ -n "$2" ]]; then
  VERSION="$2"
else
  VERSION="latest"
fi

echo "--- Builder ---"
echo "Package: $PKG"
echo "Version: $VERSION"

docker login --username $USER --password $DOCKER_PASSWORD
docker build -t $PKG .
docker tag $PKG $USER/$PKG:$VERSION
docker push $USER/$PKG:$VERSION

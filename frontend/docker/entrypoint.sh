#!/bin/sh
set -e

if [ ! -d node_modules/@angular ]; then
  npm ci
fi

exec "$@"

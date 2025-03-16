#!/bin/sh
# wait-for-redis.sh

set -e

host="$REDIS_HOST"
port="$REDIS_PORT"

until nc -z "$host" "$port"; do
  >&2 echo "Redis is unavailable - sleeping"
  sleep 1
done

>&2 echo "Redis is up - executing command"
exec "$@"
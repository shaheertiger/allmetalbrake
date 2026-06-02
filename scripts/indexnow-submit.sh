#!/usr/bin/env bash
set -euo pipefail

HOST="www.allmetalbrake.com"
KEY="189ca4591f684071860aa602c09ab321"
KEY_LOCATION="https://${HOST}/${KEY}.txt"
SITEMAP="$(dirname "$0")/sitemap.xml"
ENDPOINT="https://api.indexnow.org/IndexNow"

if [[ $# -gt 0 ]]; then
  urls=("$@")
else
  mapfile -t urls < <(grep -oE '<loc>[^<]+</loc>' "$SITEMAP" | sed -E 's#</?loc>##g')
fi

url_json=$(printf '"%s",' "${urls[@]}")
url_json="[${url_json%,}]"

payload=$(cat <<EOF
{
  "host": "${HOST}",
  "key": "${KEY}",
  "keyLocation": "${KEY_LOCATION}",
  "urlList": ${url_json}
}
EOF
)

curl -sS -w "\nHTTP %{http_code}\n" \
  -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Host: api.indexnow.org" \
  -d "${payload}"

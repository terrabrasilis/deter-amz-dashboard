#!/bin/bash
BASE_URL="http://terrabrasilis.dpi.inpe.br/geoserver/deter-amz"

# to test cloud monthly data
URL="${BASE_URL}/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=cloud_m_d&OUTPUTFORMAT=application%2Fjson"
curl "$URL" -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en,en-US;q=0.5' --compressed -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' > deter-amazon-cloud-month.json

# download daily data to work local
#URL="${BASE_URL}/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=all_daily_d&OUTPUTFORMAT=application%2Fjson"
URL="${BASE_URL}/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=all_daily_d&OUTPUTFORMAT=application%2Fjson&CQL_FILTER=g%3E%272024-01-01Z%27"
curl "$URL" -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en,en-US;q=0.5' --compressed -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' > deter-amazon-daily.json

# download month aggregated data to work local
URL="${BASE_URL}/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=month_d&OUTPUTFORMAT=application%2Fjson"
curl "$URL" -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en,en-US;q=0.5' --compressed -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' > deter-amazon-month.json

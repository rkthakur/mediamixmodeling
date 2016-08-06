#!/bin/bash

echo "Please enter your ADM Client ID and Client Secret"
read CLIENTID CLIENTSECRET

curl -X POST --Header "content-type: application/x-www-form-urlencoded" -d "grant_type=client_credentials&client_id=$CLIENTID&client_secret=$CLIENTSECRET&scope=http://api.microsofttranslator.com" https://datamarket.accesscontrol.windows.net/v2/OAuth2-13 | grep -Po '"access_token":.*?[^\\]",' | cut -d '"' -f4


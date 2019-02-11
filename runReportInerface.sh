#!/bin/sh
kill -9 `/usr/sbin/pidof node`
cd reportInterface/mmmdash/
npm install
export NODE_ENV='PRODUCTION'
npm start

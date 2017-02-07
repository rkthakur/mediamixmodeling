#!/bin/sh
start1=1
while [ $start1 -lt 80744 ]
do
  echo "Start $start1"
  cmd="https://www.googleapis.com/analytics/v3/data/ga?ids=ga%3A86833475&start-date=2016-04-01&end-date=yesterday&metrics=ga%3AproductDetailViews&dimensions=ga%3AproductSku%2Cga%3Adate&sort=-ga%3AproductDetailViews&start-index=$start1&max-results=10000&access_token=ya29.CjVHAzM90KVCWp4JXcQQYaYWbsD6O61Mx5CWzGaUDIgRZ0PArSEVU0h3Hy6MR8zBVFtmceUeCw"
  curl "$cmd" >PV$start1.json
  start1=`expr $start1 + 10000`
done

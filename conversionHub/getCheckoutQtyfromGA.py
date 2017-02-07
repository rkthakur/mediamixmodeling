import logging
import pymongo
from pymongo import MongoClient
import pandas as pd
import json
import time
from datetime import datetime
import urllib3
urllib3.disable_warnings()
from urllib.parse import urlencode
from pprint import pprint
ACCESS_TOKEN = 'ya29.CjVLA9bn-kmFXTPlQJV6UA1CjUlL32lSj7BXqXtfRzP_m4_Xcx1P-E60nLtSJzdkiBEoa_RpfQ'
client = MongoClient()
client = MongoClient("mongodb://localhost:27017/")
PAGEVIEWSAMPLEDATA='./mmmdash/data/GA/PV1.json'
PAGEVIEW='pageView'
ONLINE='online'
TV='tv'
SAMPLE='SAMPLE'
GA="GA"
MEDIA="media"
SALESVOLUME='salesVolume'
RUNMODE=SAMPLE


LOG_FILENAME = './logs/GoogleAnalytcisData.log'
#FORMAT = '%(asctime)-15s %(clientip)s %(user)-8s %(message)s'
logging.basicConfig(filename=LOG_FILENAME,level=logging.DEBUG)
logging.info('Initialization done...')


def getGAData(metrics,SKU):
    gaURL=""
    if metrics == MEDIA:
        gaURL="https://www.googleapis.com/analytics/v3/data/ga?ids=ga%3A86833475&start-date=2016-04-01&end-date=yesterday&metrics=ga%3AproductDetailViews&dimensions=ga%3AproductSku%2Cga%3Adate&sort=-ga%3Adate&filters=ga%3AproductSku%3D%3D"+SKU+"&start-index=1&max-results=10000&access_token="+ACCESS_TOKEN
    if metrics == SALESVOLUME:
        gaURL="https://www.googleapis.com/analytics/v3/data/ga?ids=ga%3A86833475&start-date=2016-04-01&end-date=yesterday&metrics=ga%3AquantityCheckedOut&dimensions=ga%3AproductSku%2Cga%3Adate&sort=-ga%3Adate&filters=ga%3AproductSku%3D%3D"+SKU+"&start-index=1&max-results=10000&access_token="+ACCESS_TOKEN
    logging.info(gaURL)
    http = urllib3.PoolManager()
    r = http.request('GET', gaURL)
    gadata=json.loads(r.data.decode('utf-8'))
    return gadata

def loadSampleData(metrics,SKU):
    samplefile=""
    if metrics == MEDIA:
        samplefile = './mmmdash/data/GA/PV1.json'
    if metrics == SALESVOLUME:
        samplefile = './mmmdash/data/GA/1.json'
    with open(samplefile) as data_file:
        data = json.load(data_file)
    #print(data)
    return data

def updateGoogleAnalytcisData(datatype,attribute):
    db = client.mediamixmodeling
    collection = db.products
    for product in collection.find({}):
        #print(product[datatype])
        product[datatype]=setAttributeData(datatype,product[datatype],product['_id'],attribute)
        #print(product)
        result = collection.update({'_id': product['_id']},{"$set" : product})
    return result

def setAttributeData(datatype,data,SKU,attribute):
    #print(datatype+str(SKU)+attribute)
    #print(data)
    if attribute in data:
            data[attribute] = getAttributeData(datatype,data[attribute],SKU)
    return data

def getAttributeData(datatype,attribute,SKU):
    data=gaDataHandler(datatype,SKU,RUNMODE,attribute)
    #attribute['volume']=[] #Referesh all data
    #print(data)
    values = set()
    for item in attribute['volume']:
        values.add(item['dateTime'])

    for rec in data:
        date=datetime.strptime(str(rec['Date']), "%Y%m%d")
        date=date.strftime("%Y-%m-%d")
        if str(date) in values:
            logging.info(str(date)+" Data for "+SKU+" allready Captured in Database!")
            #print(str(date)+" Data for "+SKU+" allready Captured in Database!")
        else:
            print(SKU+" dateTime"+str(date)+"impression"+rec['count'])
            attribute['volume'].append({"dateTime": str(date),"impression": rec['count']})
    return attribute

def mainTemp():
    while(1):
        gadata = loadSampleData(nextLink)
        if 'nextLink' not in gadata:
            print("Next Link Does not Exists")
            break
        else:
            print("Next Link Exists")
            nextLink=gadata['nextLink']

def gaDataHandler(datatype,SKU,source,attribute):
        if source == SAMPLE:
            gadata = loadSampleData(datatype,SKU) #loadSampleData(nextLink)
        if source == GA:
            gadata = getGAData(datatype,SKU)
        df = pd.DataFrame(gadata['rows'], columns=list(['SKU','Date','count']))
        #print(df)
        skuData = df[df['SKU'] == SKU]
        #print(skuData)
        jdata = json.loads(skuData.T.to_json()).values()

        return jdata;

def main():
    #RUNMODE=GA
    updateGoogleAnalytcisData(MEDIA,PAGEVIEW)
    updateGoogleAnalytcisData(SALESVOLUME,ONLINE)

if __name__ == '__main__':
    main()

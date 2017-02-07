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
client = MongoClient("mongodb://localhost:27017/")
MEDIA="media"
RNR="ratingsAndReviews"
SAMPLE='SAMPLE'
LIVE='LIVE'
RUNMODE=LIVE


LOG_FILENAME = './logs/GoogleAnalytcisData.log'
#FORMAT = '%(asctime)-15s %(clientip)s %(user)-8s %(message)s'
logging.basicConfig(filename=LOG_FILENAME,level=logging.DEBUG)
logging.info('Initialization done...')

def getGAData(SKU):
    gaURL="https://www.nivea.de/shop/getratingreviewserviceresponse?service=getreviews&StreamID="+str(SKU)
    logging.info(gaURL)
    http = urllib3.PoolManager()
    r = http.request('GET', gaURL)
    data=json.loads(r.data.decode('utf-8').replace("$","")) #replace $ from the response string
    data=data['Data']
    data=data['Reviews']
    return data

def loadSampleData(SKU):
    samplefile="./mmmdash/data/RnR/RnRSample.json"
    with open(samplefile) as data_file:
        data = json.load(samplefile)
    return data

def updateReviewData(datatype,attribute):
    db = client.mediamixmodeling
    collection = db.products
    for product in collection.find({}):
        print("Update invoked for "+product['_id'])
        product[datatype]=setAttributeData(datatype,product[datatype],product['productCode'],attribute)
        result =collection.update({'_id': product['_id']},{"$set" : product})
        print("Update completed for "+product['_id'])
    return result

def setAttributeData(datatype,data,SKU,attribute):
    if attribute in data:
            data[attribute] = getAttributeData(datatype,data[attribute],SKU)
    return data

def getAttributeData(datatype,attribute,SKU):
    reviews=gaDataHandler(SKU)
    attribute['Reviews']=reviews #Referesh all data
    return attribute

def gaDataHandler(SKU):
        data=""
        print(RUNMODE)
        if RUNMODE == SAMPLE:
            data = loadSampleData(SKU)
        if RUNMODE == LIVE:
            data = getGAData(SKU)
        return data;

def main():
    dbresult=updateReviewData(MEDIA,RNR)
    print(dbresult)

if __name__ == '__main__':
    main()

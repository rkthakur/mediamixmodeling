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

def getGAData(SKU):
    gaURL="https://www.nivea.de/shop/getratingreviewserviceresponse?service=getreviews&StreamID="+str(SKU)
    logging.info(gaURL)
    http = urllib3.PoolManager()
    r = http.request('GET', gaURL)
    gadata=json.loads(r.data.decode('utf-8'))
    Data=gadata['Data']
    gadata=Data['Reviews']
    print(gadata)

def loadSampleData():
    samplefile="./mmmdash/data/RnR/RnRSample.json"
    with open(samplefile) as data_file:
        data1 = json.load(samplefile.data.decode('utf-8'))
    print(data1)

getGAData(83922)
#loadSampleData()

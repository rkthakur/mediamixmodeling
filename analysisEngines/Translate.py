import logging
import pymongo
from pymongo import MongoClient
import json
import time
from datetime import datetime
import urllib3
urllib3.disable_warnings()
from urllib.parse import urlencode

client = MongoClient("mongodb://localhost:27017/")
MEDIA="media"
RNR="ratingsAndReviews"

from microsofttranslator import Translator
CLIENTID="rakeshthakurcmtoumtpmmm"
CLIENTSECRETKEY="YbssQ38GPYmB+cHTSjvIIBfsnWsqbWR66ehyqzfaors="

#CLIENTID="rinkyrakeshmmm"
#CLIENTSECRETKEY="jVKqkdvFBh/l4VqODl9t+GF1LPCh+e0ZNfc4J2QlKik="

translator = Translator(CLIENTID, CLIENTSECRETKEY)

LOG_FILENAME = './logs/RnRSentimentAnalysis.log'
#FORMAT = '%(asctime)-15s %(clientip)s %(user)-8s %(message)s'
logging.basicConfig(filename=LOG_FILENAME,level=logging.DEBUG)
logging.info('Initialization done...')

def arrayDump(arr,filename):
    jarr=[]
    for rec in arr:
        jarr.append({"text" : rec})
    print(jarr)
    with open(filename, 'w') as f:
        json.dumps(jarr, f)

def getTranslation(text,lang):
    transArr = []
    print("Total number of docuemnts requested for Translation : "+str(len(text)))
    reqArr=[]
    for idx, rec in enumerate(text):
        reqArr.append(rec)
        if len(reqArr) > 25 or (idx + 1) == len(text):
            print(idx)
            newtext=translator.translate_array(reqArr,lang)
            for ntext in newtext:
                transArr.append(ntext['TranslatedText'].encode('utf-8'))
            reqArr=[]
            time.sleep( 100 )
    print("Total number of docuemnts Translated : "+str(len(transArr)))

    #with open('./Temp/'+productID+'.json', 'w') as f:
        #json.dumps(transArr.decode('utf-8'), f)

    return transArr

def updateProductData(datatype,attribute):
    db = client.mediamixmodeling
    collection = db.products
    result = ""
    for product in collection.find({'_id' : '40059002555320001'}): #'_id' : '40059001073050001'
        print("Processing Product ID :"+product['_id'])
        product[datatype]=setAttributeData(datatype,product[datatype],attribute)
        result = collection.update({'_id': product['_id']},{"$set" : product})
        print(product['_id'],result)
    return result

def setAttributeData(datatype,data,attribute):
    if attribute in data:
            data[attribute] = getAttributeData(datatype,data[attribute],attribute)
    return data

def getAttributeData(datatype,data,attribute):
    udata=[]
    arData=[]
    cyt=0
    for idx, rec in enumerate(data['Reviews']):
        arData.append(rec['Text'])
    arrayDump(arData,"./logs/1.json")
    #newData=getTranslation(arData,'en')
    #sentimentData=setSentimentDataFormat(newData)
    #for idx, rec in enumerate(data['Reviews']):
        #rec['sentimentofText'] = sentimentData[idx]
        #udata.append(rec)
    #data['Reviews']=udata
    return data

def setSentimentDataFormat(messageArr):
        responseArr=[]
        #print("Total number of docuemnts requested for Sentiment Analysis : "+str(len(messageArr)))
        for msg in messageArr:
            responseArr.append({"text" : msg.decode('utf-8'), "polarity" : "9"})
        #print("Total number of docuemnts recieved after Sentiment Analysis : "+str(len(responseArr)))
        return  responseArr

def main():
    result=updateProductData(MEDIA,RNR)
    print(result)

if __name__ == '__main__':
    main()

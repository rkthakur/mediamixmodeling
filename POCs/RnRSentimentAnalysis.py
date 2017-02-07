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
productID="999"

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
            time.sleep( 60 )
    print("Total number of docuemnts Translated : "+str(len(transArr)))

    #with open('./Temp/'+productID+'.json', 'w') as f:
        #json.dumps(transArr.decode('utf-8'), f)

    return transArr
    #except Exception as inst:
        #print(inst)


def getSentiment140Bulk(messageArr,lang):
        #print(message)
        print("Total number of docuemnts requested for Sentiment Analysis : "+str(len(messageArr)))
        requestArr=[]
        responseArr=[]
        reqArr=[]
        http = urllib3.PoolManager()
        for idx, msg in enumerate(messageArr):
            reqArr.append({"text" : msg})
            if len(reqArr) > 25 or (idx + 1) == len(messageArr):
                data = '{"language": "'+lang+'","data" :'+str(reqArr)+'}' # 2 short text that we want to do sentiment analysis
                response = http.request('POST', 'http://www.sentiment140.com/api/bulkClassifyJson?appid=rthakur@sapient.com',body=data)
                print(idx)
                body = json.loads(response.data.decode('utf-8'))
                for msg in body['data']:
                    responseArr.append({"text" : msg['text'], "polarity" : msg['polarity']})
                reqArr=[]
        print("Total number of docuemnts recieved after Sentiment Analysis : "+str(len(responseArr)))
        return  responseArr
        #for rec in data:
            #print(rec) # print the result
def getSentiment140(message,lang):
        data = '{"language": "'+lang+'","data" : [{"text" : "'+message+'"}]}' # 2 short text that we want to do sentiment analysis
        http = urllib3.PoolManager()
        response = http.request('POST', 'http://www.sentiment140.com/api/bulkClassifyJson?appid=rthakur@sapient.com',body=data)
        print(response.data, data)
        body = json.loads(response.data.decode('utf-8'))
        return (data['data'][0]['polarity'])


def updateGoogleAnalytcisData(datatype,attribute):
    db = client.mediamixmodeling
    result = ""
    collection = db.products
    for product in collection.find({}): #'_id' : '40059000518060001'
        print("Processing Product ID :"+product['_id'])
        productID=product['_id']
        product[datatype]=setAttributeData(datatype,product[datatype],attribute)
        #print(product['media'])
        result = collection.update({'_id': product['_id']},{"$set" : product})
        print(product['_id'],result)
    return result

def setAttributeData(datatype,data,attribute):
    if attribute in data:
            data[attribute] = getAttributeData(datatype,data[attribute],attribute)
            #print(data[attribute])
    return data

def getAttributeData(datatype,data,attribute):
    udata=[]
    arData=[]
    cyt=0
    for idx, rec in enumerate(data['Reviews']):
        arData.append(rec['Text'])
    newData=getTranslation(arData,'en')
    sentimentData=getSentimentData(newData) #getSentiment140Bulk(newData,'en')
    for idx, rec in enumerate(data['Reviews']):
        rec['sentimentofText'] = sentimentData[idx]
        #rec['sentimentofText'] = json.loads({"text" : newData[idx]['text'], "polarity" : 9 })
        udata.append(rec)
    data['Reviews']=udata
    return data

def getSentimentData(messageArr):
        #print(message)
        responseArr=[]
        print("Total number of docuemnts requested for Sentiment Analysis : "+str(len(messageArr)))
        for msg in messageArr:
            responseArr.append({"text" : msg.decode('utf-8'), "polarity" : "9"})
        print("Total number of docuemnts recieved after Sentiment Analysis : "+str(len(responseArr)))
        return  responseArr


def testgetSentiment140():
    text="Finally times a deodorant that complies with the promise of advertising. My daughter wears only black clothes and has no Deospuren or in the clothes. In addition, be not so intrusive fragrance and skin care to our standards of quality."
    textArr = []
    textArr.append(text)
    lang="en"
    #sentiment=getSentiment140(text,lang)
    sentiment=getSentiment140Bulk(textArr,lang)
    print(sentiment)

def main():
    result=updateGoogleAnalytcisData(MEDIA,RNR)
    print(result)
    #testgetSentiment140()


if __name__ == '__main__':
    main()

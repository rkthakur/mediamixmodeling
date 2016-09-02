import logging
import pymongo
from pymongo import MongoClient
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

LOG_FILENAME = './logs/RnRSentimentAnalysis.log'
#FORMAT = '%(asctime)-15s %(clientip)s %(user)-8s %(message)s'
logging.basicConfig(filename=LOG_FILENAME,level=logging.DEBUG)
logging.info('Initialization done...')

def getSentiment140Bulk(messageArr,lang):
        print("Total number of docuemnts requested for Sentiment Analysis : "+str(len(messageArr)))
        sentiment140URL='http://www.sentiment140.com/api/bulkClassifyJson?appid=rthakur@sapient.com'
        requestArr=[]
        responseArr=[]
        http = urllib3.PoolManager()
        for idx, msg in enumerate(messageArr):
            requestArr.append({"text" : msg})
            if len(requestArr) > 24 or (idx + 1) == len(messageArr):
                data = '{"language": "'+lang+'","data" :'+str(requestArr)+'}' # 2 short text that we want to do sentiment analysis
                response = http.request('POST',sentiment140URL,body=data)
                print(idx)
                body = json.loads(response.data.decode('utf-8','ignore'))
                for msg in body['data']:
                    responseArr.append({"text" : msg['text'], "polarity" : msg['polarity']})
                requestArr=[]
        print("Total number of docuemnts recieved after Sentiment Analysis : "+str(len(responseArr)))
        return  responseArr

def getSentiment140(message,lang):
        data = '{"language": "'+lang+'","data" : [{"text" : "'+message+'"}]}' # 2 short text that we want to do sentiment analysis
        http = urllib3.PoolManager()
        response = http.request('POST', 'http://www.sentiment140.com/api/bulkClassifyJson?appid=rthakur@sapient.com',body=data.encode('utf-8'))
        print(response.data, data)
        body = json.loads(response.data.decode('utf-8'))
        return (data['data'][0]['polarity'])

def dumpdata(transArr):
    with open('./logs/dump.json', 'w') as f:
        json.dump(transArr, f)

def updateProductData(datatype,attribute):
    db = client.mediamixmodeling
    result = ""
    collection = db.products
    for product in collection.find({'_id' : '40059001073050001'}): #'_id' : '40059000518060001'
        print("Processing Product ID :"+product['_id'])
        productID=product['_id']
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
        if 'sentimentofText' in rec:
            sentimentofText=rec['sentimentofText']
            arData.append((sentimentofText['text']).replace("ū","u"))

    dumpdata(arData)
    sentimentData=getSentiment140Bulk(arData,'en')
    for idx, rec in enumerate(data['Reviews']):
        rec['sentimentofText'] = sentimentData[idx]
        udata.append(rec)
    data['Reviews']=udata
    return data

def testgetSentiment140():
    text="Finally times a deodorant that complies with the promise of advertising. My daughter wears only black clothes and has no Deospuren or in the clothes. In addition, be not so intrusive fragrance and skin care to our standards of quality."
    with open('./logs/dump.json') as data_file:
        data = json.load(data_file)

    textArr = []
    textArr.append(text)
    lang="en"
    #sentiment=getSentiment140(text,lang)
    sentiment=getSentiment140Bulk(data,lang)
    print(sentiment)

def main():
    result=updateProductData(MEDIA,RNR)
    print(result)
    #testgetSentiment140()

if __name__ == '__main__':
    main()

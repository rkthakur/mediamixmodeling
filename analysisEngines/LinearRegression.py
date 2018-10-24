############ To Do #################
# 1. Exception Handling
#
#
###################################
import logging
import pymongo
from pymongo import MongoClient
import json
import time
from datetime import datetime
# imports
import pandas as pd
#import matplotlib.pyplot as plt

# this allows plots to appear directly in the notebook
#import matplotlib.pyplot as plt
import statsmodels.formula.api as smf
dependentVariable ="Sales"
features = "TV + Radio + Newspaper"
# Connect mongodb
client = MongoClient()
config = json.loads(open('./config.json').read())
#client = MongoClient("mongodb://localhost:27017/mediamixmodeling")
client = MongoClient(config['dburl'])
db = client.mediamixmodeling
#uid = datetime.now().strftime("%Y%m%d%H%M%S%Z")

LOG_FILENAME = './logs/LinearRegression.log'
#FORMAT = '%(asctime)-15s %(clientip)s %(user)-8s %(message)s'
logging.basicConfig(filename=LOG_FILENAME,level=logging.DEBUG)
logging.info('Initialization done...')
uid="10207169892833614"
SampaleData=uid+"_Data"

#load Sample date for media mix modeling
def getDataForModeling(uid):
    SampleData=uid+"_Data"
    data1 = pd.DataFrame(list(db[SampleData].find({},{'_id':0,'TDate':0})))
    # This is a temporary solution to avoid 'ValueError: shapes (366,181) and (366,181) not aligned: 181 (dim 1) != 366 (dim 0)' #
    # Looks like statsmodels 0.9.0 version has an issue in handling dataframe originated from a List while summarizing the regression model #
    # Therefore data fetched from MongoDB is getting sevaed in a temporary CSV file #
    data1.to_csv('./mongodata.csv')
    data = pd.read_csv('./mongodata.csv')
    #data.to_csv('/Users/rakthaku/CodeRepos/mediamixmodeling/SampleDataSet/filedata.csv')
    return data

def runModel(data):
    # read data into a DataFrame
    # create a fitted model with all three features - Ordinary Least Squares
    lm1 = smf.ols(formula=dependentVariable+" ~ "+features, data=data)
    lm = lm1.fit()
    # Summarize the model
    lm.summary()
    return lm

# Transform Model to json
def modelToJson(lm,data):
    # Calcualte Vertical Sum of DataFrame
    dSum = data.sum(axis=0)
    dSum = json.loads(dSum.to_json())
    curr_datetime = datetime.today()
    params = json.loads(lm.params.to_json())
    bse = json.loads(lm.bse.to_json())
    pvalues = json.loads(lm.pvalues.to_json())
    conf_int = json.loads(lm.conf_int().to_json())
    diagn = lm.diagn

    # Prepare testModel data
    testModelData = "["
    featuresShare = 0
    for key, value in params.items():
        if value > 0: # Ignore negative coef
            if key != "Intercept": # Ignore Intercept feature
                featuresShare=featuresShare+value
                rec = '{"media":"'+key+'", "share" :'+str(dSum.get(dependentVariable)*value)+"},"
                testModelData = testModelData+rec
                #testModelData = testModelData+'"'+key+'" :'+str(dSum.get(dependentVariable)*value)+","
    baseSales = (dSum.get(dependentVariable) * (1 - featuresShare))
    rec = '{"media":"Base Sales", "share" :'+str(baseSales)+"}]"
    testModelData = testModelData+rec #'"Base Sales":'+str(baseSales)+"}"
    testModelData = json.loads(testModelData)
    uid = datetime.now().strftime("%Y%m%d%H%M%S%Z")
    # Prepare model JSON
    model = {"_id" : uid,
    "summary" : {
        "head": {
        "cov_type": "nonrobust",
        "method": "Least Squares",
        "aic": lm.aic,
        "datetime": curr_datetime,
        "bic": lm.bic,
        "f_statistic": lm.f_pvalue,
        "df_model": lm.df_model,
        "dep_var": dependentVariable,
        "features": features,
        "no_of_observations": data.shape[0] - 1,
        "rsquared": lm.rsquared,
        "log_likelihood": lm.llf,
        "model": "OLS",
        "rsquared_adj": lm.rsquared_adj,
        "df_resid": lm.df_resid,
        "fvalue": lm.fvalue
        },
        "values": {
            "params": params,
            "conf_int": conf_int,
            "bse": bse,
            "pvalues": pvalues
            },
            "diagn": diagn
            },
            "modelResult" : testModelData
            }
    return model

#Store Model in Database
def storeModel(model, uid):
    col_mixModel=uid+"_MixModel"
    result = db[col_mixModel].insert_one(model)
    result = db[col_mixModel].update_many({},{"$set" : {"isActive": "NO"}})
    result = db[col_mixModel].update_many({"_id": model['_id']},{"$set" : {"isActive": "YES"}})
    result = db[col_mixModel].delete_many({"isActive": "NO"})
    #db.getCollection('mixModels').find({}).sort({_id:-1}).limit(1)
    return model

def runLinearRegression(uid):
    #Get Data from DB and transform into Pandas=>DataFrame
    data=getDataForModeling(uid)
    #Run Linear Regression on Data
    lm=runModel(data)
    #Transform Leaner model into JSON
    jmodel=modelToJson(lm,data)
    #Store model
    model=storeModel(jmodel,uid)
    return model

def main():
    runLinearRegression('10207169892833614')

if __name__ == '__main__':
    main()

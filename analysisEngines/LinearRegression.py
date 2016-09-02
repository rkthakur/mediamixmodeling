import pymongo
from pymongo import MongoClient
import json
import time
from datetime import datetime
# imports
import pandas as pd
import matplotlib.pyplot as plt

# this allows plots to appear directly in the notebook
import matplotlib.pyplot as plt
import statsmodels.formula.api as smf
# Connect mongodb
client = MongoClient()
client = MongoClient("mongodb://localhost:27017/")

#load Sample date for media mix modeling
db = client.mediamixmodeling
collection = db.SampleData
data = pd.DataFrame(list(collection.find()))
# read data into a DataFrame
dependentVariable ="Sales"
features = "TV + Radio + Newspaper"
# create a fitted model with all three features
lm = smf.ols(formula=dependentVariable+" ~ "+features, data=data).fit()
# Summarize the model
lm.summary()
# Calcualte Vertical Sum of DataFrame
dSum = data.sum(axis=0)
dSum = json.loads(dSum.to_json())

curr_datetime = datetime.today()
params = json.loads(lm.params.to_json())
bse = json.loads(lm.bse.to_json())
pvalues = json.loads(lm.pvalues.to_json())
conf_int = json.loads(lm.conf_int().to_json())
diagn = lm.diagn
uid = datetime.now().strftime("%Y%m%d%H%M%S%Z")

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

# Prepare model JSON
model = {"_id" : uid,
"summary" : {
    "head": {
      "cov_type": "nonrobust",
      "method": "Least Squares",
      "aic": lm.aic,
      "datetime": curr_datetime,
      "bic": lm.bic,
      "f_statistic": "lm.F-statistic",
      "df_model": lm.df_model,
      "dep_var": dependentVariable,
      "features": features,
      "no_of_observations": data.shape[0] - 1,
      "rsquared": lm.rsquared,
      "llf": lm.llf,
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
result = db.mixModels.insert_one(model)
result = db.mixModels.update_many({},{"$set" : {"isActive": "NO"}})
result = db.mixModels.update_many({"_id": uid},{"$set" : {"isActive": "YES"}})
#db.getCollection('mixModels').find({}).sort({_id:-1}).limit(1)
print(result)

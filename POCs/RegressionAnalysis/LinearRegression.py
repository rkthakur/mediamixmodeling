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
client = MongoClient("mongodb://localhost:27017/mediamixmodeling")

#load Sample date for media mix modeling
db = client.mediamixmodeling
collection = db.mixModel
data = pd.DataFrame(list(collection.find()))
# read data into a DataFrame

# create a fitted model with all three features
lm = smf.ols(formula='Sales ~ TV + Radio + Newspaper', data=data).fit()
# Summarize the model
lm.summary()

curr_datetime = datetime.today()
params = json.loads(lm.params.to_json())
bse = json.loads(lm.bse.to_json())
pvalues = json.loads(lm.pvalues.to_json())
conf_int = json.loads(lm.conf_int().to_json())
diagn = lm.diagn
model = {"_id" : "MODEL",
"model" : [{
    "summary": {
      "cov_type": "nonrobust",
      "method": "Least Squares",
      "aic": lm.aic,
      "datetime": curr_datetime,
      "bic": lm.bic,
      "f_statistic": "lm.F-statistic",
      "df_model": lm.df_model,
      "dep_var": "",
      "no_of_observations": data.shape[0] - 1,
      "rsquared": lm.rsquared,
      "llf": lm.llf,
      "model": "OLS",
      "rsquared_adj": lm.rsquared_adj,
      "df_resid": lm.df_resid,
      "fvalue": lm.fvalue
    }
  },
  {
    "values": {
      "params": params,
      "conf_int": conf_int,
      "bse": bse,
      "pvalues": pvalues
    }
  },
  {
    "diagn": diagn
  }]}
#result = db.mixModel.update_one({"_id": "MODEL"},{ "$set" : model})
result = db.mixModel.delete_one({"_id" : "MODEL"})
result = db.mixModel.insert_one(model)
print(result)

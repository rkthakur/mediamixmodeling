var request = require('request');

request.post({
  url : 'http://www.sentiment140.com/api/bulkClassifyJson?appid=rthakur@sapient.com',
  method: 'POST',
  json : {
    'data' : [{'text': 'I hate this product'},

  ]
  }
}
, function(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body);
});

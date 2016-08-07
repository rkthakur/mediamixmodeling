var request = require('request');

request.post({
  url : 'http://www.sentiment140.com/api/bulkClassifyJson?appid=rthakur@sapient.com',
  method: 'POST',
  json : {
    'data' : [{'text': 'I am completely thrilled customer review gift Brian from the photo box'}]
  }
}
, function(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body);
});

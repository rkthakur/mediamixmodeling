var request = require('request');
request('https://www.nivea.de/shop/getratingreviewserviceresponse?service=getreviews&StreamID=897080002000', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    //console.log(body) // Show the HTML for the Google homepage.
    var body = JSON.parse(body);
    var jsonContent = body.Data.Reviews;
    for(var i = 0; i < jsonContent.length; i++) {
    	console.log(JSON.stringify(jsonContent[i].Title+" "+jsonContent[i].Text));
    }
    console.log(jsonContent.length);
  }
})
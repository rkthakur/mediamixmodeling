var request = require('request');
var fs = require('fs');

var azureDataMarketClientId = 'rakeshthakurcmtoumtpmmm';
var azureDataMarketClientSecret = 'YbssQ38GPYmB+cHTSjvIIBfsnWsqbWR66ehyqzfaors=';

var text = "Use pixels to express measurements for padding and margins";
var from = "en";
var to = "de";

var uri = "http://api.microsofttranslator.com/v2/Http.svc/Translate?text=" + text + "&from=" + from + "&to=" + to;


// get Azure Data Market Access Token
request.post(
	'https://datamarket.accesscontrol.windows.net/v2/OAuth2-13',
	{
		form : {
			grant_type : 'client_credentials',
			client_id : azureDataMarketClientId,
			client_secret : azureDataMarketClientSecret,
			scope : 'http://api.microsofttranslator.com'
		}
	},
// once we get the access token, we hook up the necessary websocket events for sending audio and processing the response
	console.log("Conneted")
);
request(uri, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    //console.log(body) // Show the HTML for the Google homepage.
    console.log(body);
  }
	console.log(response.statusCode);
});

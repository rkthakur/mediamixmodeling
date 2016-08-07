var MsTranslator = require('mstranslator');
var client = new MsTranslator({
  client_id: "rakeshthakurcmtoumtpmmm"
  , client_secret: "YbssQ38GPYmB+cHTSjvIIBfsnWsqbWR66ehyqzfaors="
});

var params = {
  text: 'Kundenbewertung Ich bin vollkommen begeistert von der Fotodose olles Geschenk'
  , from: 'de'
  , to: 'en'
};

// Using initialize_token manually.
client.initialize_token(function(keys){
  console.log(keys.access_token);
  client.translate(params, function(err, data) {
    console.log(data);
  });
});

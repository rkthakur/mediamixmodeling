var MsTranslator = require('mstranslator');
// Second parameter to constructor (true) indicates that
// the token should be auto-generated.
var client = new MsTranslator({
  client_id: "rakeshthakurcmtoumtpmmm"
  , client_secret: "YbssQ38GPYmB+cHTSjvIIBfsnWsqbWR66ehyqzfaors="
}, true);

var params = {
  text: 'Kundenbewertung Ich bin vollkommen begeistert von der Fotodose olles Geschenk'
  , from: 'de'
  , to: 'en'
};

// Don't worry about access token, it will be auto-generated if needed.
client.translate(params, function(err, data) {
  console.log(data);
});

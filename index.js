/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '3a8d17239bfa424eb70ca1ca1d2f2527'; // Your client id
var client_secret = 'a07e6e022405453fa928482d9cb6aa94'; // Your secret
var redirect_uri = 'https://nd-event-finder.herokuapp.com/callback'; // Your redirect uri

const PORT = process.env.PORT || 5000;


// const API_URL = "https://accounts.spotify.com/api/token";
// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;
// const CLIENT_CALLBACK_URL = process.env.CLIENT_CALLBACK_URL;
// const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
//


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login/:isMobile', function(req, res) {

  var isMobile = req.params.isMobile;
  console.log(isMobile);
  ru = `${redirect_uri}/${isMobile}`;
  console.log(ru);

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: ru,
      state: state
    }));
});

app.get('/callback/:isMobile', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter


  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  var isMobile = (req.params.isMobile === 'true');

  let redir = isMobile ? 'nd-event-finder://callback#' : 'http://localhost:8100/tabs/tab1#';
  console.log('isMobile',isMobile);
  console.log('redir', redir);

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there

        res.redirect(isMobile +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect(redir +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/favicon.ico', function(req, res) {
  res.send({})
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


// var
//   cors = require('cors'),
//   http = require('http'),
//   express = require('express'),
//   dotenv = require('dotenv'),
//   bodyParser = require('body-parser'),
//   request = require('request'),
//   CryptoJS = require('crypto-js');
//
// var app = express();
// dotenv.load();
//

// app.use(bodyParser.urlencoded({
//   extended: true
// }));
// app.use(bodyParser.json());
// app.use(cors({
//   origin: true,
//   credentials: true
// }));
//
//
//
// const spotifyRequest = params => {
//   return new Promise((resolve, reject) => {
//       request.post(API_URL, {
//         form: params,
//         headers: {
//           "Authorization": "Basic " + new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString('base64')
//         },
//         json: true
//       }, (err, resp) => err ? reject(err) : resolve(resp));
//     })
//     .then(resp => {
//       if (resp.statusCode != 200) {
//         return Promise.reject({
//           statusCode: resp.statusCode,
//           body: resp.body
//         });
//       }
//       return Promise.resolve(resp.body);
//     })
//     .catch(err => {
//       return Promise.reject({
//         statusCode: 500,
//         body: JSON.stringify({})
//       });
//     });
// };
//
//
//
// // Route to obtain a new Token
// app.post('/exchange', (req, res) => {
//
//   const params = req.body;
//   if (!params.code) {
//     return res.json({
//       "error": "Parameter missing"
//     });
//   }
//
//   spotifyRequest({
//       grant_type: "authorization_code",
//       redirect_uri: CLIENT_CALLBACK_URL,
//       code: params.code
//     })
//     .then(session => {
//       let result = {
//         "access_token": session.access_token,
//         "expires_in": session.expires_in,
//         "refresh_token": encrypt(session.refresh_token)
//       };
//       return res.send(result);
//     })
//     .catch(response => {
//       return res.json(response);
//     });
// });
//
// // Get a new access token from a refresh token
// app.post('/refresh', (req, res) => {
//   const params = req.body;
//   if (!params.refresh_token) {
//     return res.json({
//       "error": "Parameter missing"
//     });
//   }
//
//   spotifyRequest({
//       grant_type: "refresh_token",
//       refresh_token: decrypt(params.refresh_token)
//     })
//     .then(session => {
//       return res.send({
//           "access_token": session.access_token,
//           "expires_in": session.expires_in
//       });
//     })
//     .catch(response => {
//       return res.json(response);
//     });
// });
//
//
//
// // Helper functions
// function encrypt(text) {
//   return CryptoJS.AES.encrypt(text, ENCRYPTION_SECRET).toString();
// };
//
// function decrypt(text) {
//   var bytes = CryptoJS.AES.decrypt(text, ENCRYPTION_SECRET);
//   return bytes.toString(CryptoJS.enc.Utf8);
// };
//
// // Start the server
// var server = http.createServer(app);
//
// server.listen(process.env.PORT || 5000, function (err) {
//   console.info('listening in http://localhost:8080');
// });
//
//



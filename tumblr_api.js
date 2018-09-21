var request = require('request')
// Authenticate via OAuth
var tumblr = require('tumblr.js');

var client = tumblr.createClient({
   consumer_key: 'jiyWmclYzX2TPh4sPT8pfa14b0sNovIZMSeqkJr0ESoneM47Og',
   consumer_secret: 'cs0WsSQa1YU4sBuPCNi9JJpM9Jc5Y2GqS7g2qxvYa27Kfengm2',
   token: 'KaSzntbJk1TwJOKBrr9ciRuuB3JczDrUwVEl4IH1g3gWTW4nE1',
   token_secret: 'ZF8Z4JeQrWX5rhF1fbhD1o9lHwf01VBEWTWLg6ToD9JLeLvwQc'
});
client.requestOptions.proxy = 'http://localhost:1080';

// client.userInfo(function (err, data) {
//    data.user.blogs.forEach(function (blog) {
//       console.log(blog.name);
//    });
// });
// // Make the request
client.userDashboard({ type: 'video' }, function (err, data) {
   console.log(data);
});

// var Agent = require('socks5-https-client/lib/Agent');
// request({
//    url: 'https://www.tumblr.com/login',
//    agentClass: Agent,
//    agentOptions: {
//       socksHost: 'localhost', // Defaults to 'localhost'.
//       socksPort: 1080 // Defaults to 1080.
//    }
// }, function (err, res) {
//    console.log(err || res.body);
// });

// var Socks5ClientHttpsAgent = require('socks5-https-client/lib/Agent');

// var agent = new Socks5ClientHttpsAgent({
//    socksHost: 'localhost',
//    socksPort: 1080
// })

// request({
//    url: 'https://twitter.com',
//    agent: agent
// }, (err, res, body) => {
//    console.log(err, res, body);
// });

// var request = require('superagent');
// // extend with Request#proxy()
// require('superagent-proxy')(request);

// // HTTP, HTTPS, or SOCKS proxy to use
// var proxy = 'http://localhost:1080';

// request
//    .get('https://www.tumblr.com/login')
//    .proxy(proxy)
//    .end(onresponse);

// function onresponse(err, res) {
//    if (err) {
//       console.log(err);
//    } else {
//       console.log(res.status, res.headers);
//       console.log(res.body);
//    }
// }
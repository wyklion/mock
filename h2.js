const http2 = require('http2');

const clientSession = http2.connect(`https://www.tumblr.com`);
clientSession.on('error', (err) => console.error(err));
clientSession.setTimeout(10000);
clientSession.on('timeout', () => {
   console.log('timeout...')
});
const req = clientSession.request({
   ':path': '/login',
   ':authority': 'www.tumblr.com',
   ':method': 'GET',
   ':path': '/login',
   ':scheme': 'https'
});
req.on('response', (headers, flags) => {
   // may check and play with the http/2 response headers, and flags
   let data = '';
   req.on('data', chunk => { data += chunk; })
      .on('end', async () => {
         const res = JSON.parse(data);
         console.log(res);
         clientSession.destroy(); // try remove this line see what changed?
      })
});
req.on('error', (err) => {
   console.log(err);
})
req.end();

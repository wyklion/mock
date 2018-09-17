var fs = require('fs');
var request = require('superagent');
require('superagent-proxy')(request);
var proxy = 'http://localhost:1080';

var getStreamText = (uri, callback) => {
   var fname = './_tmp.text';
   if (fs.existsSync(fname)) {
      fs.unlinkSync(fname);
   }
   var stream = fs.createWriteStream(fname);
   request.get(uri)
      .proxy(proxy)
      .pipe(stream)
   stream.on('finish', function () {
      callback(1);
   });

   var responseData = [];//存储文件流
   stream.on('data', function (chunk) {
      responseData.push(chunk);
   });
   stream.on('end', function () {
      var finalData = Buffer.concat(responseData);
      var text = finalData.toString();
      callback(text);
   });
}

var getVideoInfo = (url, callback) => {
   request.get(url)
      .proxy(proxy)
      .end(function (err, res) {
         if (!err) {
            var text = res.text;
            var reg = /&url_encoded_fmt_stream_map=(.+?)&/
            var r = text.match(reg);
            var hdUrl = decodeURIComponent(decodeURIComponent(r[0].split('=')[1]).match(/url=(.*)&quality=hd720/)[1])
            callback(null, hdUrl);
         } else {
            callback(err);
         }
      });
}

var getUrl = async (videoId, callback) => {
   return new Promise((resolve, reject) => {
      // console.log(videoId);
      var url = 'http://www.youtube.com/get_video_info?video_id=' + videoId;
      getVideoInfo(url, (err, res) => {
         // callback(err, res);
         if (!err) {
            resolve(res);
         } else {
            reject(err);
         }
      });
   })
}

module.exports = {
   getUrl: getUrl
}
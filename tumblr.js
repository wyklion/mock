var fs = require('fs');
var cheerio = require("cheerio");
var request = require('superagent');
var youtube = require('./youtube');

require('superagent-proxy')(request);
// HTTP, HTTPS, or SOCKS proxy to use
var proxy = 'http://localhost:1080';

var args = {
   download: {
      img: false,
      video: true,
   }
}

var config = {
   login_url: "https://www.tumblr.com/login",
   dash_url: "https://www.tumblr.com/dashboard",
   loginCookie: '',
}

var loginData = {
   determine_email: 'wyk_2000@sina.com',
   'user[email]': 'wyk_2000@sina.com',
   'user[password]': 'wyk87520',
   context: 'no_referer',
   version: 'STANDARD',
   form_key: '!1231536570514|h1QGfRrDzytNjHQtGC4lDLgrNkw',
   seen_suggestion: 0,
   used_suggestion: 0,
   used_auto_suggestion: 0,
   action: 'signup_determine'
}

var headInfo = {
   'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
   'accept-encoding': 'gzip, deflate, br',
   'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
   'cache-control': 'max-age=0',
   // origin: https://www.tumblr.com
   // referer: https://www.tumblr.com/login
   'upgrade-insecure-requests': 1,
   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
}

var getCookie = (cookies, name) => {
   for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i];
      var subs = c.split(';');
      for (var j = 0; j < subs.length; j++) {
         var subs2 = subs[j].split('=');
         if (subs2.length === 2 && subs2[0] === name) {
            return subs2[1];
         }
      }
   }
   return null;
}

var getPFL = async () => {
   return new Promise((resolve, reject) => {
      request
         .get(config.login_url)
         .proxy(proxy)
         .end((err, res) => {
            if (err) {
               reject(err);
            } else {
               var cookies = res.headers['set-cookie'];
               var pfl = getCookie(cookies, 'pfl');
               resolve(cookies);
            }
         })
   });
}

var login = async () => {
   var url = config.login_url;
   return new Promise((resolve, reject) => {
      var len = JSON.stringify(loginData).length;
      request.post(url)
         .proxy(proxy)
         // .set(headInfo)
         .set({
            "cookie": config.loginCookie,
            'content-type': 'application/x-www-form-urlencoded',
            // 'content-type': 'text/html;charset=utf-8',
         })
         // .type('form')
         .send(loginData)
         // .redirects(1)
         .end(function (err, res) {
            console.log(res)
            if (!err) {
               loginCookie = res.headers["set-cookie"];
               resolve(loginCookie);
            } else
               reject(err);
         });
   })

}

var dashboard = async () => {
   var url = config.dash_url;
   return new Promise((resolve, reject) => {
      request.get(url)
         .proxy(proxy)
         // .set(headInfo)
         .set({
            "cookie": config.loginCookie,
            // 'content-type': 'text/html;charset=utf-8',
         })
         // .type('form')
         // .send(data)
         // .redirects(1)
         .end(function (err, res) {
            if (!err) {
               var result = dealWithContent(res);
               resolve(result);
            } else
               reject(err);
         });
   })
}

var dashboardNextPage = async (options) => {
   var url = 'https://www.tumblr.com/svc' + options.nextPage;
   var data = options.data;
   return new Promise((resolve, reject) => {
      request.get(url)
         .proxy(proxy)
         // .set(headInfo)
         .set({
            "cookie": config.loginCookie,
            // 'content-type': 'text/html;charset=utf-8',
         })
         .send(data)
         .end(function (err, res) {
            if (!err) {
               var result = dealWithNextPage(res);
               resolve(result);
            } else
               reject(err);
         });
   })
}

var context = {
   nextPage: '',
   streamCursor: '',
   preCount: 0,
}

var readContent = (page, result) => {
   var $ = page;
   var li = $("#posts li:not(:empty)");//.not("#new_post_buttons, :not([class])").length
   li = li.filter('[class],:not(#new_post_buttons)');
   context.preCount += li.length;
   console.log(context.nextPage, context.streamCursor, context.preCount);
   // var posts = $('#posts');
   var medias = $('#posts .post_media');
   console.log('medias count:', medias.length);
   var imgs = $('#posts .post_media img');
   for (var i = 0; i < imgs.length; i++) {
      result.imgs.push({ name: imgs[i].attribs['data-pin-description'], src: imgs[i].attribs.src });
   }
   var ytbVideos = result.ytbVideos = [];
   var ytbs = $('.post_media [data-embed-service=youtube] iframe');
   for (var i = 0; i < ytbs.length; i++) {
      ytbVideos.push({
         src: ytbs[i].attribs.src
      })
   }
}

var dealWithContent = (res) => {
   // fs.writeFileSync('./dashboard.txt', res.text);
   var $ = cheerio.load(res.text);
   var result = {
      imgs: [],
      videos: [],
   };
   var nextPage = $('#next_page_link')[0];
   context.nextPage = nextPage.attribs['href'];
   context.streamCursor = nextPage.attribs['data-stream-cursor'];

   readContent($, result);
   return result;
}

var readNextContent = (page, result) => {
   var $ = page;
   var li = $("li:not(:empty)");//.not("#new_post_buttons, :not([class])").length
   li = li.filter('[class],:not(#new_post_buttons)');
   context.preCount += li.length;
   console.log(context.nextPage, context.streamCursor, context.preCount);
   // var posts = $('#posts');
   var medias = $('.post_media');
   console.log('medias count:', medias.length);
   var imgs = $('.post_media img');
   for (var i = 0; i < imgs.length; i++) {
      result.imgs.push({ name: imgs[i].attribs['data-pin-description'], src: imgs[i].attribs.src });
   }
}

var dealWithNextPage = (res) => {
   var result = {
      imgs: [],
      videos: [],
   };
   var obj = JSON.parse(res.text);
   var dashPosts = obj.response.DashboardPosts;
   context.nextPage = obj.meta.tumblr_old_next_page;
   context.streamCursor = dashPosts.nextCursor;

   fs.writeFileSync('./dashboard.txt', dashPosts.body);
   var $ = cheerio.load(dashPosts.body);
   readNextContent($, result);
}

var downloadFile = (uri, filename, callback) => {
   if (fs.existsSync(filename)) {
      // fs.unlinkSync(filename);
      callback(2);
      return;
   }
   var stream = fs.createWriteStream(filename);
   request.get(uri)
      .proxy(proxy)
      // .set(headInfo)
      .pipe(stream)
   stream.on('finish', function () {
      callback(1);
   });
}

var downloadImgs = (imgs, callback) => {
   var count = imgs.length;
   console.log("start download img, count:", count);
   for (var i = 0; i < imgs.length; i++) {
      var value = imgs[i];
      var name = value.name;
      var src = value.src;
      var subs = value.src.split('/');
      var fname = './download/' + subs[subs.length - 1];
      // var fname = './download/' + name;
      (function (name, src) {
         downloadFile(src, fname, (r) => {
            var idxStr = `(${imgs.length - count + 1}/${imgs.length})`;
            if (r === 1) {
               console.log(`downloaded${idxStr}:`, name, src);
            } else if (r === 2) {
               console.log(`already exists${idxStr}:`, name, src);
            }
            count--;
            if (count === 0) {
               console.log('download img finish...');
               callback();
            }
         });
      })(name, src);
   }
}

var getUrlText = (url, callback) => {
   request.get(url)
      .proxy(proxy)
      // .set(headInfo)
      .set({
         "cookie": config.loginCookie,
         // 'content-type': 'application/x-www-form-urlencoded',
         // 'content-type': 'text/html;charset=utf-8',
      })
      .end(function (err, res) {
         if (!err) {
            callback(null, res.text);
         } else {
            callback(err);
         }
      });
}

var downloadYoutubeVideos = async (videos, callback) => {
   var count = videos.length;
   console.log("start download videos, count:", count);
   var checkCount = () => {
      count--;
      if (count === 0) {
         console.log('download video finish...');
         callback();
      }
   }
   for (var i = 0; i < videos.length; i++) {
      var src = videos[i].src;
      // console.log(src);
      getUrlText(src, (err, text) => {
         if (!err) {
            var $ = cheerio.load(text);
            var ytbiframe = $('#youtube_iframe');
            var ytbSrc = ytbiframe[0].attribs.src;
            var s1 = ytbSrc.split('?');
            var left = s1[0];
            var videoId = left.substr(left.lastIndexOf('/') + 1);
            // console.log(ytbSrc, videoId);
            var res = await youtube.getUrl(videoId);
            checkCount();
            // (function () {
            //    youtube.getUrl(videoId, (err, res) => {
            //       if (!err) {
            //          var url = res;
            //          console.log("get video info:", videoId);
            //          // console.log(url);
            //          var name = videoId;
            //          var fname = './download/video/' + name;
            //          checkCount();
            //          // downloadFile(url, fname, (r) => {
            //          //    var idxStr = `(${videos.length - count + 1}/${videos.length})`;
            //          //    if (r === 1) {
            //          //       console.log(`downloaded${idxStr}:`, name, url);
            //          //    } else if (r === 2) {
            //          //       console.log(`already exists${idxStr}:`, name, url);
            //          //    }
            //          //    checkCount();
            //          // });
            //       } else {
            //          console.log(err);
            //          checkCount();
            //       }
            //    })
            // })(videoId)
         } else {
            console.log(err);
            checkCount();
         }
      })
   }
}

var download = async (result) => {
   return new Promise((resolve, reject) => {
      if (!fs.existsSync('./download')) {
         fs.mkdirSync('./download');
      }
      if (!fs.existsSync('./download/video')) {
         fs.mkdirSync('./download/video');
      }
      var groupCount = 0;
      if (args.download.img) groupCount++;
      if (args.download.video) groupCount++;
      if (groupCount === 0) {
         resolve();
         return;
      }
      if (args.download.img) {
         var imgs = result.imgs;
         downloadImgs(imgs, () => {
            groupCount--;
            if (groupCount === 0)
               resolve();
         })
      }
      if (args.download.video) {
         var videos = result.ytbVideos;
         await downloadYoutubeVideos(videos, () => {
            groupCount--;
            if (groupCount === 0)
               resolve();
         })
      }
   });
}

var sleep = async (time) => {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         resolve();
      }, time * 1000);
   })
}

var exec = async function () {
   // var loginCookie = config.loginCookie = await getPFL();
   // console.log("loginCookie:", loginCookie);
   // var cookie = await login();
   // console.log("cookie:", cookie);

   config.loginCookie = "pfl=YzdlNWJiZGI2OTA5MTEyY2Y3ZDI1MTBkNzRlNGJiMGEzMmMwYWI0MmJlYWI0NjQ5MzQzMGE3ZThjZWI3YjdkZCx2YzJudW1lZmhlaHR0NnU3YzMzcjk1N3oyaHVuYnczaywxNTM2NzE4NTE5; __utma=189990958.2021843838.1536718518.1536718518.1536718518.1; __utmb=189990958.0.10.1536718518; __utmc=189990958; __utmz=189990958.1536718474.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); tmgioct=5b9876c7cbed170347134810; pfp=NJPpPdlmd4LqtAJsVoYilyssnZImJ2Gwh7xVN0LL; pfs=zQHzwkagVYQX4jXhQLsroe0op1Q; pfe=1544494536; pfu=340864816; pfx=51c87639396b6d78dfaebd7941eb48c04f9f3b24a751c4d5b626f6f80327de38%231%236726602310; language=%2Cen_US; logged_in=1";
   var dashResult = await dashboard();
   await download(dashResult);
   for (var i = 0; i < 0; i++) {
      var pageResult = await dashboardNextPage({
         nextPage: context.nextPage,
         data: {
            nextAdPos: 100,
            stream_cursor: context.streamCursor,
            previousElementsCount: context.preCount
         }
      })
      await download(pageResult);
   }
}


var test = () => {
   youtube.getUrl('URoAnyXqB9g', (err, res) => {
      console.log(err, res);
   })
   youtube.getUrl('URoAnyXqB9g', (err, res) => {
      console.log(err, res);
   })
}


exec();
// test();
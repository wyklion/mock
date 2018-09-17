// 引入 superagent、cheerio
var superagent = require("superagent");
require('superagent-retry')(superagent);
var cheerio = require("cheerio");
var process = require('child_process');

var getPFL = function () {
   console.log('executing phantomjs...')
   var t1 = new Date().getTime();
   result = process.execSync('phantomjs.exe tumblr.js', {
      cwd: './phantom',
      encoding: 'utf8'
   });
   console.log('finish phantomjs...' + (new Date().getTime() - t1));
   return result;
}

var config = {
   login_url: "https://www.tumblr.com/login",
   pfl: '',
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

// 浏览器请求报文头部部分信息
var headInfo2 = {
   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
   // 'accept': text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
   // accept-encoding: gzip, deflate, br
   // accept-language: zh-CN,zh;q=0.9,en;q=0.8
   // cache-control: no-cache
   // cookie: tmgioct=5b924833011c660893331690; rxx=1ranqhdyqw8.18ziq8tf&v=1; __utma=189990958.486298525.1536313397.1536313397.1536313397.1; __utmc=189990958; __utmz=189990958.1536313397.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _ga=GA1.2.486298525.1536313397; yx=SnxreGungfAbgNErnyOPBBXVR
   'pragma': 'no-cache',
   'upgrade-insecure-requests': 1

};
var headInfo = {
   // ':authority': 'www.tumblr.com',
   // ':method': 'GET',
   // ':path': '/login',
   // ':scheme': 'https',
   // 'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
   // 'accept-encoding': 'gzip, deflate, br',
   // 'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
   // 'cache-control': 'no-cache',
   // 'pragma': 'no-cache',
   // 'upgrade-insecure-requests': 1,
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

var login = async () => {
   var url = config.login_url;
   return new Promise((resolve, reject) => {
      superagent.post(url)
         .set(headInfo)
         .set({ "Cookie": "pfl=" + config.pfl })
         .type('form')
         .send(loginData)
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

var exec = async function () {
   // var pfl = config.pfl = await getPFL();
   var pfl = config.pfl = 'ZWJlZmE3M2FhN2E5OTkzM2U1MzRjOTU3YTUyNTMyYWIwNmE2MWE1MzllY2U1Mjk1NWNiMzdkNGE0MzkwZTUyMixlZDl6NWU4ZWRzM2N4djJrY2N1eGVhOGV2enRtZGU4diwxNTM2NTcxNzMx';
   console.log("pfl:", pfl);
   login();
   // console.log(cookie);
}

exec();


// 根据 cookie ，获取 target 页面关注信息
// 通过分析可知，仅取出 z_c0 的 cookie 即可，而 getLoginCookie 方法返回为一个 cookie 数组，稍做处理即可
async function getFollower() {
   return new Promise((resolve, reject) => {
      superagent.get(url.target_url).set("Cookie", cookie).set(browserMsg).end(function (err, response) {
         if (err) {
            reject(err);
         } else {
            var $ = cheerio.load(response.text);
            // 此处，同样利用 F12 开发者工具，分析页面 Dom 结构，利用 cheerio 模块匹配元素
            var array = $('#zh-favlist-following-wrap .zm-item');
            console.log(" 收藏夹标题 " + " " + " 收藏人数");
            if (array && array.length > 0) {
               array.each(function () {
                  console.log($(this).find('.zm-item-title>a').text() + " " + ($(this).find('.zg-num').text() ? $(this).find('.zg-num').text() : "0"));
                  //$(this).find('.zm-item-title>a').text();
                  //$(this).find('.zg-num').text();

               });
            }
            resolve(array);
         }
      });
   })
}
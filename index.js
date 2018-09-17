// 引入 superagent、cheerio
var superagent = require("superagent");
var cheerio = require("cheerio");

var config = {
   url: "https://www.adidas.com.cn/",
   ping_url: "https://www.adidas.com.cn/ping",
   login_url: "https://www.adidas.com.cn/member/login.json",
   xsrf: "",
}

var loginData = {
   loginName: "wyklion@qq.com",
   password: "wyk87520",
   isRemberMeLoginName: false
   // NECaptchaValidate:
}

// 浏览器请求报文头部部分信息
var headInfo = {
   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
};


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

var getXSRF = async () => {
   var url = config.ping_url + '?' + new Date().getTime();
   return new Promise((resolve, reject) => {
      superagent.post(url).end(function (err, res) {
         if (!err) {
            // 整个cookie存下
            cookie = res.headers["set-cookie"];
            resolve(cookie)
         } else
            reject(err);
      });
   })
}

var login = async () => {
   var url = config.login_url;
   return new Promise((resolve, reject) => {
      superagent.post(url)
         .set(headInfo)
         .set({ "Cookie": "XSRF-TOKEN=" + config.xsrf })
         .set({ "X-CSRF-TOKEN": config.xsrf })
         .type('form')
         .send(loginData)
         .end(function (err, res) {
            if (!err) {
               loginCookie = res.headers["set-cookie"];
               resolve(loginCookie);
            } else
               reject(err);
         });
   })

}

var exec = async function () {
   var cookie = await getXSRF();
   config.xsrf = getCookie(cookie, 'XSRF-TOKEN');
   console.log(cookie, config.xsrf);
   var loginCookie = await login();
   console.log(loginCookie);
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
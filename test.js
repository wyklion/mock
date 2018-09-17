
var sleep = function (time) {
   return new Promise(function (resolve, reject) {
      setTimeout(function () {
         // 返回 ‘ok’
         resolve('ok');
      }, time);
   })
};

var start = async function () {
   let result = await sleep(3000);
   console.log(result); // 收到 ‘ok’
};

await start();
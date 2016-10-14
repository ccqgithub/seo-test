var request = require('request');
var colors = require('colors');
var program = require('commander');
var util = require('util');
var path = require('path');
var co = require('co');
var fs = require('fs');
var hashSum = require('hash-sum');
var urlUtil = require('url');

var projectPath = path.join(__dirname, './');
var outputPath = path.join(projectPath, './output');
var records = [];

// 创建目录
function mkdirsSync(dirname, mode) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname), mode)) {
      fs.mkdirSync(dirname, mode);
      return true;
    }
  }
}

// 参数
program
  .option('--config-file', 'config file, default: main')
  .parse(process.argv);

var configFile = program.configFile || 'main.js';
var configs = require(path.join(projectPath, './config', configFile));

var getOneUrl = co.wrap(function * (userAgent, url, ext) {
  var outputFile = path.join(outputPath, hashSum(url + userAgent) + ext);
  var headers = configs.headers || {};
  var requestObj, result;

  headers['User-Agent'] = userAgent;

  console.log('[===开始请求===>>'.green);
  console.log('url: ' + url.gray);
  console.log('userAgent: ' + userAgent.gray);
  console.log('..........'.green);

  requestObj = yield new Promise(function(resolve, reject) {
    request({
      method: 'GET',
      url: url,
      headers: headers,
      gzip: true,
      followRedirect: false
    }, function(error, response, result) {
      var statusCode = response ? response.statusCode : null;
      var responseHeaders = response ? response.headers : null;
      var responseBody = response ? response.body : null;

      if (error) {
        console.log((error + '').red);
      } else if (!response) {
        error = 'no response';
        console.log('no response'.red);
      }

      mkdirsSync(path.dirname(outputFile));
      fs.writeFileSync(outputFile, responseBody, 'utf8');

      console.log('response statusCode:');
      console.log(statusCode);
      console.log('..........'.green);
      console.log('response headers:');
      console.log(JSON.stringify(responseHeaders, null, 2));
      console.log('..........'.green);
      console.log('response content file:');
      console.log(outputFile);
      console.log('..........'.green);
      // console.log('body:');
      // console.log(result);

      records.push({
        url: url,
        userAgent: userAgent,
        responseStatusCode: statusCode,
        responseHeader: responseHeaders,
        responseContentFile: outputFile,
        responseError: error,
      });

      console.log('<<===请求结束===]'.green);

      resolve({error: error, response: response, result: result});
    });
  });

  if (configs.redirectStatusCodes.indexOf(requestObj.response.statusCode) != -1 && requestObj.response.headers.location) {
    result = getOneUrl(userAgent, urlUtil.resolve(url, requestObj.response.headers.location), ext);
    yield result;
  }
});

co(function * () {
  var result, arr, url, ext, userAgent;
  var recordsFile = path.join(outputPath, '__records.json');

  records = [];
  for (arr of configs.urls) {
    arr = Array.isArray(arr) ? arr : [arr];
    url = arr[0];
    ext = arr.length > 1 ? arr[1] : '.html';
    for (var userAgent of configs.userAgents) {
      result = getOneUrl(userAgent, url, ext);
      yield result;
    }
  }

  mkdirsSync(path.dirname(recordsFile));
  fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2), 'utf8');
}).catch(function(e) {
  console.log(e)
});

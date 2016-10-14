# seo-test

> 测试seo脚本

安装

```
npm install seo-test
```

配置：配置文件放在`config`目录下

```
module.exports = {
  // 测试的url列表
  urls: [
    ['http://www.nakedhub.cn/', '.html']
  ],

  // 模拟爬虫的userAgent
  userAgents: [
    'firefox',
    'baiduspider',
    // 'facebookexternalhit',
    // 'twitterbot',
    // 'rogerbot',
    // 'linkedinbot',
    // 'embedly',
    // 'quora link preview',
    // 'showyoubot',
    // 'outbrain',
    // 'pinterest',
    // 'developers.google.com/+/web/snippet'
  ],

  // 做重定向时的statusCode
  redirectStatusCodes: [302,301],

  // 自定义header
  headers: {}
}

```

执行测试

```
// config-file: 指定配置文件，相对于config目录
node test.js --config-file=main.js
```

测试结果： 测试结果放在`output`目录下

```
// __records.json
[
    {
        "url": "http://www.nakedhub.cn/",
        "userAgent": "firefox",
        "responseStatusCode": 302,
        "responseHeader": {
            "server": "nginx",
            "date": "Fri, 14 Oct 2016 16:40:40 GMT",
            "content-type": "text/html; charset=utf-8",
            "connection": "close",
            "vary": "Accept-Encoding",
            "location": "/zh-cn/",
            "content-length": "45",
            "x-prerender": "false"
        },
        "responseContentFile": "/Users/season/Documents/pwork/seo-test/output/b78740dc.html",
        "responseError": null
    },
]
```

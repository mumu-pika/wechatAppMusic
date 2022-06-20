const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const request = require('./util/request')
const packageJSON = require('./package.json')
const exec = require('child_process').exec
const cache = require('apicache').middleware

// 引入Fly.js这个http请求库
const Fly = require('flyio/src/node');
const jwt = require('jsonwebtoken');
const fly = new Fly;


const app = express()

// CORS & Preflight request
app.use((req, res, next) => {
  if(req.path !== '/' && !req.path.includes('.')){
    res.set({
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
      'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8'
    })
  }
  req.method === 'OPTIONS' ? res.status(204).end() : next()
})

// cookie parser
app.use((req, res, next) => {
  req.cookies = {}, (req.headers.cookie || '').split(/\s*;\s*/).forEach(pair => {
    let crack = pair.indexOf('=')
    if(crack < 1 || crack == pair.length - 1) return
    req.cookies[decodeURIComponent(pair.slice(0, crack)).trim()] = decodeURIComponent(pair.slice(crack + 1)).trim()
  })
  next()
})

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// cache
app.use(cache('2 minutes', ((req, res) => res.statusCode === 200)))

// static
app.use(express.static(path.join(__dirname, 'public')))

// 小程序可以通过微信官方提供的登录能力方便地获取微信提供的用户身份标识，快速建立小程序内的用户体系。
// 开发者服务器获取用户唯一标识的接口
// 发送数据:(登录凭证校验接口) appid + appsecret + code
// 返回数据: session_key + openid等
app.use('/getOpenId', async (req, res, next) => {
  let code = req.query.code; //获取用户的登录凭证code
  let appId = 'wxc18ae250deec9be9'; //AppID(小程序ID)
  let appSecret = '394494f10db9a0b37105888fe7bceb46'; //AppSecret(小程序密钥)
  let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
  // 发请求给微信服务器获取openId
  let result = await fly.get(url);
  console.log("微信服务器返回数据啦：", result)
  let openId = JSON.parse(result.data).openid;
  console.log('openId', openId);
  // 自定义登录态
  let person = {
    username: 'pika',
    age: 22,
    openId
  }
  // 对用户的数据进行加密，生成token返回给客户端
  let token = jwt.sign(person, 'superpika'); //
  console.log(token);
  // 验证身份，反编译token
  let trueToken = jwt.verify(token, 'superpika');
  console.log(trueToken);
  res.send(token);
})


/* 
  小程序文档截取
  说明：
  1、调用 wx.login() 获取 临时登录凭证code ，并回传到开发者服务器。
  2、调用 auth.code2Session 接口，换取 用户唯一标识 OpenID 、 用户在微信开放平台帐号下的唯一标识UnionID（若当前小程序已绑定到微信开放平台帐号） 和 会话密钥 session_key。
  之后开发者服务器可以根据用户标识来生成自定义登录态，用于后续业务逻辑中前后端交互时识别用户身份。

  注意事项：
  1、会话密钥 session_key 是对用户数据进行 加密签名 的密钥。为了应用自身的数据安全，开发者服务器不应该把会话密钥下发到小程序，也不应该对外提供这个密钥。
  2、临时登录凭证 code 只能使用一次
*/


// router
const special = {
  'daily_signin.js': '/daily_signin',
  'fm_trash.js': '/fm_trash',
  'personal_fm.js': '/personal_fm'
}

fs.readdirSync(path.join(__dirname, 'module')).reverse().forEach(file => {
  // console.log(file);
  if(!file.endsWith('.js')) return
  // album_newest.js  ---> /album_newest.js ---> /album_newest ---> /album/newest
  let route = (file in special) ? special[file] : '/' + file.replace(/\.js$/i, '').replace(/_/g, '/')
  let question = require(path.join(__dirname, 'module', file))

  app.use(route, (req, res) => {
    console.log(route);
    console.log(req)
    console.log('------');
    console.log(req.cookies)
    let query = Object.assign({}, req.query, req.body, {cookie: req.cookies})
    question(query, request)
      .then(answer => {
        console.log('[OK]', decodeURIComponent(req.originalUrl))
        res.append('Set-Cookie', answer.cookie)
        res.status(answer.status).send(answer.body)
      })
      .catch(answer => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl))
        if(answer.body.code == '301') answer.body.msg = '需要登录'
        res.append('Set-Cookie', answer.cookie)
        res.status(answer.status).send(answer.body)
      })
  })
})

const port = process.env.PORT || 3000
const host = process.env.HOST || ''

app.server = app.listen(port, host, () => {
  console.log('欢迎使用音乐花园云服务器API接口');
  console.log('服务器地址： http://localhost:3000')
})

module.exports = app

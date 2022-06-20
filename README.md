# 🎵wechatAppMusic🎉
基于网易云接口做的微信音乐小程序

## 准备工作：

### 1、微信开发者工具
>开发微信小程序，推荐使用官方的微信开发者工具，对于调试的基础库可以更好的把握。

微信小程序： https://mp.weixin.qq.com/cgi-bin/wx?token=&lang=zh_CN

>在开发微信小程序之前，需要开发者已注册并拥有自己的账号

微信公众平台： https://mp.weixin.qq.com/

### 2、后台是网易云的真实API (可以在vscode中打开)
>使用真实的网易云API接口

网易云接口开源项目地址： https://github.com/mumu-pika/NeteaseCloudMusicApi.git

>这边我预留了一份在这个项目的仓库中，见CloudMusicApi.(因为请求地址或者是请求格式可能会有变化)

>启动server
``` shell
npm start
//进入API的目录下，并运行启动，默认会开启localhost：3000这个端口，成功开启会做提示
```

### 3、 钉钉开发平台内网穿透 (在前面第2步，服务器已经开启之后)
>考虑到项目后台不能只在本地内网跑，如果需要服务器在公网上能被访问到，需要借助于内网穿透技术。

钉钉开发平台官方文档：https://open.dingtalk.com/document/resourcedownload/http-intranet-penetration

### 使用DingTalk Design CLI启动内网穿透

1. 执行以下命令，下载DingTalk Design CLI工具。

```shell
npm install dingtalk-design-cli@latest -g
```

​	2、执行以下命令，检测是否成功安装。

```shell
ding -v
```

​	3、执行以下命令，启动钉钉内网穿透。 (注：这里pika是我自定义的一个域名，可以做相应修改，对应的project中utils/config.js中的mobileHost也要做相应修改，项目由于前面服务器在3000端口开放，故这里写3000)

```shell
ding ngrok --subdomain pika --port 3000
```

执行完该命令后，你访问 http://pika.vaiwan.cn/xxxxx 都会映射到`http://127.0.0.1:3000/xxxxx`。

### 4、在微信开发者工具中启动项目
>在微信开发者工具中启动项目，如果进入了登录页，且控制台console没有报错，就成功啦！

报错基本都是网络问题，内网穿透重启试试。或是开发者工具中的调试基础库不合适，我这边用的是  2.14.1。 需要勾选上将js编译为ES5


## 项目截图：

### 1、项目在微信开发者小程序中打开
![音乐小程序截图1](https://s2.loli.net/2022/06/20/PJRonkvM48NOpU9.png)


### 2、 登录页面 login页
>登录界面，可以通过输入在网易云注册的手机号和密码，登录自己的网易云账号。由于使用了网易云真实的后台API接口获取数据，故只要输入的信息正确无误，是可以登录的。

![音乐小程序截图2](https://s2.loli.net/2022/06/20/kUyp6dLewr27h41.png)

>为了有预览效果，我这里还加上了游客登录的功能，无需输入信息，可直接进入页面。这里内置预留了测试用“假数据”，可预览小程序内部功能

### 3、视频页 Video页
>顶部的tabBar中间是Video页，可以下拉刷新，下拉触底会获取型数据。支持看一个视频以后切换另一个视频，再次切换回来，会在上一次的播放进度下继续播放。顶部搜索栏目前已实现搜索歌曲的功能。视频顶部能做简单的分享。

**PS: 这块算是整个项目中的小难点。这边由于小程序内部的一些函数，当时我这边之前使用的是Video的autoplay，发现还是不能满足正常切换的效果，后面采用定时器中操作全局音乐实例才完成。可详见该项目的video.js。**

![音乐小程序截图3](https://s2.loli.net/2022/06/20/emV3hzfc2bqARNr.png)


### 4、 个人中心页 personal页
>个人中心页相对来说主要是处理样式，会展示用户的一些基本信息，包含最近播放，音乐歌单，收藏，电台等等。目前实现了最近播放的获取，其余功能有待开发。右上角加入了注销的功能，可以返回login页。

![音乐小程序截图4](https://s2.loli.net/2022/06/20/Q2xRmra8SqeWubc.png)

### 5、 每日推荐界面 recommendation页
>实现用户个人每日推荐歌单的歌曲（每日推荐20首）。这边其实主要在于微信小程序的scroll-view的使用，及其高度样式的把握（避免出现整个页面的长滚动条）。点击可进入音乐页面倾听音乐。
**PS: recommendation页和songDetail页，考虑到项目的结构和大小等分包打包了。**

![音乐小程序截图5](https://s2.loli.net/2022/06/20/EBMA2VGd9mSxcsp.png)

### 6、 音乐详情页 songDetail页
>音乐播放的页面，可以说是项目真正需要实现的功能（听歌）。已实现流畅前后切换歌曲，默认为单曲循环模式。其他模式暂未加入，待之后开发。支持拖动滚动条定位歌曲进度。

整个页面的背景我这边取专辑页，做一定程度高斯模糊展示，产生毛玻璃的效果，（网易云APP本身的歌曲页背景程度比较深，看不见人像）。

![音乐小程序Cover6.png](https://s2.loli.net/2022/06/20/kRjMhW8cyquJepE.png)

![音乐小程序Cover7.png](https://s2.loli.net/2022/06/20/aVpr1zF2MZGN5iw.png)


>在播放音乐的时候,切换到其他页面,会保留一个底部的播放栏,点击可以再次回到音乐页。也可实现对音乐的控制。
![音乐小程序Cover9.png](https://s2.loli.net/2022/06/20/1FeiZ4f2mnb9zuQ.png)

### 7、搜索页 search 页
> 可实现对歌曲名，歌手等相关信息的搜索。自动会展示每日的搜索热度关键字。

![音乐小程序Cover10.png](https://s2.loli.net/2022/06/20/L9Zr4ofhdSXwqab.png)

![音乐小程序Cover11.png](https://s2.loli.net/2022/06/20/CijwHFczt7PxSYL.png)

## 小结：
该音乐小程序项目，已经能完成一个音乐播放器的基本功能，并在微信的开发线上测试中可以正常运行。可惜的是，后台是网易云的真实API，个人项目也无法上线发布，只能线下测试使用。不过对于热爱音乐的我们，做这个项目是个快乐的过程却是无可替代的。
后续的还有好多功能可能不在小程序中实现了，会考虑在web框架中实现。如果喜欢或者帮到你的话，可以点个小小的star啦！😇✨
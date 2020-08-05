# Block Contained

For this document in English, please refer to [README_en.md](README_en.md).

## 什么是Block Contained？
Block Contained是一个运行于Firefox浏览器上的**附加组件**（也可以叫做扩展、插件之类的名称）。
它是针对中国的网络环境设计的，通过重定向、载入本地资源或者直接取消非必要请求的方式加快国外网站的载入速度。
它算是我的一个*练习项目*，请不要期望过高。
## 那么它是否可以...？
**不行。** Block Contained主要针对的是由于防火墙无法访问或速度很慢的静态库资源（像是jQuery、Google Fonts一类的）。您的所有网络流量仍将通过防火墙管制，这也意味着这个功能是完全合法合规的。
## 它的工作原理是什么？
在国内，如果您经常访问国外的技术网站，您会发现不只有Reddit、Facebook之类的网站不能正常访问，一些可以正常连接的网页也会显示异常或者缓慢。这是因为这些网站引用了由Google或Cloudflare等网站提供的CDN上的资源（这里指的是JavaScript库或CSS表），前者由连接重置封锁，不影响速度但会使页面不能正确载入，而后者在浏览器看来呈现可以连接，但始终不响应的状态，这会使Firefox这种script不载入完就索性不显示任何内容的浏览器十分缓慢。

Block Contained通过以下方式尝试解决这个问题：
- 将已知使用cdnjs API的网站的请求**重定向**到国内可以访问的其它CDN上
- 在某些情况下直接用本地保存的少量JavaScript库**代替**远程资源
- 如果没有匹配的资源，直接**取消**可能阻塞的请求，防止浏览器进行不必要的尝试浪费时间
## 下面是关于设置的说明...
- Enable CDN Redirection: 重定向功能的开关，默认开启，如关闭则不会重定向请求，只会匹配本地资源。
- Enable User Blocks: 自定义取消请求的开关，默认关闭，需要手动设置屏蔽规则才有效果。

以下设置只在设置页面中出现，不会在右上角的弹窗按钮中出现。
- Custom Blocking Rules: 自定义规则来取消某些请求。请求必须匹配网站列表中的任意一个**以及**正则表达式中的任意一个才会被取消。关于如何写网站列表，请看[这份文档](https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/Match_patterns)，正则表达式请依照JavaScript正则表达式编写（左右不要写“/”）。
## FAQ
### Why is it in English?
简单来说，嫌麻烦。我并不想处理任何由于中文编码造成的错误。以后也大概率不会用中文重写。
### 你的代码/设计/想法很差诶...
有一说一，确实。前文已经提到这个算是练习项目，各方面自然不会很专业和周到。项目使用的是开源许可证，如果你觉得任何一部分有用，都可以fork或者clone后进行任意修改。
### 那么...怎么才能使用这个呢？
这个项目仍在开发中，短时间内不会上AMO，你要是非要用一下的话，请clone这个项目，然后在Firefox的`about:debugging`页面中[载入临时附加组件](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)并选择manifest.json，不过因为我没有把UI中用到的图片资源上传，所以显示上可能不太正常。

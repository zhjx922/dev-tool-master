# 开发小助手

> 日常工作开发过程中需要的一些工具，我会慢慢更新集成，目前只支持Mac

#### 功能

* 切换Hosts，Chrome下秒生效(必须通过工具内按钮启动)
* 绑定IP到103

#### 截图

![Host切换](https://github.com/zhjx922/dev-tool-master/raw/master/static/hosts.png)
![IP绑定](https://github.com/zhjx922/dev-tool-master/raw/master/static/ip.png)
![IP自动绑定](https://github.com/zhjx922/dev-tool-master/raw/master/static/ip_bind_success.png)
![配置](https://github.com/zhjx922/dev-tool-master/raw/master/static/setting.png)

#### Chrome下Hosts切换如何秒生效

方案一：完全退出当前运行中的Chrome，通过小助手左下角的绿色眼睛图标启动Chrome即可(缺点：每次重新开机都需要操作)

方案二：按下面流程(只需要操作一次)

``` bash
cd "/Applications/Google Chrome.app/Contents/MacOS"

mv "Google Chrome" Google.real

vim "Google Chrome"

```

在打开的新文件中写入：

``` bash
#!/bin/bash
cd "/Applications/Google Chrome.app/Contents/MacOS"
"/Applications/Google Chrome.app/Contents/MacOS/Google.real" --args --remote-debugging-port=9222 --enable-net-benchmarking
```

保存，添加执行权限

``` bash
sudo chmod u+x "Google Chrome"
```

之后正常启动Chrome即可

#### 编译安装

``` bash
# 安装依赖
yarn install

# 开发
yarn dev

# 本地编译
yarn build

```

#### @todo

* IP自动绑定优化
* 微信公众号调试工具(待迁移)
* 本地代码与开发机自动同步
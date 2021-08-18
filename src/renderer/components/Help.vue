<template>
  <div class="help">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item title="Chrome缓存清除失败" name="1">
        <div>Chrome缓存清除是基于Debug模式，向浏览器发送指令实现。所以需要特别配置才可以。</div>
        <div>方案一：完全退出当前运行中的Chrome，通过小助手左下角的绿色眼睛图标启动Chrome即可(缺点：每次重新开机都需要操作)</div>
        <div>方案二：完全退出当前运行中的Chrome，然后按下面流程执行一遍即可</div>
        <div>
          <pre>
cd "/Applications/Google Chrome.app/Contents/MacOS"
mv "Google Chrome" Google.real
vim "Google Chrome"
          </pre>
        </div>
        <div>向新打开的文件写入如下内容：</div>
        <div>
          <pre>
#!/bin/bash
cd "/Applications/Google Chrome.app/Contents/MacOS"
"/Applications/Google Chrome.app/Contents/MacOS/Google.real" --args --remote-debugging-port=9222 --enable-net-benchmarking
          </pre>
        </div>
        <div>保存，添加执行权限：</div>
        <div>
          <pre>
sudo chmod u+x "Google Chrome"            
          </pre>
        </div>
        <div>正常启动Chrome即可。</div>
      </el-collapse-item>
      <el-collapse-item title="为啥这么好用" name="2">
        <div>好用需要理由么</div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        activeNames: []
      }
    },
    methods: {
      handleChange (val) {
        console.log(val)
      }
    }
  }
</script>

<style>
.help {
  padding: 16px;
}
</style>  
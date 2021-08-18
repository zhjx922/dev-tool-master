<template>
  <div id="app">
    <el-dialog
      title="请输入sudo密码"
      width="30%"
      :visible.sync="dialog.inputPwd.visible"
      @open="dialogOpenPwd">
        <el-input v-model="dialog.inputPwd.input" ref="pwdInputRef" show-password placeholder="请输入密码"></el-input>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.inputPwd.visible = false">取 消</el-button>
          <el-button type="primary" @click="onClickPwdConfirm()" :loading="dialog.inputPwd.loading">确 定</el-button>
        </span>
    </el-dialog>
    <el-container>
      <el-header>
        <el-menu
          router
          default-active="hosts"
          mode="horizontal" 
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b">
          <el-menu-item index="hosts"><i class="el-icon-edit-outline"></i><span>Host切换</span></el-menu-item>
          <el-menu-item index="ip"><i class="el-icon-refresh"></i><span>IP绑定</span></el-menu-item>
          <el-menu-item index="wechat"><i class="el-icon-mobile-phone"></i><span>公众号调试</span></el-menu-item>
          <el-menu-item index="setting"><i class="el-icon-setting"></i><span>设置</span></el-menu-item>
          <el-menu-item index="help"><i class="el-icon-info"></i><span>帮助</span></el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'

  export default {
    name: 'new-dev',
    data () {
      return {
        // 当前页面需要注册的事件
        events: [
          'password-input'
        ],
        // 当前页面的Listener
        eventsListener: null,
        dialog: {
          inputPwd: {
            visible: false,
            input: '',
            loading: false
          }
        }
      }
    },
    mounted () {
      this.$router.push({name: 'hosts'})
      this.initEvents()
    },
    // 销毁
    destroyed () {
      console.log('destroyed')
      const self = this
      if (self.eventsListener !== null) {
        ipcRenderer.removeListener('event', self.eventsListener)
        self.eventsListener = null
      }
    },
    methods: {
      // 事件初始化
      initEvents () {
        const self = this

        // 注册监听事件
        ipcRenderer.send('event', 'reg', { name: 'app', events: self.events })

        self.eventsListener = (event, eventName, eventValue) => {
          console.log(event, eventName, eventValue)
          if (eventName === 'password-input') {
            if (eventValue === 'show') {
              // 强制显示窗口
              remote.getCurrentWindow().show()
              // 正常显示
              self.dialog.inputPwd.visible = true
            } else if (eventValue === 'error') {
              // 强制显示窗口
              remote.getCurrentWindow().show()
              // 错误提示
              self.dialog.inputPwd.visible = true
              self.dialog.inputPwd.loading = false
            } else {
              // 隐藏
              self.dialog.inputPwd.visible = false
              self.dialog.inputPwd.loading = false
            }
          }
        }

        // 事件监听
        ipcRenderer.on('event', self.eventsListener)
      },
      // 密码输入框打开触发
      dialogOpenPwd () {
        this.$nextTick(function () {
          this.$refs.pwdInputRef.$el.querySelector('input').focus()
        })
      },
      // 点击保存密码
      onClickPwdConfirm () {
        if (!this.dialog.inputPwd.input) {
          return false
        }
        this.dialog.inputPwd.loading = true
        // 发送密码
        ipcRenderer.send('event', 'password-input', this.dialog.inputPwd.input)
      },
      // 检查IP变化
      checkIPChange () {
        const self = this
        console.log(self)
      }
    }
  }
</script>

<style lang="scss">
html, body, #app, .el-container{
  margin: 0px;
  padding: 0px;
  height: 100%;
}
.el-header {
  padding: 0px!important;
}
</style>

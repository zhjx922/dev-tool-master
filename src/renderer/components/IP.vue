<template>
  <div class="ip">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="small">
      <el-form-item label="输入账号" prop="username">
        <el-input v-model="form.username" clearable></el-input>
      </el-form-item>
      <el-form-item label="开发环境" prop="env_ip">
        <el-autocomplete
          class="inline-input"
          v-model="form.env_ip"
          :fetch-suggestions="querySearch"
          placeholder="请输入开发环境IP"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="自动绑定">
        <el-switch v-model="form.auto" @click.native.prevent="onClickAuto()"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-bind:disabled="form.auto" v-bind:loading="loading" @click="onSubmit('form')">绑定</el-button>
        <el-button @click="onSave('form')">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'

  export default {
    data () {
      return {
        // 当前页面需要注册的事件
        events: [
          'ip-bind',
          'ip-save'
        ],
        // 当前页面的Listener
        eventsListener: null,
        loading: false,
        form: {
          username: '',
          env_ip: '',
          auto: false,
          save: false,
          restaurants: [
            {'value': '172.16.0.103'},
            {'value': '172.16.70.103'}
          ]
        },
        rules: {
          username: [
            {required: true, message: '请输入账号', trigger: 'blur'}
          ],
          env_ip: [
            {required: true, message: '请选择开发环境', trigger: 'blur'}
          ]
        }
      }
    },
    mounted () {
      this.initEvents()
      this.init()
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
      initEvents () {
        const self = this
        // 注册监听事件
        ipcRenderer.send('event', 'reg', { name: 'ip', events: self.events })

        self.eventsListener = (event, eventName, eventValue) => {
          console.log(event, eventValue)
          if (eventName === 'ip-bind') {
            self.$message({
              duration: 5000,
              center: true,
              showClose: true,
              message: eventValue.message,
              type: eventValue.type
            })
          }
        }

        // 事件监听
        ipcRenderer.on('event', self.eventsListener)
      },
      init () {
        console.log('init')
        this.form.username = this.$config.GetConfig('ip.username')
        this.form.env_ip = this.$config.GetConfig('ip.env_ip')
        this.form.auto = this.$config.GetConfig('ip.auto')
      },
      querySearch (queryString, cb) {
        var restaurants = this.form.restaurants
        var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
        // 调用 callback 返回建议列表的数据
        cb(results)
      },
      createFilter (queryString) {
        return (restaurant) => {
          return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
        }
      },
      onClickAuto () {
        console.log(this.form.auto)
      },
      // 绑定
      onSubmit (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            console.log('submit!', this.form)
            // Hosts切换
            ipcRenderer.send('event', 'ip-bind', {username: this.form.username, env_ip: this.form.env_ip})
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      // 保存配置
      onSave (formName) {
        const self = this
        this.$refs[formName].validate((valid) => {
          if (valid) {
            console.log('submit!', this.form)
            this.$config.UpdateConfig('ip', {username: this.form.username, env_ip: this.form.env_ip, auto: this.form.auto})
            // IP切换
            ipcRenderer.send('event', 'ip-save')
            self.$message({
              duration: 800,
              center: true,
              showClose: true,
              message: '保存成功',
              type: 'success'
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
    }
  }
</script>

<style>
.ip {
  padding: 16px;
}
</style>  
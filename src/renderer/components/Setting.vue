<template>
  <div class="setting">
    <el-form ref="form" label-position="right" :model="config" label-width="140px" size="small">
      <el-form-item label="Chrome缓存清理">
        <el-switch 
          v-model="config.hosts.clearChrome">
        </el-switch>
      </el-form-item>
      <el-form-item label="IP自动绑定">
        <el-switch 
          v-model="config.ip.auto">
        </el-switch>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'

  export default {
    data () {
      return {
        config: {
          hosts: {
            clearChrome: false
          },
          ip: {
            auto: false
          }
        }
      }
    },
    // 初始化
    mounted () {
      console.log('mounted')
      this.initClearChrome()
    },
    methods: {
      // 初始化清除Chrome开关
      initClearChrome () {
        this.config.hosts.clearChrome = this.$config.GetConfig('hosts.clearChrome')
        this.config.ip.auto = this.$config.GetConfig('ip.auto')
      },
      onSubmit () {
        console.log('submit!')
        this.$config.UpdateConfig('hosts.clearChrome', this.config.hosts.clearChrome)
        this.$config.UpdateConfig('ip.auto', this.config.ip.auto)
        // IP保存
        ipcRenderer.send('event', 'ip-save')

        this.$message({
          duration: 800,
          message: '保存成功',
          type: 'success'
        })
      }
    }
  }
</script>

<style>
.setting {
  padding: 16px;
}
</style>  
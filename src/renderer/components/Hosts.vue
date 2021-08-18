<template>
  <el-container>
    <el-container>
      <el-aside width="180px">
        <el-tree
          :props="tree.props"
          :data="tree.data"
          node-key="id"
          ref="tree"
          empty-text="请添加Host"
          highlight-current
          show-checkbox
          draggable
          :allow-drag="allowDrag"
          :allow-drop="allowDrop"
          @check="onCheckClick"
          @node-click="onClickNode"
          @node-drop="onDrop">
        </el-tree>
      </el-aside>
      <el-main>
        <textarea ref="code" v-model="editor.code"></textarea>
      </el-main>
    </el-container>
    <el-footer>
      <el-row>
          <el-tooltip effect="dark" content="启动Chrome(快速切换模式)" placement="top">
            <el-button type="success" size="mini" icon="el-icon-view" @click="onChrome()" circle></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="添加Hosts" placement="top">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="openHostsPrompt()" circle></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="修改Hosts名称" placement="top">  
            <el-button type="info" size="mini" icon="el-icon-edit" @click="onClickEdit()" circle></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除Hosts" placement="top">  
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="onClickDel()" circle></el-button>
          </el-tooltip>
      </el-row> 
    </el-footer>
  </el-container>
</template>

<script>
  import { ipcRenderer, shell } from 'electron'
  import 'codemirror/theme/ambiance.css'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/addon/hint/show-hint.css'

  let CodeMirror = require('codemirror/lib/codemirror')
  require('codemirror/addon/edit/matchbrackets')
  require('codemirror/addon/selection/active-line')
  require('codemirror/addon/search/searchcursor')
  require('codemirror/addon/search/search')
  require('codemirror/mode/shell/shell')

  const fs = require('fs')
  const exec = require('child_process').exec

  export default {
    data () {
      return {
        // 当前页面需要注册的事件
        events: [
          'hosts-switch'
        ],
        // 当前页面的Listener
        eventsListener: null,
        dialog: {
          hosts: {
            input: '',
            key: ''
          }
        },
        tree: {
          default: {
            id: 'hosts',
            label: '当前Host',
            disabled: true
          },
          data: [],
          props: {
            label: 'label'
          },
          nodeId: ''
        },
        editor: {
          mirror: null,
          code: '',
          options: {
            readOnly: 'nocursor',
            styleActiveLine: true,
            styleSelectedText: true,
            tabSize: 4,
            theme: 'default',
            mode: 'mymode',
            lineNumbers: true,
            matchBrackets: true,
            line: true,
            extraKeys: {
              'Cmd-S': () => {
                console.log('cmd-s')
                this.onSaveCode()
              },
              'Cmd-F': 'find'
            }
          }
        }
      }
    },
    // 初始化
    mounted () {
      console.log('mounted')
      this.initEvents()
      this.reloadTree()
      this.initEditor()
    },
    // 销毁
    destroyed () {
      const self = this
      console.log('destroyed')
      if (self.eventsListener !== null) {
        ipcRenderer.removeListener('event', self.eventsListener)
        self.eventsListener = null
      }
    },
    // 公用方法
    methods: {
      // 事件初始化
      initEvents () {
        const self = this

        // 注册监听事件
        ipcRenderer.send('event', 'reg', { name: 'hosts', events: self.events })

        self.eventsListener = (event, eventName, eventValue) => {
          console.log(event, eventName, eventValue)
          // 切换Hosts
          if (eventName === 'hosts-switch') {
            if (eventValue === 'chromeSuccess') {
              self.$message({
                duration: 800,
                center: true,
                showClose: true,
                message: 'Chrome缓存清除成功',
                type: 'success'
              })
            } else if (eventValue === 'chromeError') {
              self.$confirm('点击失败原因查看处理方法', 'Chrome缓存清除失败', {
                confirmButtonText: '失败原因',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                self.openHelp()
              }).catch(() => {

              })
            } else {
              self.reloadTree()
            }
          }
        }
        // 事件监听
        ipcRenderer.on('event', self.eventsListener)
      },
      // 重新生成Tree
      reloadTree () {
        console.log('fun:reloadTree')
        const self = this
        self.tree.data = []
        self.tree.data.push(self.tree.default)
        const hosts = this.$hosts.GetAllHosts()
        let checkedKeys = []
        for (let i in hosts) {
          let node = {
            id: hosts[i].id,
            label: hosts[i].name
          }
          self.tree.data.push(node)

          if (hosts[i].checked) {
            checkedKeys.push(node.id)
          }
        }
        self.$refs.tree.setCheckedKeys(checkedKeys)
      },
      // 初始化编辑器
      initEditor () {
        // 代码编辑初始化
        CodeMirror.defineMode('mymode', () => {
          return {
            token (stream, state) {
              if (stream.eatSpace()) return null
              let ch = stream.next()
              if (ch === '#') {
                stream.skipToEnd()
                return 'comment'
              }
              if (stream.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
                return 'keyword'
              } else if (stream.match(/(.*)\.(.*)\.(.*)/)) {
                return 'string'
              } else {
                stream.next()
                return null
              }
            }
          }
        })
        this.editor.mirror = CodeMirror.fromTextArea(this.$refs.code, this.editor.options)
        this.editor.mirror.on('change', (cm) => {
          this.editor.code = cm.getValue()
        })
      },
      // 点击编辑Hosts
      onClickEdit () {
        const key = this.$refs.tree.getCurrentKey()
        if (key && key !== 'hosts') {
          const doc = this.$hosts.GetHosts(key)
          this.dialog.hosts.input = doc.name
          this.dialog.hosts.key = doc.id
          this.openHostsPrompt()
        }
      },
      // 打开Hosts编辑框
      openHostsPrompt () {
        const self = this
        self.$prompt('请输入Hosts名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S/,
          inputErrorMessage: '名称不能为空',
          inputValue: self.dialog.hosts.input
        }).then(({ value }) => {
          if (self.dialog.hosts.key) {
            self.$hosts.UpdateHosts(self.dialog.hosts.key, {name: value})
          } else {
            self.$hosts.AddHosts(value, '')
          }

          self.reloadTree()
          // 托盘更新菜单
          ipcRenderer.send('event', 'hosts-switch-tray')
          self.dialog.hosts.input = ''
          self.dialog.hosts.key = ''
        }).catch(() => {
          console.log('取消输入')
          self.dialog.hosts.input = ''
          self.dialog.hosts.key = ''
        })
      },
      // 点击删除Hosts
      onClickDel () {
        const self = this
        const key = this.$refs.tree.getCurrentKey()
        if (key === null || key === 'hosts') {
          return
        }
        self.$confirm('此操作不可恢复, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          self.$hosts.DeleteHosts(key)
          self.reloadTree()
          // 托盘更新菜单
          ipcRenderer.send('event', 'hosts-switch-tray')
        }).catch(() => {
          console.log('取消')
        })
      },
      // tree节点点击处理
      onClickNode (data) {
        const self = this
        this.tree.nodeId = data.id
        if (data.id === 'hosts') {
          this.editor.mirror.setOption('readOnly', 'nocursor')
          fs.readFile('/etc/hosts', {flag: 'r', encoding: 'utf8'}, (err, data) => {
            if (err) {
              console.log(err)
            } else {
              self.editor.mirror.setValue(data)
            }
          })
        } else {
          this.editor.mirror.setOption('readOnly', false)
          const doc = this.$hosts.GetHosts(data.id)
          console.log(doc)
          if (doc) {
            self.editor.mirror.setValue(doc.value)
          }
        }
      },
      // 保存代码
      onSaveCode () {
        console.log('save host')
        if (!this.tree.nodeId || this.tree.nodeId === 'hosts') {
          return
        }
        this.$hosts.UpdateHosts(this.tree.nodeId, {value: this.editor.code})
        // Hosts切换
        ipcRenderer.send('event', 'hosts-switch')
      },
      // 复选框被选中
      onCheckClick (data, checked) {
        // 修改Hosts选中状态(db)
        this.$hosts.UpdateHosts(data.id, { checked: checked.checkedKeys.includes(data.id) })
        // hosts切换事件
        ipcRenderer.send('event', 'hosts-switch')
      },
      // 判断是否允许放置
      allowDrop (draggingNode, dropNode, type) {
        if (type === 'inner') {
          return false
        }

        console.log(draggingNode.data.id, dropNode, type)

        // 不允许方式在当前Host前
        if (dropNode.data.id === 'hosts' && type === 'prev') {
          return false
        }
        return true
      },
      // 判断是否允许拖拽
      allowDrag (draggingNode) {
        if (draggingNode.data.id === 'hosts') {
          return false
        }
        return true
      },
      // 拖拽成功
      onDrop (draggingNode, dropNode, dropType, ev) {
        draggingNode = null
        dropNode = null
        dropType = null
        console.log(ev)
        console.log(this.$refs.tree.data)
        const tree = this.$refs.tree.data
        for (let i in tree) {
          if (tree[i].id === 'hosts') {
            continue
          }
          this.$hosts.UpdateHosts(tree[i].id, {sort: i})
        }
        // hosts切换事件
        ipcRenderer.send('event', 'hosts-switch')
        return true
      },
      // 启动Chrome
      onChrome () {
        exec(`open -a 'Google Chrome' --args --remote-debugging-port=9222 --enable-net-benchmarking`, (error, stdout, stderr) => {
          console.log(error, stdout, stderr)
        })
      },
      // 打开帮助
      openHelp () {
        shell.openExternal('https://github.com/zhjx922/dev-tool-master#chrome%E4%B8%8Bhosts%E5%88%87%E6%8D%A2%E5%A6%82%E4%BD%95%E7%A7%92%E7%94%9F%E6%95%88')
      }
    }
  }
</script>

<style>
.vue-codemirror, .CodeMirror {
  height: 100%;
}
.CodeMirror-scroll {
  padding-bottom: 0px;
}
.el-main {
  padding: 0px !important;
  height: 100%;
}
.el-header, .el-footer {
  background-color: #f7f7f7;
  color: #333;
  line-height: 60px;
}
.setting {
  padding: 6px 0;
}
</style>  
import Vue from 'vue'
import VueElectron from 'vue-electron'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import hosts from '../common/hosts'
import config from '../common/config'
import common from './common'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
Vue.use(VueElectron)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.http = Vue.prototype.$http = axios
Vue.prototype.$hosts = hosts
Vue.prototype.$config = config
Vue.prototype.$common = common
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

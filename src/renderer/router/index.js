import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'default',
      component: require('@/components/Default').default
    },
    {
      path: '/ip',
      name: 'ip',
      component: require('@/components/IP').default
    },
    {
      path: '/hosts',
      name: 'hosts',
      component: require('@/components/Hosts').default
    },
    {
      path: '/setting',
      name: 'setting',
      component: require('@/components/Setting').default
    },
    {
      path: '/help',
      name: 'help',
      component: require('@/components/Help').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import VueLazyLoad from 'vue-lazyload'
import router from './router'
import fastclick from 'fastclick'
import axios from 'axios'
import store from './store'

Vue.config.productionTip = false

// 会拦截点击并自己派发tap，所以在a标签上面的点击的时候要加个class为needsclick来阻止fastclick的阻拦
fastclick.attach(document.body)

Vue.prototype.$http = axios
Vue.use(VueLazyLoad, {
  loading: require('./common/image/default.png')
})

import '@/common/stylus/index.styl'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

import Vue from 'vue'
import VueHead from 'vue-head'
import App from './App.vue'
import router from './router'

Vue.use(VueHead, { complement: process.env.PROJECT_NAME })

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

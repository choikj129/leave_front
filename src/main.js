// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from "axios"
import vuetify from '@/plugins/vuetify' // path to vuetify export
import axiosInterceptor from "@/apis/axiosInterceptor"
import components from "@/components/index"
import "@/assets/css/index.css";

Vue.mixin(components)

axiosInterceptor.use(axios);


Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  vuetify,
  components: { App },
  template: '<App/>'
}).$mount('#app')

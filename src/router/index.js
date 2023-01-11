import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'

Vue.use(Router)

const router = new Router({
  mode : "history",
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index')
    },
    {
      path: '/leave',
      name: 'leave',
      component: () => import('@/views/leave/index')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/test')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const path = to.path
  if (path == "/"){
    if (store.getters.getUser.isLogin) {
      router.push({path : "leave"})
    } else {
      router.push({path : "login"})
    }
  } else if (["/login", "/logout", "/test"].includes(path)){
    next()
  } else {
    if (store.getters.getUser.isLogin) {
      next()
    } else {
      router.push({path : "login"})
    }
  }
})

export default router
import Vue from 'vue'
import Router from 'vue-router'

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
    router.push({name : "leave"})
    // window.location.href = "/login"
    // next()
  } else if (["/login", "/logout"].includes(path)){
    next()
  } else {
    next()
  }
})

export default router
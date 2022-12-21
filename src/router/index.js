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
      path: '/main',
      name: 'mainPage',
      component: () => import('@/views/main/index')
    },
    {
      path: '/hello',
      name: 'HelloWorld',
      component: () => import('@/views/HelloWorld')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  console.log(window.location.pathname)
  if (window.location.pathname == "/"){
    window.location.href = "/main"
    // window.location.href = "/login"
    next();
  } else if (["/login", "/logout"].includes(window.location.pathname)){
    next();
  } else{
    next();
  }
})

export default router;
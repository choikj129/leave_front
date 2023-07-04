import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import axios from "axios";

Vue.use(Router)

const router = new Router({
	mode: "history",
	routes: [
		{
			path: '/login',
			name: 'login',
			component: () => import('@/views/login/index')
		},
		{
			path: '/reset',
			name: 'reset',
			component: () => import('@/views/login/reset')
		},
		{
			path: '/leave*',
			name: 'leave',
			component: () => import('@/views/leave/index')
		},
	]
})

router.beforeEach(async (to, from, next) => {
	const path = to.path
	if (path == "/") {
		/* 미 로그인시 로그인 페이지로 이동 */
		if (store.getters.getUser.isLogin) {
			router.push({ path: "/leave" })
		} else {
			router.push({ path: "/login" })
		}
	} else if (["/login", "/logout", "/test", "/reset"].includes(path)) {
		if (path == "/logout") {
			axios.get("/logout").then((res) => {
				if (res.status) {
					store.commit("clearStore")
					router.push({ path: "/login" })
				}
			})
		} else {
			next()
		}
	} else {
		if (store.getters.getUser.isLogin) {
			next()
		} else {
			router.push({ path: "/login" })
		}
	}
})

export default router
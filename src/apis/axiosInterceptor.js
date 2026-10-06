import store from "../store"

let requestInterceptor = null
let responseInterceptor = null

/*
	DB 장애 시 서버가 스냅샷으로 응답하면 X-Snapshot-At 헤더(스냅샷 기준 시각)가 포함됨
	헤더 유무로 조회 전용 모드 전환 (로그인은 로그인 화면에서 처리, 로그아웃은 DB 미사용)
*/
const setSnapshotMode = (response) => {
	const user = store.getters.getUser
	if (!user.isLogin || /^\/api\/(login|logout)/.test(response.config.url)) return

	const snapshotAt = response.headers["x-snapshot-at"]
	if (snapshotAt && !user.isSnapshot) {
		store.commit("setUser", { ...user, isSnapshot : true, snapshotAt : snapshotAt })
		alert(`DB 접속 불가로 조회만 가능합니다.\n(${snapshotAt} 기준 데이터)`)
	} else if (!snapshotAt && user.isSnapshot && response.data.status) {
		store.commit("setUser", { ...user, isSnapshot : false, snapshotAt : null })
		alert("DB 접속이 복구되었습니다.")
	}
}

const use = (axios) => {
	// 모든 axios 요청에 대한 선처리
	if (requestInterceptor == null) {
		requestInterceptor = axios.interceptors.request.use(
			(config) => {
				config.headers = { "Content-Type": "application/json;charset=UTF-8" }
				config.url = "/api" + config.url
				return config
			},
			(error) => {
				console.error(error)
				return Promise.reject(error)
			}
		)
	}
	// 모든 axios 응답에 대한 선처리
	if (responseInterceptor == null) {
		responseInterceptor = axios.interceptors.response.use(
			(response) => {
				setSnapshotMode(response)
				// session 만료 시 로그인 페이지로 이동
				if (!response.data.status) {
					if (response.staus) {
						console.log(response)
					} else {
						console.log(response.data)
						if (/\]([\s\S]*)/.test(response.data.msg)) {
							response.data.msg = RegExp.$1
						}
					}
					if (response.data.msg == "no session") {
						if (!window.location.href.endsWith("/login")) {
							window.location.href="/login"
						}
					}
				}
				return response.data
			},
			(error) => {
				// console.error(error)
				return Promise.reject(error)
			}
		)
	}
}

const eject = (axios) => {
	if (requestInterceptor) {
		axios.interceptors.request.eject(requestInterceptor)
	}
	if (responseInterceptor) {
		axios.interceptors.response.eject(responseInterceptor)
	}
}

export default {
	use,
	eject,
}

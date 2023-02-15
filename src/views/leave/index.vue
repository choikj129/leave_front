<template>
	<v-app id="inspire">
		<v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" class="navBar ml-5" :class="{'mt-5' : isMobile}"></v-app-bar-nav-icon>
		<v-navigation-drawer v-model="drawer" app>
			<v-card class="mx-auto" max-width="344" color="#e2efff">
				<img src="../../assets/img/odinue_ci.svg">
				<v-card-text style="font-size: 2rem; font-weight: bold;">
					{{ user.name }} {{ user.position }}
				</v-card-text>

				<v-card-subtitle style="font-size: 1.5rem;font-weight: bold;">
					{{ user.id }}@odinue.net
				</v-card-subtitle>
			</v-card>
			<v-list style="padding-top:0">
				<v-list-item v-for="link in linksTop" :key="link.type" 
					v-if="link.auth"
					@click="changeComponent(link.type)"
					:class="{
						activeComponent : link.type == selectType,
					}"

				>
					<v-list-item-icon>
						<v-icon>{{ link.icon }}</v-icon>
					</v-list-item-icon>

					<v-list-item-content>
						<v-list-item-title>{{ link.text }}</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
			<template v-slot:append>
				<v-list>
					<v-list-item v-for="link in linksBottom" :key="link.type" 
						v-if="link.auth"
						@click="changeComponent(link.type)"
						:class="{
							activeComponent : link.type == selectType,
						}"
						
					>
						<v-list-item-icon>
							<v-icon>{{ link.icon }}</v-icon>
						</v-list-item-icon>
	
						<v-list-item-content>
							<v-list-item-title>{{ link.text }}</v-list-item-title>
						</v-list-item-content>
					</v-list-item>
				</v-list>
			</template>
		</v-navigation-drawer>
		<manage v-if="selectType == 'manage'"
			:is-mobile="isMobile"
			:users="users"
			:positions="positions"
			@getUsers="getUsers"
		/>
		<lists v-else-if="selectType == 'lists'" 
			:is-mobile="isMobile"
			:leave-cnts="leaveCnts"
			:users="usersSort"
			@getCnts="getCnts"
		/>
		<request v-else-if="selectType == 'request'"
			:is-mobile="isMobile"
			@getCnts="getCnts"
		/>
		<calendar v-else-if="selectType == 'calendar'"
			:is-mobile="isMobile"
			@getCnts="getCnts"
		/>
		<history v-else-if="selectType == 'history'"
			:is-mobile="isMobile"
		/>
		<update v-else-if="selectType == 'update'"
			:is-mobile="isMobile"
		/>
	</v-app>
</template>

<script>
import manage from "./components/manage"
import lists from "./components/lists"
import request from "./components/request"
import calendar from "./components/calendar"
import history from "./components/history"
import update from "./components/update"

export default {
	components: {
		manage,
		lists,
		calendar,
		request,
		history,
		update,
	},
	name : "leave",
	data() {
		return {
			drawer: null,
			linksTop: [
				{ icon: "mdi-account-wrench-outline", text: "휴가 관리", auth: this.$store.getters.getUser.isManager, type: "manage"},
				{ icon: "mdi-view-list", text: "휴가 현황", auth: true, type: "lists"},
				{ icon: "mdi-calendar-plus", text: "휴가 신청", auth:  !this.$store.getters.getUser.isManager, type: "request"},
				{ icon: "mdi-calendar-month", text: "전 직원 휴가 일정", auth:  true, type: "calendar"},
				{ icon: "mdi-text-long", text: "휴가 기록", auth: this.$store.getters.getUser.isManager, type: "history"},
			],
			linksBottom : [
				{ icon: "mdi-key-variant", text: "비밀번호 변경", auth: true, type: "update"},
				{ icon: "mdi-download", text: "매뉴얼 다운로드", auth: true, type: "download"},
				{ icon: "mdi-logout", text: "로그아웃", auth: true, type: "logout"},
			],
			user: this.$store.getters.getUser,
			selectType: "",
			items: [],
			leaveCnts : {},
			users : [],
			usersSort : [],
			manageItems : [],
			positions : [],
			isMobile : this.$store.getters.getUser.isMobile,
		}
	},
	methods: {		
		changeComponent(type) {
			if (type == "logout"){
				this.$router.push("/logout")
				return
			} else if (type == "download") {
				this.download()
				return
			}
			this.selectType = type
			if (this.$route.path != `/leave/${type}`) { 
				this.$router.push(`/leave/${type}`)				
			}
		},
		/* 휴가 신청시 데이터가 수정되어 부모 컴포넌트에서 처리 */
		getCnts(isLoadPage = false, id = this.$store.getters.getUser.id, next = ()=>{}) {
			this.leaveCnts = {}
			this.$get("/leave/cnts", {
				id: id
			}).then((res) => {
				res.data.forEach((obj) => {
					this.leaveCnts[obj.연도] = {
						휴가수 : obj.휴가수,
						사용휴가수 : obj.사용휴가수,						
						잔여휴가수 : obj.휴가수 - obj.사용휴가수,						
						active : false,
					}
				})				
				if (isLoadPage) {
					if (this.$store.getters.getUser.isManager){
						this.changeComponent("manage")
					}else {
						this.changeComponent("lists")
					}
				}
				/* next로 calendar 후처리 */
				next()
			})
		},
		getUsers(year = new Date().getFullYear(), isLoadPage=false) {			
			this.$get("/users", {year : year}).then((res) => {
				this.users = res.data
				if (isLoadPage) this.usersSort = []
				this.users.forEach((user) => {
					user.이름_아이디 = `${user.이름} ${user.직위} [${user.아이디}]`
					user.휴가수원본 = user.휴가수
					user.직위코드원본 = user.직위코드
					user.입사일원본 = user.입사일
					if (isLoadPage) this.usersSort.push(user)
				})
				if (isLoadPage) {
					this.usersSort = this.usersSort.sort((a, b) => {					
						if (a.이름 < b.이름) {
							return -1;
						}
						if (a.이름 > b.이름) {
							return 1;
						}
						return 0;
					});
				}
			})
		},
		download() {
			const link = document.createElement("a")
			link.href = "/api/download"
			link.setAttribute("download", null)
			link.setAttribute("id", "download")
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
		}
	},
	created() {		
		this.getUsers(new Date().getFullYear(), true)		
		this.getCnts(true)
		this.$get("/code", {name : "직위", reverse : true}).then(res => {
			this.positions = res.data
		})
	},
}
</script>
<template>
	<v-app id="inspire">
		<v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" class="navBar ml-5" :class="{'mt-5' : isMobile}"></v-app-bar-nav-icon>
		<v-navigation-drawer v-model="drawer" app>
			<v-card class="mx-auto" :class="{'mobile-index-top' : isMobile}" max-width="344" color="#e2efff">
				<img src="../../assets/img/odinue_ci.svg" :class="{'mobile-index-img' : isMobile}">
				<v-card-text style="font-size: 2rem; font-weight: bold; padding-top:0;">
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
			<v-divider></v-divider>
			<v-list>
				<v-list-item v-for="link in linksBottom" :key="link.type"
					v-if="link.auth"
					@click="changeComponent(link.type)"
					:class="{
						activeComponent : link.type == selectType,
					}"
					:disabled="link.type.startsWith('none')"
				>
					<v-list-item-icon>
						<v-icon>{{ link.icon }}</v-icon>
					</v-list-item-icon>

					<v-list-item-content>
						<v-list-item-title>{{ link.text }}</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>
		<manageUser v-if="selectType == 'manage_user'"
			:users="users"
			@getUsers="getUsers"
		/>
		<manageVacation v-else-if="selectType == 'manage_vacation'"
			:users="users"
			@getUsers="getUsers"
		/>
		<lists v-else-if="selectType == 'lists'"
			:leave-cnts="leaveCnts"
			:users="usersSort"
			@getCnts="getCnts"
		/>
		<regist v-else-if="selectType == 'regist'"
			:users="usersSort"
			@getCnts="getCnts"
		/>
		<calendar v-else-if="selectType == 'calendar'"
			@getCnts="getCnts"
		/>
		<history v-else-if="selectType == 'history'"/>
		<update_password v-else-if="selectType == 'update_password'"/>
		<update_holiday v-else-if="selectType == 'update_holiday'"/>
		<apiUpdate v-else-if="selectType == 'api_update'"/>
	</v-app>
</template>

<script>
import manageUser from "./components/manage_user"
import manageVacation from "./components/manage_vacation"
import lists from "./components/lists"
import regist from "./components/regist"
import calendar from "./components/calendar"
import history from "./components/history"
import update_holiday from "./components/update_holiday.vue"
import update_password from "./components/update_password"
import apiUpdate from "./components/api_update"

export default {
	components: {
		manageUser,
		manageVacation,
		lists,
		calendar,
		regist,
		history,
		update_holiday,
		update_password,
		apiUpdate,
	},
	name : "leave",
	data() {
		return {
			drawer: null,
			linksTop: [
				{ icon: "mdi-account-wrench-outline", text: "직원 관리", auth: this.$store.getters.getUser.isManager, type: "manage_user"},
				{ icon: "mdi-calendar-account", text: "휴가 관리", auth: this.$store.getters.getUser.isManager, type: "manage_vacation"},
				{ icon: "mdi-view-list", text: "휴가 현황", auth: true, type: "lists"},
				{ icon: "mdi-calendar-plus", text: "휴가 신청", auth:  true, type: "regist"},
				{ icon: "mdi-calendar-month", text: "전 직원 휴가 및 생일", auth:  true, type: "calendar"},
				{ icon: "mdi-text-long", text: "휴가 기록", auth: this.$store.getters.getUser.isManager, type: "history"},
			],
			linksBottom : [
				{ icon: "mdi-text-box", text: "API Docs", auth: true, type: "api_docs"},
				{ icon: "mdi-calendar-alert", text: "휴일 관리", auth: this.$store.getters.getUser.isManager, type: "update_holiday"},
				// { icon: "mdi-puzzle", text: "API키 변경", auth: this.$store.getters.getUser.isManager, type: "api_update"},
				{ icon: "mdi-key-variant", text: "비밀번호 변경", auth: true, type: "update_password"},
				{ icon: "mdi-download", text: "매뉴얼 다운로드", auth: true, type: "download"},
				{ icon: "mdi-logout", text: "로그아웃", auth: true, type: "logout"},
				{ icon: "", text: "", auth: true, type: "none_2"},
				{ icon: "", text: "", auth: true, type: "none_3"},
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
				const manageType = this.$store.getters.getUser.isManager ? "관리자" : "사용자"				
				this.$fileDownload(`어다인_휴가관리_${manageType}_매뉴얼.pdf`)
				return
			} else if (type == "api_docs") {
				window.open("/api-docs")
				return				
			}
			this.selectType = type
			// if (this.$route.path != `/leave/${type}`) {
			// 	this.$router.push(`/leave/${type}`)
			// }
		},
		/* 휴가 신청시 데이터가 수정되어 부모 컴포넌트에서 처리 */
		getCnts(isLoadPage = false, id = this.$store.getters.getUser.id, next = ()=>{}) {
			this.leaveCnts = {}
			this.$get("/leave/cnts", {
				id: id
			}).then(async (res) => {
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
						this.changeComponent("manage_user")
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
					user.음력여부 = user.음력여부 == 'Y' ? true : false
					
					if (isLoadPage) this.usersSort.push(user)
				})
				if (isLoadPage) {
					this.usersSort = this.usersSort.sort((a, b) => {
						if (a.이름 < b.이름) {
							return -1
						}
						if (a.이름 > b.이름) {
							return 1
						}
						return 0
					})
				}
			})
		},
	},
	created() {
		if (Object.keys(this.$store.getters.getHoliday).length) {
			this.$setHoliday()
		}
		this.getUsers(new Date().getFullYear(), true)
		this.getCnts(true)
	},
	mounted() {
		let drawer = document.getElementsByClassName("v-navigation-drawer__content")[0]
		drawer.style.overflowY = this.isMobile ? "auto" : "hidden"
	}
}
</script>

<style>
    .v-application .secondary {
        background-color: #cacaca!important;
    }
</style>
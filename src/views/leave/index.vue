<template>
	<v-app id="inspire">
		<v-navigation-drawer v-model="drawer" app>
			<v-card class="mx-auto" max-width="344" color="#e2efff">
				<img src="../../assets/img/odinue_ci.svg" style="width: 100%; position: relative;">
				<v-card-text style="font-size: 2rem; font-weight: bold;">
					{{ user.name }} {{ user.position }}
				</v-card-text>

				<v-card-subtitle style="font-size: 1.5rem;font-weight: bold;">
					{{ user.id }}@odinue.net
				</v-card-subtitle>
			</v-card>

			<v-list style="padding-top:0">
				<v-list-item v-for="link in links" :key="link.type" 
					v-if="link.auth"
					@click="changeComponent(link.type, link.text)"
					:class="{
						activeComponent : link.type == selectType,
						isLogout : link.type == 'logout'
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
		</v-navigation-drawer>
		<calendar v-if="selectType == 'calendar'" 
			:leave-cnts="leaveCnts"
			:users="users"
			@getLists="getLists"
		/>
		<lists v-else-if="selectType == 'lists'" 
			:items="items" 
			:leave-cnts="leaveCnts"
		/>
		<manage v-else-if="selectType == 'manage'"
			:users="users"
			@getManageLists="getManageLists"
			@getUsers="getUsers"
		/>
		<logs v-else-if="selectType == 'logs'"/>
	</v-app>
</template>

<script>
import calendar from "./components/calendar"
import lists from "./components/lists"
import manage from "./components/manage"
import logs from "./components/logs"
export default {
	components: {
		calendar,
		lists,
		manage,
		logs,
	},
	data() {
		return {
			drawer: null,
			links: [
				{ icon: "mdi-view-list", text: "휴가 리스트", auth: !this.$store.getters.getUser.isManager, type: "lists"},
				{ icon: "mdi-account-wrench-outline", text: "휴가 관리", auth: this.$store.getters.getUser.isManager, type: "manage"},
				{ icon: "mdi-calendar-month", text: "휴가 일정", auth: true, type: "calendar"},
				{ icon: "mdi-text-long", text: "휴가 기록", auth: this.$store.getters.getUser.isManager, type: "logs"},
				{ icon: "mdi-logout", text: "로그아웃", auth: true, type: "logout"},
			],
			user: this.$store.getters.getUser,
			selectType: "",
			items: [],
			leaveCnts : {},
			users : [],
			manageItems : []
		}
	},
	methods: {
		changeComponent(type, text) {
			if (text == "") return
			else if (type == "logout"){
				this.$router.push("/logout")
				return
			}
			this.selectType = type
			if (this.$route.path != `/leave/${type}`) { 
				this.$router.push(`/leave/${type}`)				
			}
		},
		getLists(isLoadPage = false, next = ()=>{}) {
			this.$get("/leave/lists", {
				id: this.$store.getters.getUser.id
			}).then((res) => {
				this.manageItems = []
				this.items = res.data.lists.reduce((acc, obj) => {
					const year = obj.연도
					acc[year] = acc[year] != undefined ? acc[year] : []
					acc[year].push(obj)

					return acc
				}, {})
				res.data.cnts.forEach((obj) => {
					this.leaveCnts[obj.연도] = {
						휴가수 : obj.휴가수,
						남은휴가수 : obj.휴가수 - obj.사용휴가수,						
						active : false,
					}

					if (obj.연도 == new Date().getFullYear()) {
						this.leaveCnts[obj.연도].active = true
					}
				})
				if (isLoadPage) {
					if (this.$store.getters.getUser.isManager){
						this.changeComponent("manage")						
					}else {
						this.changeComponent("lists")
					}
				}
				next()
			})
		},
		getUsers(year = new Date().getFullYear()) {
			this.users = []
			this.$get("/users", {year : year}).then((res) => {
				this.users = res.data
				this.users.forEach((user) => {
					user.이름_아이디 = `${user.이름} [${user.아이디}]`
					user.직위원본 = user.직위
				})				
			})
		},
		getManageLists(id, year, next = ()=>{}) {
			this.$get("/users/lists", {
				id: id,
				year : year,
			}).then((res) => {
				let count = 0
				let data = res.data.reduce((acc, obj) => {
					count += obj.휴가일수
					obj.누적휴가수 = count 
					acc.push(obj)
					return acc
				}, [])
				next(data)
			})			
		}
	},
	created() {		
		if (this.$store.getters.getUser.isManager) this.getUsers()
		this.getLists(true)		
	},
}
</script>
<template>
	<v-app id="inspire">
		<v-navigation-drawer v-model="drawer" app>
			<v-card class="mx-auto" max-width="344" color="#e2efff">
				<img src="../../assets/img/odinue_ci.svg" style="width: 100%; position: relative;">
				<v-card-text style="font-size: 2rem; font-weight: bold;">
					{{ user.name }}
				</v-card-text>

				<v-card-subtitle style="font-size: 1.5rem;font-weight: bold;">
					{{ user.id }}@odinue.net
				</v-card-subtitle>
			</v-card>

			<v-list>
				<v-list-item v-for="link in links" :key="link.type" 
					v-if="link.auth"
					@click="changeComponent(link.type, link.text)"
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
			@getLists="getLists"
			@getUsers="getUsers"
		/>

	</v-app>
</template>

<script>
import calendar from "./components/calendar"
import lists from "./components/lists"
import manage from "./components/manage"
export default {
	components: {
		calendar,
		lists,
		manage
	},
	data() {
		return {
			drawer: null,
			links: [
				{ icon: "mdi-view-list", text: "휴가 리스트", auth: !this.$store.getters.getUser.isManager, type: "lists" },
				{ icon: "mdi-account-wrench-outline", text: "휴가 관리", auth: this.$store.getters.getUser.isManager, type: "manage" },
				{ icon: "mdi-calendar-month", text: "휴가 일정", auth: true, type: "calendar" },
				{ icon: "", text: "", auth: true, type: "1" },
				{ icon: "", text: "", auth: true, type: "2" },
				{ icon: "", text: "", auth: true, type: "3" },
				{ icon: "", text: "", auth: true, type: "4" },
				{ icon: "", text: "", auth: true, type: "5" },
				{ icon: "", text: "", auth: true, type: "6" },
				{ icon: "", text: "", auth: true, type: "7" },
				{ icon: "", text: "", auth: true, type: "8" },
				{ icon: "", text: "", auth: true, type: "9" },
				{ icon: "", text: "", auth: true, type: "10" },
				{ icon: "mdi-logout", text: "로그아웃", auth: true, type: "logout" },
			],
			user: this.$store.getters.getUser,
			selectType: "",
			items: [],
			leaveCnts : {},
			users : [],
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
		getLists(isLoadPage = false) {
			this.$get("/leave/lists", {
				id: this.$store.getters.getUser.id
			}).then((res) => {
				// this.items = 
				this.items = res.data.lists.reduce((acc, obj) => {
					const year = obj.연도
					acc[year] = acc[year] != undefined ? acc[year] : []
					acc[year].push(obj)					
					return acc
				}, {})
				res.data.cnts.forEach((obj) => {
					this.leaveCnts[obj.연도] = {
						연차수 : obj.연차수,
						포상휴가수 : obj.포상휴가수,
						남은연차수 : obj.연차수 - obj.사용연차수,
						남은포상휴가수 : obj.포상휴가수 - obj.사용포상휴가수,
						총휴가수 : obj.연차수 + obj.포상휴가수,
						총남은휴가수 : (obj.연차수 + obj.포상휴가수) - (obj.사용연차수 + obj.사용포상휴가수),
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
			})		
		},
		getUsers() {
			this.$get("/users").then((res) => {
				this.users = res.data
				this.users.forEach((user) => {
					user.이름_아이디 = `${user.이름} [${user.아이디}]`					
				})				
			})			
		}
	},
	created() {		
		this.getUsers()
		this.getLists(true)
		
	},
}
</script>
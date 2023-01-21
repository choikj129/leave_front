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
				<v-list-item v-for="link in links" :key="link.icon" 
					v-if="!link.auth || (link.auth && user.isManager)"
					@click="change(link.type)"
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
			@setLists="setLists"
		/>
		<lists v-else-if="selectType == 'lists'" 
			:items="items" 
			:leave-cnts="leaveCnts"
		/>

	</v-app>
</template>

<script>
import calendar from "./components/calendar"
import lists from "./components/lists"
export default {
	components: {
		calendar,
		lists
	},
	data() {
		return {
			cards: ['Today'],
			drawer: null,
			links: [
				{ icon: "mdi-calendar-check", text: "휴가 일정", auth: false, type: "calendar" },
				{ icon: "mdi-inbox-arrow-down", text: "휴가 리스트", auth: false, type: "lists" },
			],
			user: this.$store.getters.getUser,
			selectType: "lists",
			items: [],
			leaveCnts : {}
		}
	},
	methods: {
		change(type) {
			this.selectType = type
		},
		setLists() {
			this.$get("/leave/lists", {
				id: this.$store.getters.getUser.id
			}).then((res) => {
				// this.items = 
				this.items = res.data.reduce((acc, obj) => {
					const year = obj.연도
					acc[year] = acc[year] != undefined ? acc[year] : []
					acc[year].push(obj)
					this.leaveCnts[year] = this.leaveCnts[year] != undefined ? this.leaveCnts[year] : {
						"연차수" : obj.연차수,
						"포상휴가수" : obj.포상휴가수,
						"총휴가수" : obj.총휴가수,
					}
					return acc
				}, {})
			})		
		},
	},
	created() {
		this.setLists()
	}
}
</script>
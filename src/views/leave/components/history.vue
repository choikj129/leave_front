
<template>
	<div class="main-component" :class="{'mobile-component' : isMobile}">
		<h3 class="mr-10">휴가 기록 (최근 30건)</h3>
		<br>
		<v-data-table
            :headers="headers"
            :items="history"
            :items-per-page="-1"
            hide-default-footer
            class="elevation-1 mt-10 mb-10"
			style="width: 80%;"
        >
        </v-data-table>
	</div>
</template>

<script>
export default {
	name : "history",
	data() {
		return {
			isMobile : this.$store.getters.getUser.isMobile,
			history : [],
			headers: [
				{ text: "이름", sortable: false, value: "이름", width:"250", align:"center"},
				{ text: "아이디", sortable: false, value: "아이디", width:"250", align:"center"},
				{ text: "내용", sortable: false, value: "내용", width:"400", align:"center"},
				{ text: "등록일자", sortable: false, value: "등록일자", width:"300", align:"center"},
			],
		}
	},
	created() {
		this.$get("/leave/history").then((res) => {
			this.history = res.data
		})
	}
}
</script>
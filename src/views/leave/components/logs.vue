
<template>
	<div class="main-component">
		<h3 class="mr-10">휴가 기록 (최근 30건)</h3>
		<br>
		<v-simple-table style="width: 80%;" class="mt-10">
			<template>
				<thead>
					<tr>
						<th class="text-center grid-header">
							이름 [아이디]
						</th> 
						<th class="text-center grid-header">
							내용		
						</th>
						<th class="text-center grid-header">
							등록일자
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="log in logs" :key="log.IDX">
						<td class="grid-body">{{ log.이름 }} [{{ log.아이디 }}]</td>
						<td class="grid-body">{{ log.내용 }}</td>
						<td class="grid-body">{{ log.등록일자 }}</td>
					</tr>
				</tbody>
			</template>
		</v-simple-table>
	</div>
</template>

<script>
export default {
	data() {
		return {
			logs : []
		}
	},
	created() {
		this.$get("/users/logs").then((res) => {
			this.logs = res.data				
		})
	}
}
</script>
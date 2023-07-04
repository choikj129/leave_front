<template>
	<div class="login">
		<img src="../../assets/img/odinue_ci.svg" style="width: 300px; margin-top:3rem;">
		<!-- <div class="f5_mobile posR">휴가 관리</div> -->
		<v-app id="inspire" style="height:0;">
			<!-- Login Component -->
			<v-container style="max-width: 450px">
				<v-layout align-center row wrap>
					<v-flex xs12>
						<v-card>
							<div class="pa-10" style="background-color:#f4f9ff;">
								<h1 style="text-align: center" class="mb-10">휴가 관리</h1>
								<!-- <div>※아이디는 본인의 이메일 앞자리입니다.※</div> -->
								<form>
									<v-text-field label="ID" prepend-inner-icon="mdi-account" v-model="id" @keydown="isEnter"></v-text-field>
									<v-text-field prepend-inner-icon="mdi-lock" type="password" label="Password" v-model="pw" @keydown="isEnter">
									</v-text-field>
									<v-btn color="blue lighten-1" block dark @click="login" class="mb-5">
										로그인
									</v-btn>
									<v-btn color="blue lighten-1" block dark @click="redirectReset" class="mb-3">
										비밀번호 초기화
									</v-btn>
								</form>
							</div>
						</v-card>
					</v-flex>
				</v-layout>
			</v-container>
		</v-app>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      msg: 'HELLO VUE',
      id : "",
      pw : ""
    }
  },
  methods : {
    async login() {
		const resLogin = await this.$post("/login", {
			id: this.id,
			pw: this.pw
		})
		if (resLogin.status) {
			this.$store.commit("setUser", resLogin.data)
			this.$router.push({ path: "leave" })
		} else {
			resLogin.msg ? alert(resLogin.msg) : alert(resLogin.message)
		}

		this.$setHoliday()
		this.$get("/code", {name : "직위", reverse : true}).then(res => {
			this.$store.commit("setPosition", res.data)
		})
	},
	redirectReset() {
		this.$router.push({path : '/reset'})
	},
	isEnter(e) {
		if (e.key == "Enter") this.login()
	}
  }
}
</script>
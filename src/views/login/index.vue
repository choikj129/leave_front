<template>
  <div class="login">
    <img src="../../assets/img/odinue_ci.svg" style="width: 30%; position: relative; top : -3rem;">  
    <div class="f5 posR" style="top : -10rem;">휴가 관리</div>  
    <v-app id="inspire" style="height:0">
			<!-- Login Component -->
			<v-container style="max-width: 450px">
				<v-layout align-center row wrap>
					<v-flex xs12>
						<v-card>
							<div class="pa-10" style="background-color:#f4f9ff;">
								<h1 style="text-align: center" class="mb-10">Login</h1>
								<form>
									<v-text-field label="ID" prepend-inner-icon="mdi-account" v-model="id"></v-text-field>
									<v-text-field prepend-inner-icon="mdi-lock" type="password" label="Password" v-model="pw">
									</v-text-field>
									<v-btn color="blue lighten-1 text-capitalize" depressed large block dark @click="login" class="mb-3">
										Login
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
  components : {
    loginForm
  },
  data () {
    return {
      msg: 'HELLO VUE',
      id : "",
      pw : ""
    }
  },
  methods : {
    login() {		
			this.$post("/login", {
				id: this.id,
				pw: this.pw
			})
				.then((res) => {
					if (res.status) {
						this.$store.commit("setUser", res.data)
						this.$router.push({ path: "leave" })
					} else {
						alert(res.msg)
					}
				})
		}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

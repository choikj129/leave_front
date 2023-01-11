<template>    
  <div class="login-form">
      <div class="form">          
        <cp-input
          placeholder="Username"
          v-model="id"
        >
        </cp-input>
        <cp-input
          type="password"
          placeholder="Password"
          v-model="pw"
        >
        </cp-input>
        <cp-button
          text="로그인"
          @login="login"
          function-name="login"
        >
        </cp-button>
      </div>
  </div>
</template>
  
<script>
  import api from "@/apis/api";
  export default {
    name: "login-form",
    data () {
      return {
        id : "",
        pw : ""
      }
    },
    methods : {
      login() {           
        api.post("/login", {
            id : this.id,
            pw : this.pw
        })
          .then((res) => {            
            if (res.status) {
              this.$store.commit("setUser", res.data)
              this.$router.push({path : "leave"})
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
  .login-form {
      width: 340px;
      margin: 50px auto;
  }
  .login-form .form {
      margin-bottom: 15px;
      /* background: #f7f7f7; */
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
      padding: 30px;
  }
  .login-form h2 {
      margin: 0 0 15px;
  }
</style>
  
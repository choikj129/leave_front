<template>    
  <div class="login-form">
      <div class="form">
          <div class="h3">로그인</div>   
          <div class="form-group">
              <input type="text" class="form-control" placeholder="Username" v-model="id">
          </div>
          <div class="form-group">
              <input type="password" class="form-control" placeholder="Password" v-model="pw">
          </div>
          <div class="form-group">
              <button type="submit" class="btn btn-primary btn-block" @click="login">Log in</button>
          </div>
      </div>
  </div>
</template>
  
<script>
  import axios from "axios";
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
        axios.post("/login", {
            id : this.id,
            pw : this.pw
        })
          .then((res) => {            
            if (res.status) {
              console.log(res.data)
              // window.location.href="/hello"
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
  .form-control, .btn {
      min-height: 38px;
      border-radius: 2px;
  }
  .btn {        
      font-size: 15px;
      font-weight: bold;
  }
</style>
  
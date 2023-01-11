<template>
  <div class="login">
    <img src="../../assets/img/odinue_ci.svg" style="width: 30%; position: relative; top : -3rem;">  
    <div class="f5 posR" style="top : -10rem;">휴가 관리</div>  
    <loginForm
      class="posR"
      style="top : -10rem;"
    />
  </div>
</template>

<script>
import loginForm from "./form"
export default {
  name: 'login',
  components : {
    loginForm
  },
  data () {
    return {
      msg: 'HELLO VUE'
    }
  },
  methods : {  
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

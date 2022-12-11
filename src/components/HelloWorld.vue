<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    
    <button @click="axios">axios</button>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'HELLO VUE'
    }
  },
  methods : {
    axios() {
      const url = "/"
      axios.post(
        url,
        {},
        {
          headers: {
            'content-type': 'application/json;charset=EUC-KR'
        }
      })
        .then((response) => {
            console.log(response)
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

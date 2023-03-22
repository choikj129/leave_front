<template>
    <div id="button">
        <div class="form-group">
            <button class="btn btn-primary btn-block" @click="clickFunction">{{text}}</button>
        </div>
    </div>
</template>

<script>
    export default {
        props : {
            text : {
                type : String,
                default : ""
            },
            functionName : {
                type : String,
                default : ""
            },
        },
        name: 'cp-button',
        data () {
            return {
                // placeholder : "",
            }
        },
        methods : {
            clickFunction() {
                this.$emit(this.functionName)
            }
        }
    }
</script>
  
<style scoped>
    
</style>
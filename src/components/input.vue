<template>
    <div id="input">
        <div class="form-group">
            <input
                :type="type"
                class="form-control"
                :placeholder="placeholder"
                :value="text"
                @input="$emit('input', $event.target.value)"
            >
        </div>
    </div>
</template>

<script>
    export default {
        props : {
            type : {
                type : String,
                default : "text"
            },
            placeholder : {
                type : String,
                default : ""
            },
            text : {
                type : String,
                default : ""
            },
        },
        name: 'cp-input',
        data () {
            return {
                // placeholder : "",
            }
        },
        methods : {
        }
    }
</script>
  
<style scoped>
    
</style>
<template>
    <div class="main-component" style="height:100%" :class="{'mobile-component' : isMobile}">
        <form style="width:1000px;">
            <v-text-field
                v-model="key"
                label="Holiday API 키"
                :rules="rules.key"
                @blur=""
                type="text"
                @keydown="isEnter"
                required
                ></v-text-field>

            <v-btn class="me-4" depressed color="primary black"
                @click="updateAPI"
                :disabled="!key"
            >
                변경
            </v-btn>
        </form>

    </div>
</template>

<script>
export default {
    name: "api_update",
    data() {
        return {
            isMobile : this.$store.getters.getUser.isMobile,
            key: "",
            rules : {
                key : [
                    (value) => {
                        if (value) return true
                        return "API키를 입력해 주세요"
                    },
                ],
            },
        }
    },
	created() {
		this.$get("/api/code").then((res) => {
			this.key = res.data[0].KEY
		})
	},
    methods : {
        updateAPI() {
            if (confirm("API 키를 변경하시겠습니까?")) {
                this.$post("/api/update", {
                    key : this.key
                }).then(res => {
                    if (res.status) {
                        this.$router.push({ path:"/" })
                    }
                })
            }
        },
        isEnter(e) {
            if((this.key) && e.key == "Enter") {
                this.updateAPI()
            }
        }		
    }
}
</script>
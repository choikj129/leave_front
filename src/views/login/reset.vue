<template>
    <div class="login mt-5">
        <form class="mt-5" style="width:400px; margin:auto; margin-top:10%">
            <h1>비밀번호 초기화</h1>
            <v-text-field
                v-model="name"
                label="이름"
                @keydown="isEnter"
                required
            ></v-text-field>
            <v-text-field
                v-model="id"
                label="아이디"
                @keydown="isEnter"
                required
            ></v-text-field>
            <v-btn color="#42A5F5" @click="resetPW" block dark class="me-4">
                초기화
            </v-btn>
            <v-btn color="#42A5F5" @click="undoPage" block dark class="me-4" style="margin-top : 20px">
                취소
            </v-btn>
        </form>
    </div>
</template>

<script>
export default {
    name: "update",
    data() {
        return {
            id: "",
            name: "",
        }
    },
    methods : {
        resetPW() {
            if (confirm("비밀번호를 초기화 하시겠습니까?\n(임시 비밀번호가 카카오워크로 전송됩니다.)")) {
                this.$patch("/login/reset", {
                    id : this.id,
                    name : this.name
                }).then(res => {
                    if (res.msg) alert(res.msg)
                    if (res.status) this.$router.push({path : "/login"})
                })
            }
        },
        undoPage() {
            this.$router.push({path : "/login"})
        },
        isEnter(e) {
            if(this.id && this.name && e.key == "Enter") {
                this.resetPW()
            }
        }
    }
}
</script>
<template>
    <div class="main-component" style="height:100%" :class="{'mobile-component' : isMobile}">
        <form style="width:400px;">
            <v-text-field 
                v-model="$store.getters.getUser.name" 
                label="이름" 
                disabled
            ></v-text-field>
            <v-text-field 
                v-model="$store.getters.getUser.position" 
                label="직위"
                disabled
                ></v-text-field>            
                <v-text-field 
                v-model="pw" 
                label="비밀번호"
                :rules="rules.pw"
                @blur=""
                type="password"
                @keydown="isEnter"
                required
                ></v-text-field>            
                <v-text-field 
                v-model="pwCheck" 
                label="비밀번호 확인"
                :rules="rules.pwCheck"
                type="password"
                @keydown="isEnter"
                required
            ></v-text-field>

            <v-btn class="me-4" depressed color="primary black" 
                @click="updatePW"                
                :disabled="!pw || !pwCheck || pw != pwCheck"
            >
                변경
            </v-btn>
        </form>

    </div>
</template>

<script>
export default {
    props : ["isMobile"],
    name: "update",
    data() {
        return {
            pw: "",
            pwCheck: "",            
            rules : {
                pw : [
                    (value) => {
                        if (value) return true
                        return "비밀번호를 입력하세요."
                    },
                ],
                pwCheck : [
                    (value) => {
                        if (value) return true
                        return "비밀번호를 한 번 더 입력하세요."
                    },
                    (value) => {
                        if (this.pw == this.pwCheck) return true
                        return "비밀번호가 일치하지 않습니다."
                    },
                ]
            },
        }
    },
    methods : {
        updatePW() {
            if (confirm("비밀번호를 변경하시겠습니까? \n(변경 후 로그아웃됩니다.)")) {
                this.$post("/login/update", {
                    id : this.$store.getters.getUser.id,
                    pw : this.pw
                }).then(res => {
                    if (res.status) {
                        this.$router.push({ path:"/logout" })
                    }
                })
            }
        },
        isEnter(e) {
            if((this.pw || this.pwCheck || this.pw == this.pwCheck) && e.key == "Enter") {
                this.updatePW()
            }
        }
    }
}
</script>
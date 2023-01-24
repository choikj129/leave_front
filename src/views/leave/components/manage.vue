<template>
    <div class="text-center" style="margin-left:10rem;">
        <v-dialog
            v-model="dialog"
            width="500"
        >
            <template v-slot:activator="{ on, attrs }">                
                <div>
                    <h3>
                        {{userInfo.year}} 년 휴가 관리
                    </h3>
                    <v-container class="grey lighten-5 mb-6" style="margin-top : 5rem; ">
                        <v-row :align="'start'" no-gutters style="height: 50px;">
                            <v-col>
                                <v-card class="pa-2 grid-header"  outlined tile>
                                    이름 (아이디)
                                </v-card>
                            </v-col>
                            <v-col>
                                <v-card class="pa-2 grid-header"  outlined tile>
                                    연차
                                </v-card>
                            </v-col>
                            <v-col>
                                <v-card class="pa-2 grid-header"  outlined tile>                
                                    포상휴가
                                </v-card>
                            </v-col>
                        </v-row>
                        <v-hover v-for="user in users" :key="user.아이디">
                            <template v-slot:default="{ hover }">
                                <v-card v-bind="attrs" v-on="on" @click="targetInfo(user)"
                                    :elevation="hover ? 15 : 3"
                                    class="mx-auto"
                                >
                                    <v-row :align="'start'" no-gutters style="height: 40px; cursor: pointer;">
                                        <v-col>
                                            <v-card class="pa-2" :class="{'col-hover':hover}" tile>
                                                {{ user.이름 }} ({{ user.아이디 }})
                                            </v-card>
                                        </v-col>
                                        <v-col>
                                            <v-card class="pa-2" :class="{'col-hover':hover}" tile>
                                                {{ user.연차수 == null ? "연차 설정이 필요합니다." : user.연차수 }}
                                            </v-card>
                                        </v-col>
                                        <v-col>
                                            <v-card class="pa-2" :class="{'col-hover':hover}" tile>
                                                {{ user.포상휴가수 }}
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </template>
                        </v-hover>
                    </v-container>
                </div>
            </template>
            <v-card>
                <v-card-title class="text-h5 grey lighten-2">
                    {{ userInfo.name }} ({{ userInfo.id }})
                </v-card-title>
                
                
                <v-form >
                    <v-container style="width:100%">
                        <v-row>
                            <v-col cols="1" sm="6">
                                <v-text-field @keydown="keydown" v-model="userInfo.annual" label="연차" outlined></v-text-field>
                            </v-col>
                
                            <v-col cols="1" sm="6">
                                <v-text-field @keydown="keydown" v-model="userInfo.reward" label="포상휴가" outlined></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="update"
                    >
                        수정
                    </v-btn>
                </v-card-actions>
            </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
    props : ["users"],
    data: () => ({
        userInfo : {
            name : "",
            id : "",
            annual : "",
            reward : "",
            year : new Date().getFullYear()
        },
        dialog: false,
    }),
    methods : {
        targetInfo(user) {
            this.userInfo = {
                name : user.이름,
                id : user.아이디,
                annual : user.연차수 == null ? 0 : user.연차수,
                reward : user.포상휴가수,
                year : this.userInfo.year
            }
        },
        update() {
            this.$post("/users", {userInfo : this.userInfo}).then((res) =>{
                if (res.status) {
                    this.$emit("getUsers")   
                    this.$emit("getLists")   
                }
            })
            this.dialog = false
        },
        keydown(e) {
            if(!/[\d]|Backspace|Delete|NumLock/.test(e.key)) {
                e.returnValue = false
            }
        }
    },
    mounted() {
    }
}
</script>
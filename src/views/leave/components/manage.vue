<template>
    <div class="text-center main-component">
        <v-dialog
            v-model="dialog"
            width="500"
        >
            <template v-slot:activator="{ on, attrs }">                
                <div style="width: 100%;">
                    <div class="mt-3 mr-16">
                        <v-btn fab text small color="grey darken-2" @click="changeYear(-1)">
                            <v-icon>
                                mdi-chevron-left
                            </v-icon>
                        </v-btn>
                        <h3 class="di mt-3">
                            {{userInfo.year}} 년 휴가 관리
                        </h3>
                        <v-btn fab text small color="grey darken-2" @click="changeYear(1)">
                            <v-icon>
                                mdi-chevron-right
                            </v-icon>
                        </v-btn>                        
                        <v-btn depressed color="primary" style="position:absolute; right:15%;" @click="excelDown()">
                            엑셀다운로드
                        </v-btn>
                    </div>
                    <v-simple-table style="width: 75%; margin:auto; margin-top: 20px; margin-bottom:50px;">
                        <template>
                            <thead>
                                <tr>
                                    <th class="text-center grid-header">
                                        이름 [아이디]
                                    </th>
                                    <th class="text-center grid-header">
                                        사용연차/연차
                                    </th>
                                    <th class="text-center grid-header">
                                        사용포상휴가/포상휴가
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <v-hover v-for="user in users" :key="user.아이디">
                                    <template v-slot:default="{ hover }">
                                        <tr v-bind="attrs" v-on="on" @click="targetInfo(user)">
                                            <td class="grid-body">{{ user.이름 }} [{{ user.아이디 }}]</td>
                                            <td class="grid-body">{{ user.사용연차수 }} / {{ user.연차수 == null ? "연차 설정이 필요합니다." : user.연차수 }}</td>
                                            <td class="grid-body">{{ user.사용포상휴가수 }} / {{ user.포상휴가수 }}</td>
                                        </tr>
                                    </template>
                                </v-hover>
                            </tbody>
                        </template>
                    </v-simple-table>
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
import excel from "@/apis/excel"
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
        targetDate : new Date()
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
                    this.$emit("getUsers", this.userInfo.year)   
                    this.$emit("getLists")
                }
            })
            this.dialog = false
        },
        keydown(e) {
            if(!/[\d]|Backspace|Delete|NumLock/.test(e.key)) {
                e.returnValue = false
            }
        },
        changeYear(d) {
            this.targetDate = new Date(this.targetDate.getFullYear() + d, 0, 1)
            this.userInfo.year = this.targetDate.getFullYear()
            this.$emit("getUsers", this.userInfo.year)
        },
        excelDown() {
            let excelUsers = []
            this.users.forEach(user => {
                excelUsers.push({
                    이름 : user.이름,
                    아이디 : user.아이디,
                    연차수 : user.연차수,
                    사용연차수 : user.사용연차수,
                    포상휴가수 : user.포상휴가수,
                    사용포상휴가수 : user.사용포상휴가수                    
                })
            })
            excel.excelDownload(excelUsers, `${this.userInfo.year}년_직원_휴가`, `${this.userInfo.year}년 휴가`)
        }
    },
    mounted() {
    }
}
</script>
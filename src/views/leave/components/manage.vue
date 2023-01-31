<template>
    <div class="text-center main-component">        
        <v-dialog
            v-model="dialog"            
            width="400"
            @click:outside="close"
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
                            {{userInfo.연도}} 년 휴가 관리
                        </h3>
                        <v-btn fab text small color="grey darken-2" @click="changeYear(1)">
                            <v-icon>
                                mdi-chevron-right
                            </v-icon>
                        </v-btn>                        
                        <v-btn depressed color="success" style="position:absolute; right:20%;" @click="excelDown">
                            엑셀다운로드
                        </v-btn>
                        <v-btn depressed color="primary" style="position:absolute; right:15%;" @click="showInsert">
                            직원추가
                        </v-btn>
                    </div>
                    <div class="mt-2">
                        ※이름 클릭시 해당 직원의 휴가 리스트가 나오고, 휴가 클릭시 설정이 나옵니다.※
                    </div>
                    <v-simple-table style="width: 75%; margin:auto; margin-top: 20px; margin-bottom:50px;">
                        <template>
                            <thead>
                                <tr>
                                    <th class="text-center grid-header">
                                        이름 [아이디]
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
                                        직위
                                    </th>
                                    <th class="text-center grid-header">
                                        사용휴가
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
                                        휴가
                                    </th>
                                    <th class="text-center grid-header">
                                        삭제
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <v-hover v-for="user in users" :key="user.아이디">
                                    <template v-slot:default="{ hover }">
                                        <tr v-bind="attrs">
                                            <td v-on="on" @click="targetInfo(user, true)" class="grid-body">
                                                {{ user.이름 }} [{{ user.아이디 }}]
                                            </td>
                                            <td v-on="on" @click="targetInfo(user, true)" class="grid-body grid-right-line">
                                                {{ user.직위}}
                                            </td>
                                            <td v-on="on" @click="targetInfo(user, false)" class="grid-body">
                                                {{ user.사용휴가수 }}
                                            </td>
                                            <td v-on="on" @click="targetInfo(user, false)" class="grid-body grid-right-line">
                                                {{ user.휴가수 == null ? "휴가 설정이 필요합니다." : user.휴가수 }}
                                            </td>
                                            <td @click="" class="grid-body">
                                                <v-btn depressed dark color="red lighten-1" @click="deleteUser(user)">
                                                    삭제
                                                </v-btn>
                                            </td>
                                        </tr>
                                    </template>
                                </v-hover>
                            </tbody>
                        </template>
                    </v-simple-table>
                </div>
            </template>
            <v-data-table v-if="isLists"
                :headers="headers"
                :items="items"
                hide-default-footer
                :loading="isLoading"
                loading-text="Loading... Please wait"
                class="elevation-1"
            >
                <template v-slot:item.휴가구분="{ item }">
                    <v-chip
                        :color="getColor(item.휴가구분)"
                        dark
                    >
                        {{ item.휴가구분 }}
                    </v-chip>
                </template>
            </v-data-table>
            <div v-else>
                <v-card v-if="dialogType=='update'">
                    <v-card-title class="text-h5 grey lighten-2">
                        {{ userInfo.이름 }} ({{ userInfo.아이디 }})
                    </v-card-title>
                    
                    
                    <v-form >
                        <v-container style="width:100%">
                            <v-text-field v-model="userInfo.이름" label="이름" disabled outlined></v-text-field>
                            <v-text-field v-model="userInfo.직위" label="직위" outlined></v-text-field>
                            <v-text-field @keydown="keydown" v-model="userInfo.휴가수" label="휴가" outlined></v-text-field>
                        </v-container>
                    </v-form>
    
                    <v-card-actions>
                        <v-btn color="primary" text @click="close">닫기</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="update">수정</v-btn>
                    </v-card-actions>
                </v-card>
                <v-card v-else-if="dialogType=='insert'">
                    <v-card-title class="text-h5 grey lighten-2">
                        직원 추가
                    </v-card-title>                    
                    <v-form >
                        <v-container style="width:100%">
                            <v-text-field v-model="insertUserInfo.이름" label="이름" outlined></v-text-field>
                            <v-text-field v-model="insertUserInfo.직위" label="직위" outlined></v-text-field>
                            <v-text-field v-model="insertUserInfo.아이디" label="아이디" outlined></v-text-field>
                        </v-container>
                    </v-form>
    
                    <v-card-actions>
                        <v-btn color="primary" text @click="close">닫기</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="insertUser">등록</v-btn>
                    </v-card-actions>
                </v-card>
                

            </div>
        </v-dialog>
    </div>
</template>

<script>
import excel from "@/apis/excel"
export default {
    props : ["users", ],
    data: () => ({
        userInfo : {
            연도 : new Date().getFullYear()
        },
        insertUserInfo : {
            이름 : "",
            직위 : "",
            아이디 : "",
        },
        items : [],
        dialog: false,
        dialogType : "",
        targetDate : new Date(),
        isLists : false,
        isLoading : false,
        headers: [
            { text: '휴가일', sortable: false, value: '휴가일', width:"140", align:"center"},
            { text: '휴가 구분', sortable: false, value: '휴가구분', width:"140", align:"center"},
            { text: '누적 휴가 수', sortable: false, value: '누적휴가수', width:"120", align:"center"},          
        ],
        colors: {
            "휴가" : "blue", 
            "오전 반차" : "cyan",
            "오후 반차" : "cyan", 
            "기타 휴가" : "green",
        },
    }),
    methods : {
        targetInfo(user, type) {
            this.items = []
            this.isLoading = true
            user.연도 = this.userInfo.연도
            this.userInfo = user
            this.isLists = type
            if (!type) this.dialogType = "update"
            this.$emit("getManageLists", this.userInfo.아이디, this.userInfo.연도, (data) => {
                this.items = data
                this.isLoading = false
            })
        },
        update() {
            console.log(this.userInfo)
            if (this.userInfo.휴가수 == null) {
                alert("휴가를 설정해주십시오.")
                return
            }
            const position = this.userInfo.직위 == this.userInfo.직위원본 ? null : this.userInfo.직위
            this.$post("/users/update", {
                userInfo : {
                    id : this.userInfo.아이디,
                    year : this.userInfo.연도,
                    cnt : this.userInfo.휴가수,
                    position : position,
                }
            }).then((res) =>{
                if (res.status) {
                    this.$emit("getUsers", this.userInfo.연도)   
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
            this.userInfo.연도 = this.targetDate.getFullYear()
            this.$emit("getUsers", this.userInfo.연도)
        },
        excelDown() {
            let excelUsers = []
            this.users.forEach(user => {
                excelUsers.push({
                    이름 : user.이름,
                    직위 : user.직위,
                    휴가수 : user.휴가수,
                    사용휴가수 : user.사용휴가수,
                    이메일 : `${user.아이디}@odinue.net`,
                })
            })
            excel.excelDownload(excelUsers, `${this.userInfo.연도}년_직원_휴가`, `${this.userInfo.연도}년 휴가`)
        },
        showInsert() {
            this.dialog = true
            this.dialogType='insert'
            this.insertUserInfo = {
                이름 : "",
                직위 : "",
                아이디 : "",
            }

        },
        insertUser() {
            this.dialog = false
            this.$post("/users/insert", {
                name : this.insertUserInfo.이름,
                id : this.insertUserInfo.이름,
                position : this.insertUserInfo.이름,
            }).then((res) => {
                this.$emit("getUsers", this.userInfo.연도)
            })
        },
        deleteUser(user) {
            this.dialog = false
            if (confirm(`${user.이름} ${user.직위}님을 삭제하시겠습니까?`)) {
                this.$get("/users/delete", {
                    id : user.아이디
                }).then((res) => {
                    this.$emit("getUsers", this.userInfo.연도)
                })
            }
        },
        close() {
            this.dialog = false
            this.userInfo.직위 = this.userInfo.직위원본
        },
        getColor(type) {
            return this.colors[type]
        }
    },
    mounted() {
    }
}
</script>
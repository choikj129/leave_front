<template>
    <div class="text-center main-component" :class="{'mobile-component' : isMobile}">
        <!-- 모달 팝업 기본 태그 -->
        <v-dialog
            v-model="dialog"
            width="400"
            @click:outside="close"
        >
        <!-- v-slot on : 모달 오픈 -->
        <template v-slot:activator="{ on, attrs }">
            <!-- 상단 버튼 및 정보 -->
            <div style="width: 100%;">
                    <div class="mt-3" :class="{'mr-16' : !isMobile}">
                        <v-btn outlined fab text small color="grey darken-2" @click="changeYear(-1)">
                            <v-icon>
                                mdi-chevron-left
                            </v-icon>
                        </v-btn>
                        <h3 class="di mt-3">
                            {{userInfo.연도}} 년 휴가 관리
                        </h3>
                        <v-btn outlined fab text small color="grey darken-2" @click="changeYear(1)">
                            <v-icon>
                                mdi-chevron-right
                            </v-icon>
                        </v-btn>
                        <span :class="{'manage-buttons' : !isMobile, 'block' : isMobile}">
                            <v-btn depressed color="success" @click="excelDown">
                                엑셀다운로드
                            </v-btn>
                            <v-btn depressed color="primary" @click="showInsert" class="ml-3">
                                직원추가
                            </v-btn>
                        </span>
                    </div>

                    <!-- 테이블 -->
                    <v-simple-table style="width: 85%; margin:auto; margin-top: 20px; margin-bottom:50px;">
                        <template>
                            <thead>
                                <tr>
                                    <th class="text-center grid-header">
                                        이름
                                    </th>
                                    <th class="text-center grid-header">
                                        직위
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
                                        아이디
                                    </th>
                                    <th class="text-center grid-header">
                                        사용연차
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
                                        연차
                                    </th>
                                    <th class="text-center grid-header">
                                        사용추가휴가
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
                                        추가휴가
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
                                        기타휴가
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
                                        입사일 (년차)
                                    </th>
                                    <th class="text-center grid-header">
                                        비고
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <v-hover v-for="user in users" :key="user.아이디">
                                    <template v-slot:default="{ hover }">
                                        <tr v-bind="attrs" v-on="on" @click="showUpdate(user)">
                                            <td class="grid-body">
                                                {{ user.이름 }}
                                            </td>
                                            <td class="grid-body">
                                                {{ user.직위 }}
                                            </td>
                                            <td class="grid-body grid-right-line">
                                                {{ user.아이디 }}
                                            </td>
                                            <td class="grid-body">
                                                {{ user.사용휴가수 }}
                                            </td>
                                            <td class="grid-body grid-right-line">
                                                {{ !user.휴가수 ? "휴가 설정이 필요합니다." : user.휴가수 }}
                                            </td>
                                            <td class="grid-body">
                                                {{ user.사용추가휴가수 }}
                                            </td>
                                            <td class="grid-body grid-right-line">
                                                {{ user.추가휴가수 }}
                                            </td>
                                            <td class="grid-body grid-right-line">
                                                {{ user.기타휴가수 }}
                                            </td>
                                            <td class="grid-body grid-right-line">
                                                {{ user.입사일
                                                    ? `${user.입사일.replace(/([\d]{4})([\d]{2})([\d]{2})/g, "$1년 $2월 $3일")} (${user.입사년차})`
                                                    : null
                                                }}
                                            </td>
                                            <td class="grid-body" style="padding : 0">
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
           
            <div>
                <!-- 직원 정보 수정 모달 -->
                <v-card v-if="dialogType =='update'">
                    <v-card-title class="text-h5 grey lighten-2">
                        {{ userInfo.이름 }} ({{ userInfo.아이디 }})
                    </v-card-title>
                    
                    <v-form >
                        <v-container style="width:100%">
                            <v-text-field v-model="userInfo.이름" label="이름" disabled outlined></v-text-field>
                            <v-text-field v-model="userInfo.아이디" label="아이디" disabled outlined></v-text-field>
                            <v-select
                                :items="positions"
                                label="직위"
                                item-text="표시내용"
                                item-value="코드명"
                                v-model="userInfo.직위코드"
                                class="vSelect required"
                                outlined
                            ></v-select>
                            <v-text-field v-model="userInfo.입사일" label="입사일 (YYYYMMDD)" counter="8" outlined></v-text-field>
                        </v-container>
                    </v-form>
    
                    <v-card-actions>
                        <v-btn color="primary" text @click="close">닫기</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="updateUser">수정</v-btn>
                    </v-card-actions>
                </v-card>

                <!-- 직원 추가 모달 -->
                <v-card v-else-if="dialogType =='insert'">
                    <v-card-title class="text-h5 grey lighten-2">
                        직원 추가
                    </v-card-title>
                    <v-form >
                        <v-container style="width:100%">
                            <v-text-field v-model="insertUserInfo.이름" label="이름" class="required" outlined></v-text-field>
                            <v-select
                                :items="positions"
                                label="직위"
                                item-text="표시내용"
                                item-value="코드명"
                                v-model="insertUserInfo.직위코드"
                                class="vSelect required"
                                outlined
                            ></v-select>
                            <v-text-field v-model="insertUserInfo.아이디" label="아이디" class="required" outlined></v-text-field>
                            <v-text-field v-model="insertUserInfo.입사일" label="입사일 (YYYYMMDD)" counter="8" outlined></v-text-field>
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
    props : ["users"],
    name : "manage",
    data() {
		return {
            isMobile : this.$store.getters.getUser.isMobile,
            userInfo : {
                연도 : new Date().getFullYear(),
            },
            insertUserInfo : {
                이름 : "",
                아이디 : "",
                직위코드 : "",
                입사일 : "",
            },
            items : [],
            dialog: false,
            dialogType : "",
            targetDate : new Date(),
            positions : this.$store.getters.getPosition
        }
    },
    methods : {
        showUpdate(user) {
            this.items = []
            user.연도 = this.userInfo.연도
            this.userInfo = user
            this.dialogType = "update"
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
                    추가휴가수 : user.추가휴가수,
                    사용추가휴가수 : user.사용추가휴가수,
                    기타휴가수 : user.기타휴가수,
                    입사일 : user.입사일 ? user.입사일.replace(/([\d]{4})([\d]{2})([\d]{2})/g, "$1-$2-$3") : null,
                    이메일 : `${user.아이디}@odinue.net`,
                })
            })
            /* 컬럼 가로 길이 설정 */
            const colOpt = [
                {wch : 10},
                {wch : 10},
                {wch : 10},
                {wch : 10},
                {wch : 10},
                {wch : 15},
                {wch : 10},
                {wch : 15},
                {wch : 30},
            ]
            excel.excelDownload(excelUsers, `${this.userInfo.연도}년_직원_휴가`, `${this.userInfo.연도}년 휴가`, {"!cols" : colOpt})
        },
        showInsert() {
            this.dialog = true
            this.dialogType='insert'
            this.insertUserInfo = {
                이름 : "",
                직위코드 : "",
                아이디 : "",
                입사일 : "",
            }
        },
        updateUser() {
            if (this.userInfo.입사일) {
                if (this.userInfo.입사일 && this.userInfo.입사일.length != 8) {
                    alert(`입사일은 8자로 입력해주십시오. \n (예 : 20020202})`)
                    return
                }
                if (!this.dateValidation(this.userInfo.입사일)) {
                    alert(`${this.userInfo.입사일}일은 유효하지 않은 날짜 입니다.`)
                    return
                }
            }
            this.$patch("/users", {
                userInfo : {
                    id : this.userInfo.아이디,
                    year : this.userInfo.연도,
                    position : this.userInfo.직위코드,
                    date : this.userInfo.입사일,
                }
            }).then((res) =>{
                if (res.status) {
                    this.$emit("getUsers", this.userInfo.연도)
                }
                this.dialog = false
            })
        },
        insertUser() {
            if (!this.insertUserInfo.이름) {
                alert("이름을 입력해주십시오.")
                return
            }
            if (!this.insertUserInfo.직위코드) {
                alert("직위를 입력해주십시오.")
                return
            }
            if (!this.insertUserInfo.아이디) {
                alert("아이디를 입력해주십시오.")
                return
            }
            if (this.insertUserInfo.입사일) {
                if (this.insertUserInfo.입사일.length != 8) {
                    alert(`입사일은 8자로 입력해주십시오. \n (예 : 20020202})`)
                    return
                }
                if (!this.dateValidation(this.insertUserInfo.입사일)) {
                    alert(`${this.insertUserInfo.입사일}일은 유효하지 않은 날짜 입니다.`)
                    return
                }

            }
            this.$put("/users", {
                name : this.insertUserInfo.이름,
                id : this.insertUserInfo.아이디,
                position : this.insertUserInfo.직위코드,
                date : this.insertUserInfo.입사일,
            }).then((res) => {
                if (!res.status) {
                    alert(res.msg)
                } else {
                    this.$emit("getUsers", this.userInfo.연도, true)
                    this.dialog = false
                }
            })
        },
        deleteUser(user) {
            setTimeout(() => {
                this.close()
            }, 1)
            if (confirm(`${user.이름} ${user.직위}님을 삭제하시겠습니까?`)) {
                this.$del("/users", {
                    id : user.아이디
                }).then((res) => {
                    this.$emit("getUsers", this.userInfo.연도, true)
                    this.close()
                })
            }
        },
        close() {
            this.dialogType = ""
            this.dialog = false
            this.userInfo.직위코드 = this.userInfo.직위코드원본
            this.userInfo.입사일 = this.userInfo.입사일원본
        },
        dateValidation(date) {
            const isDate = new Date(`${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}`)
            return isNaN(isDate) ? false : true
        },
    },
}
</script>
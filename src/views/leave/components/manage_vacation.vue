<template>
    <div class="text-center main-component" :class="{'mobile-component' : isMobile}">
        <!-- 모달 팝업 기본 태그 -->
        <v-dialog
            v-model="dialog"
            :width="dialogWidth"
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
                                        사용포상휴가
                                    </th>
                                    <th class="text-center grid-header">
                                        포상휴가
                                    </th>
                                    <th class="text-center grid-header">
                                        사용리프레시휴가
                                    </th>
                                    <th class="text-center grid-header">
                                        리프레시휴가
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
                                        기타휴가
                                    </th>
                                    <th class="text-center grid-header" >
                                        비고
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in users" :key="user.아이디" v-on="on" @click="showList(user.아이디)">
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
                                        {{ user.사용포상휴가수 }}
                                    </td>
                                    <td class="grid-body">
                                        {{ user.포상휴가수 }}
                                    </td>
                                    <td class="grid-body">
                                        {{ user.사용리프레시휴가수 }}
                                    </td>
                                    <td class="grid-body">
                                        {{ user.리프레시휴가수 }}
                                    </td>
                                    <td class="grid-body grid-right-line">
                                        {{ user.기타휴가수 }}
                                    </td>
                                    <td class="grid-body" style="padding : 0">
                                        <v-btn depressed dark color="blue lighten-1" v-on="on" @click="showVacation(user)">
                                            연차
                                        </v-btn>
                                        <v-btn depressed dark color="blue lighten-1" v-on="on" @click="showReward(user)">
                                            추가휴가
                                        </v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </div>
            </template>
            
            <div>
                <!-- 연차 수정 모달 -->
                <v-card v-if="dialogType =='update'">
                    <v-card-title class="text-h5 grey lighten-2 bold">
                        {{ userInfo.이름 }} ({{ userInfo.아이디 }})
                    </v-card-title>
                    
                    <v-form >
                        <v-container style="width:100%">
                            <v-text-field v-model="userInfo.이름" label="이름" outlined disabled></v-text-field>
                            <v-text-field v-model="userInfo.아이디" label="아이디" outlined disabled></v-text-field>
                            <v-text-field
                                v-model="userInfo.휴가수"
                                label="휴가"
                                class="required"
                                outlined>
                            </v-text-field>
                        </v-container>
                    </v-form>
                    
                    <v-card-actions>
                        <v-btn color="primary" text @click="close">닫기</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="updateUser">수정</v-btn>
                    </v-card-actions>
                </v-card>

                <!-- 포상/리프레시 추가 모달 -->
                <v-card v-else-if="dialogType =='reward'">
                    <v-card-title class="text-h5 grey lighten-2 bold">
                        추가 휴가 등록
                    </v-card-title>
                    <v-form >
                        <v-container style="width:100%">
                            <v-text-field v-model="rewardUserInfo.이름" label="이름" outlined disabled></v-text-field>
                            <v-text-field v-model="rewardUserInfo.아이디" label="아이디" outlined disabled></v-text-field>
                            <v-text-field v-model="userInfo.연도" label="기준연도" outlined disabled></v-text-field>
                            <v-select
                                :items="vacationList"
                                label="휴가 유형"
                                item-text="표시내용"
                                item-value="유형"
                                v-model="rewardUserInfo.유형"
                                class="vSelect required"
                                outlined
                            ></v-select>
                            <v-text-field v-model="rewardUserInfo.휴가일수" label="휴가일수" class="required" outlined></v-text-field>
                            <v-text-field v-model="rewardUserInfo.등록일" label="등록일 (YYYYMMDD)" class="required" counter="8" :rules="dateRule" outlined></v-text-field>
                        </v-container>
                    </v-form>

                    <v-card-actions>
                        <v-btn color="primary" text @click="close">닫기</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="insertReward">등록</v-btn>
                    </v-card-actions>
                </v-card>
                <v-card v-else-if="dialogType =='list'">
                    <reward_list
                        :id="userInfo.아이디"
                        :year="userInfo.연도"
                        :isDelete="true"
                    />
                </v-card>
            </div>
        </v-dialog>
    </div>
</template>

<script>
import reward_list from "./include/reward_list.vue"
export default {
    components : {
        reward_list,
    },
    props : ["users", "positions"],
    name : "manage",
    data() {
        return {
            isMobile : this.$store.getters.getUser.isMobile,
            userInfo : {
                연도 : new Date().getFullYear()
            },
            insertUserInfo : {
                이름 : "",
                아이디 : "",
                직위코드 : "",
                입사일 : "",
            },
            rewardUserInfo : {
                이름 : "",
                표시내용 : "",
                아이디 : "",
                유형 : "",
                휴가일수 : "",
                등록일 : "",
            },
            dialog: false,
            dialogType : "",
            dialogWidth : "400",
            isLoading : false,
            targetDate : new Date(),
            dateRule : [v => v.length <= 8 || '등록일은 8자 (YYYYMMDD)로 입력하세요'],
            vacationList : [
                {
                    표시내용 : "포상 휴가",
                    유형 : "포상",
                },
                {
                    표시내용 : "리프레시 휴가",
                    유형 : "리프레시",
                },
            ],
        }
    },
    methods : {
        clickRows() {
            setTimeout(()=>{
                this.dialog=false
            },0.1)
        },
        showVacation(user) {
            this.items = []
            user.연도 = this.userInfo.연도
            this.userInfo = user
            this.dialogType = "update"
            this.dialogWidth = "400"
        },
        showReward(user) {
            this.dialogType = "reward"
            this.dialogWidth = "400"
            this.rewardUserInfo = {
                이름 : user.이름,
                아이디 : user.아이디,
                유형 : "포상",
                휴가일수 : "",
                등록일 : ""
            }
        },
        showList(id) {
            this.dialogType = "list"
            this.dialogWidth = "800"
            this.userInfo.아이디 = id
        },
        changeYear(d) {
            this.targetDate = new Date(this.targetDate.getFullYear() + d, 0, 1)
            this.userInfo.연도 = this.targetDate.getFullYear()
            this.$emit("getUsers", this.userInfo.연도)
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
            if (!this.userInfo.휴가수) {
                alert("휴가를 설정해주십시오.")
                return
            }
            if (!/^[\d]+(\.5)?$/g.test(this.userInfo.휴가수)) {
                alert("휴가는 정수, 실수(소수점은 .5)만 입력 가능합니다. (예 : 0.5, 4.5, 15)")
                return
            }
            this.$patch("/leave/cnt", {
                id : this.userInfo.아이디,
                year : this.userInfo.연도,
                cnt : this.userInfo.휴가수
            }).then((res) =>{
                if (res.status) {
                    this.$emit("getUsers", this.userInfo.연도)
                }
                this.close()
            })
        },
        insertReward() {
            if (!this.rewardUserInfo.휴가일수) {
                alert("휴가일수를 입력해주십시오.")
                return
            }
            if (/[\D]+/g.test(this.rewardUserInfo.휴가일수)) {
                alert("휴가는 숫자만 입력 가능합니다.")
                return
            }
            if (this.rewardUserInfo.등록일 && this.rewardUserInfo.등록일.length != 8) {
                alert(`등록일은 8자로 입력해주십시오. \n (예 : 20020202})`)
                return
            }
            if (!this.dateValidation(this.rewardUserInfo.등록일)) {
                alert(`${this.rewardUserInfo.등록일}일은 유효하지 않은 날짜 입니다.`)
                return
            }
            this.$put("/reward", {
                id : this.rewardUserInfo.아이디,
                type : this.rewardUserInfo.유형,
                cnt : this.rewardUserInfo.휴가일수,
                date : this.rewardUserInfo.등록일,
                year : this.userInfo.연도,
            }).then(res => {
                this.$emit("getUsers", this.userInfo.연도, true)
                this.close()
            })
        },
        deleteReward(item) {
            if (confirm(`${item.이름} ${item.직위}의 ${item.휴가유형} 휴가 ${item.휴가일수}일을 삭제하시겠습니까?`)) {
                this.$del("/reward", {
                    idx : item.IDX
                }).then(res => {
                    if (!res.status) {
                        alert(res.msg)
                    }
                    this.close()
                    this.$emit("getUsers", this.userInfo.연도, true)
                })
            }
        },
        close() {
            this.dialogType = ""
            this.dialog = false
            this.userInfo.휴가수 = this.userInfo.휴가수원본
        },
        dateValidation(date) {
            const isDate = new Date(`${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}`)
            return isNaN(isDate) ? false : true
        },
    },
}
</script>
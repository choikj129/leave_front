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
                        <span :class="{'manage-buttons' : !isMobile, 'block' : isMobile}">
                            <v-btn depressed color="success" @click="showExcelUpload" class="ml-3">
                                엑셀휴가추가
                            </v-btn>
                            <v-btn depressed color="primary" @click="carryLastYear" class="ml-3">
                                작년휴가이월
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
                                        연차 (이월)
                                    </th>
                                    <th class="text-center grid-header">
                                        사용포상휴가
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
                                        포상휴가
                                    </th>
                                    <th class="text-center grid-header">
                                        사용리프레시휴가
                                    </th>
                                    <th class="text-center grid-header grid-right-line">
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
                                        {{ !user.휴가수 ? "" : user.휴가수 }} ({{ !user.이월휴가수 ? "0" : user.이월휴가수 }})
                                    </td>
                                    <td class="grid-body">
                                        {{ user.포상휴가수 ? user.사용포상휴가수 : "" }}
                                    </td>
                                    <td class="grid-body grid-right-line">
                                        {{ user.포상휴가수 ? user.포상휴가수 : "" }}
                                    </td>
                                    <td class="grid-body">
                                        {{ user.리프레시휴가수 ? user.사용리프레시휴가수 : "" }}
                                    </td>
                                    <td class="grid-body grid-right-line">
                                        {{ user.리프레시휴가수 ? user.리프레시휴가수 : "" }}
                                    </td>
                                    <td class="grid-body grid-right-line">
                                        {{ user.기타휴가수 ? user.기타휴가수 : "" }}
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
                            <v-checkbox v-model="isIncludeCarry" label="이월 휴가 포함 여부"></v-checkbox>
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
                        @deleteData="deleteReward"
                    />
                </v-card>
                <!-- 엑셀 직원 추가 모달 -->
                <v-card v-else-if="dialogType =='excelUpload'">
                    <v-card-title class="text-h5 grey lighten-2">
                        파일 업로드
                        <v-spacer></v-spacer>
                        <v-btn @click="excelDown"> 샘플 다운로드 </v-btn>
                    </v-card-title>
                    <v-file-input v-model="excelUploader" :accept="fileAccept" show-size label="File input" style="width:95%;" @change="readExcelFile"></v-file-input>
                    <!-- <input type="file" ref="excelUploader" @change="readExcelFile" style="width:100%"/> -->
    
                    <v-card-actions>
                        <v-btn color="primary" text @click="close">닫기</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="insertExcelUsers">등록</v-btn>
                    </v-card-actions>
                </v-card>
            </div>
        </v-dialog>
    </div>
</template>

<script>
import reward_list from "./include/reward_list.vue"
import excel from "@/apis/excel"
export default {
    components : {
        reward_list,
    },
    props : ["users"],
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
            positions : this.$store.getters.getPosition,
            positionHash : this.$store.getters.getPositionHash,
            usersInfoJsonByExcel : [],
            excelUploader : null,
            fileAccept : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
            isIncludeCarry : false
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
            this.isIncludeCarry = !user.이월휴가수 || user.이월휴가수 == 0 ? false : true
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
        showExcelUpload() {
            this.dialog = true
            this.dialogType='excelUpload'
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
                cnt : this.userInfo.휴가수,
                isIncludeCarry : this.isIncludeCarry,
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
            if (!this.$dateValidation(this.rewardUserInfo.등록일)) {
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
        excelDown() {
            let excelUsers = []
            const titleYear = Number(this.userInfo.연도) + 1;
            this.users.forEach(user => {
                excelUsers.push({
                    아이디 : user.아이디,
                    이름 : user.이름,
                    직위 : user.직위,
                    휴가수 : 0,
                    기준연도 : titleYear,
                })
            })
            /* 컬럼 가로 길이 설정 */
            const colOpt = [
                {wch : 30},
                {wch : 10},
                {wch : 10},
                {wch : 10},
                {wch : 10},
            ]
            excel.excelDownload(excelUsers, `${titleYear}년_직원_휴가_추가`, `${titleYear}년 휴가`, {"!cols" : colOpt})
        },
        async readExcelFile(file) {
            if (!file) {
                this.clearExcelUploader();
                return
            } 

            if (file.size > 52428800) {
                    alert("파일 크기가 50MB를 초과하였습니다.")
                    this.clearExcelUploader();
                    return
            }
            if (!this.isExcel(file.type)) {
                alert("파일 형식이 Excel이 아닙니다. (.xls 혹은 .xlsx 파일이 필요합니다.)")
                this.clearExcelUploader();
                return
            }

            const headers = ["아이디", "이름", "직위", "휴가수", "기준연도"]
            try {
                this.usersInfoJsonByExcel = await excel.readExcelFile(file, headers)
                this.mapPositionCodes()
            } catch(e) {
                this.clearExcelUploader();
            }
        },
        isExcel(fileType) {
            return fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileType === "application/vnd.ms-excel"
        },
        clearExcelUploader() {
            this.usersInfoJsonByExcel = []
            this.excelUploader = null
        },
        mapPositionCodes() {
            this.usersInfoJsonByExcel.map(e => {
                e["직위코드"] = this.positionHash[e["직위"]]
            })
        },
        async insertExcelUsers() {
            if (this.usersInfoJsonByExcel.length == 0) {
                alert("파일을 업로드 해주세요.")
                return
            }
            
            let validResult = this.validExcelFile(this.usersInfoJsonByExcel)

            if (validResult.length != 0) {
                alert("엑셀 파일 오류! 샘플 엑셀 파일을 참고해주세요.")
                this.clearExcelUploader()
                return
            }

            let res = await this.$post("/leave/cntExcel", this.usersInfoJsonByExcel)
            if (!res.status) {
                alert("에러 발생\n에러메세지 : " + res.msg)
            } else {
                alert("입력 성공\n추가인원 : " + res.data.successCount + "명")
            }
            this.clearExcelUploader();
            this.$emit("getUsers", this.userInfo.연도, true)
            this.dialog = false
        },
        validExcelFile(userInfoArray) {
            let errorMsgArray = []

            userInfoArray.every((e, idx) => {
                const errorMsg = this.validUser(e, idx + 2)
                if (errorMsg) {
                    errorMsgArray.push(errorMsg)
                    return false
                }
                return true
            })

            return errorMsgArray

        },
        validUser(userInfo, idx) {
            let errorMsg = "" + idx + "행 에러!! \n사유 : "
            let isError = false

            if (userInfo.기준연도) {
                const baseYearString = String(userInfo.기준연도)
                if (baseYearString.length != 4) {
                    errorMsg += "기준연도 길이(4), "
                    isError = true
                }
            }

            if (userInfo.휴가수) {
                if (userInfo.휴가수.isNaN) {
                    errorMsg += "휴가수는 숫자여야 합니다."
                    isError = true
                }
            }

            if (!isError) {
                return ''
            }

            return errorMsg.slice(0, -2)

        },
        carryLastYear() {
            if (!confirm("현재 연차에 작년 남은 휴가를 더합니다.\n작년 휴가를 이월하시겠습니까?\n(이미 이월된 휴가는 초기화 후 다시 이월됩니다.)")) return false
            this.$patch("/leave/carry-over", {
                year : this.userInfo.연도
            }).then(res => {
                if (!res.status) {
                    alert(res.msg)
                }
                this.close()
                this.$emit("getUsers", this.userInfo.연도, true)
            })
        },
    },
}
</script>
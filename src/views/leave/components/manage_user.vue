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
            <div style="width: 100%">
                    <div class="mt-3" :class="{'mr-16' : !isMobile}">
                        <v-btn outlined fab text small color="grey darken-2" @click="changeYear(-1)">
                            <v-icon>
                                mdi-chevron-left
                            </v-icon>
                        </v-btn>
                        <h3 class="di mt-3">
                            {{userInfo.연도}} 년 직원 관리
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
                                단건직원추가
                            </v-btn>
                            <v-btn depressed color="info" @click="showExcelUpload" class="ml-3">
                                엑셀직원추가
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
                                                {{ user.휴가수 ? user.휴가수 : "" }}
                                            </td>
                                            <td class="grid-body">
                                                {{ user.추가휴가수 ? user.사용추가휴가수 : "" }}
                                            </td>
                                            <td class="grid-body grid-right-line">
                                                {{ user.추가휴가수 ? user.추가휴가수 : "" }}
                                            </td>
                                            <td class="grid-body grid-right-line">
                                                {{ user.기타휴가수 ? user.기타휴가수 : "" }}
                                            </td>
                                            <td class="grid-body grid-right-line">
                                                {{ user.입사일
                                                    ? `${user.입사일.replace(/([\d]{4})([\d]{2})([\d]{2})/g, "$1년 $2월 $3일")} (${user.입사년차})`
                                                    : ""
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
                            <v-text-field v-model="userInfo.생일" label="생일 (MMDD)" counter="4" outlined></v-text-field>
                            <v-checkbox v-model="userInfo.음력여부" label="음력여부"></v-checkbox>
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
                            <v-text-field v-model="insertUserInfo.생일" label="생일 (MMDD)" counter="4" outlined></v-text-field>
                            <v-checkbox v-model="insertUserInfo.음력여부" label="음력여부"></v-checkbox>
                        </v-container>
                    </v-form>
    
                    <v-card-actions>
                        <v-btn color="primary" text @click="close">닫기</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="insertUser">등록</v-btn>
                    </v-card-actions>
                </v-card>

                <!-- 엑셀 직원 추가 모달 -->
                <v-card v-else-if="dialogType =='excelUpload'">
                    <v-card-title class="text-h5 grey lighten-2">
                        파일 업로드
                        <v-spacer></v-spacer>
                        <v-btn @click="$fileDownload('sampleExcel.xlsx')"> 샘플 다운로드 </v-btn>
                    </v-card-title>
                    <v-file-input v-model="excelUploader" show-size label="File input" style="width:95%;" @change="readExcelFile"></v-file-input>
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
            insertUserInfo : {},
            items : [],
            dialog: false,
            dialogType : "",
            targetDate : new Date(),
            positions : this.$store.getters.getPosition,
            positionHash : this.$store.getters.getPositionHash,
            usersInfoJsonByExcel : [],
            excelUploader : null,
            excelHeaderArray : ["아이디", "이름", "직위", "연도", "휴가수", "입사일", "이메일", "생일"],
        }
    },
    created() {
        this.$emit("getUsers", this.userInfo.연도)
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
                생일 : "",
                음력여부 : false,
            }
        },
        showExcelUpload() {
            this.dialog = true
            this.dialogType='excelUpload'
        },
        async readExcelFile(file) {
            if (!file) {
                this.clearExcelUploader()
                return
            }

            if (file.size > 52428800) {
                alert("파일 크기가 50MB를 초과하였습니다.")
                return
            }

            if (!this.isExcel(file.type)) {
                alert("파일 형식이 Excel이 아닙니다. (.xls 혹은 .xlsx 파일이 필요합니다.)")
                this.clearExcelUploader();
                return
            }
            const headers = ["아이디", "이름", "직위", "연도", "휴가수", "입사일", "이메일", "생일", "음력여부"]
            this.usersInfoJsonByExcel = await excel.readExcelFile(file, headers)
            this.mapPositionCodes()
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
            let validResult = this.insertExcelUsersValidation(this.usersInfoJsonByExcel)
            if (validResult.length != 0) {
                alert(validResult.join("\n"))
                this.clearExcelUploader()
                return
            } 
            console.log(this.usersInfoJsonByExcel)
            
            let res = await this.$put("/users/insertExcelUsers", this.usersInfoJsonByExcel)
            if (!res.status) {
                alert("에러 발생\n에러메세지 : " + res.msg)
            } else {
                alert("입력 성공\n추가인원 : " + res.data.insertUsers + "명")
            }
            this.usersInfoJsonByExcel = []
            this.$emit("getUsers", this.userInfo.연도, true)
            this.dialog = false
            this.excelUploader = null
        },
        validUser(insertUserInfo, idx) {
            let errorMsg = "" + idx + "행 에러!! \n사유 : "
            let isError = false

            this.excelHeaderArray.forEach(e => {
                if (!insertUserInfo[e]) {
                    errorMsg += e + ", "
                    isError = true
                }
            })

            if (insertUserInfo.입사일) {
                const stringJoinDay = String(insertUserInfo.입사일)
                if (stringJoinDay.length != 8) {
                    errorMsg += "입사일 길이 (8), "
                    isError = true
                }
                if (!this.$dateValidation(stringJoinDay)) {
                    errorMsg += "입사일, "
                    isError = true
                }
            }
            
            if (insertUserInfo.생일) {
                if (insertUserInfo.생일.length != 4) {
                    errorMsg += "생일 ex: 0101, "
                    isError = true
                }
            }

            // 엑셀상 휴가기준연도임. 이는 엑셀에서 데이터를 작성할 때 혼동을 피하기 위해서
            // 휴가기준연도라고 컬럼을 만들었으나, 실제 DB에선 그냥 연도이기 때문에 
            // excel.js 에서 휴가기준연도 -> 연도 로 key값을 바꿔줌.
            if (insertUserInfo.연도) {
                const leaveDefaultYear = String(insertUserInfo.연도)
                if (leaveDefaultYear.length != 4) {
                    errorMsg += "휴가기준연도자리수(4), "
                    isError = true
                }
            }

            if (!isError) {
                return ""
            }

            return errorMsg.slice(0, -2)
        },
        insertExcelUsersValidation(usersInfoJsonByExcel) {
            let totalErrorMsgArray = []
            //돌다가 에러 터지면 더 이상 안돎.
            usersInfoJsonByExcel.every((e, idx) => {
                // Excel의 시작 idx는 1이므로 +1, head를 제외 +1 총 +2
                const errorMsg = this.validUser(e, idx + 2)
                if (!e.음력여부 || e.음력여부 != "Y") {
                    e.음력여부 = "N"
                }

                if (errorMsg) {
                    totalErrorMsgArray.push(errorMsg)
                    return false
                }

                // backend sql 공통화를 위함.
                usersInfoJsonByExcel[idx] = {
                    ...e,
                    id : e.아이디,
                    name : e.이름,
                    position : this.positionHash[e.직위],
                    joinDate : e.입사일,
                    birthday : e.생일,
                    isLunar : e.음력여부,
                    기준연도 : e.연도,
                }
                return true

            })
            return totalErrorMsgArray
        },
        updateUser() {
            if (this.userInfo.입사일) {
                if (this.userInfo.입사일 && this.userInfo.입사일.length != 8) {
                    alert(`입사일은 8자로 입력해주십시오. \n (예 : 20020202})`)
                    return
                }
                if (!this.$dateValidation(this.userInfo.입사일)) {
                    alert(`${this.userInfo.입사일}일은 유효하지 않은 날짜 입니다.`)
                    return
                }
            }
            if (this.userInfo.생일 && this.userInfo.생일.length != 4) {
                alert(`생일은 4자로 입력해주십시오. \n (예 : 0129})`)
                return
            }
            this.$patch("/users", {
                id : this.userInfo.아이디,
                year : this.userInfo.연도,
                position : this.userInfo.직위코드,
                joinDate : this.userInfo.입사일,
                birthday : this.userInfo.생일,
                isLunar : this.userInfo.음력여부 ? 'Y' : 'N',
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
                if (!this.$dateValidation(this.insertUserInfo.입사일)) {
                    alert(`${this.insertUserInfo.입사일}일은 유효하지 않은 날짜 입니다.`)
                    return
                }

            }
            if (this.userInfo.생일 && this.userInfo.생일.length != 4) {
                alert(`생일은 4자로 입력해주십시오. \n (예 : 0129})`)
                return
            }

            this.$put("/users", {
                name : this.insertUserInfo.이름,
                id : this.insertUserInfo.아이디,
                position : this.insertUserInfo.직위코드,
                joinDate : this.insertUserInfo.입사일,
                birthday : this.insertUserInfo.생일,
                isLunar : this.insertUserInfo.음력여부,
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
    },
}
</script>
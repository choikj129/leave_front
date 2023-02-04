<template>
    <div class="main-component">
        <!-- 상단 select boxes -->
        <v-container fluid class="mt-10"
            style="display: flex!important; flex-direction: column!important; align-items: center;">
            <v-row align="center">
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="6"
                >
                    <v-select
                        :items="years"
                        label="연도"
                        @change="changeUser"
                        v-model="year"
                        class="vSelect"
                    ></v-select>
                </v-col>
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="6"
                >
                    <v-autocomplete
                        :disabled="!isManager"
                        :items="users"
                        item-text="이름_아이디"
                        item-value="아이디"
                        @change="changeUser"
                        v-model="targetUser"
                        :auto-select-first="true"
                        label="이름 [아이디]"
                    ></v-autocomplete>
                </v-col>
            </v-row>
        </v-container>

        <!-- 테이블 -->
        <v-data-table
            :headers="headers"
            :items="items"            
            :loading="isLoading"
            loading-text="Loading... Please wait"
            class="elevation-1"
        >
            <!-- 해당 컬럼은 색추가 -->
            <template v-slot:item.휴가구분="{ item }">
                <v-chip
                    :color="getColor(item.휴가구분)"
                    dark
                >
                    {{ item.휴가구분 == "기타 휴가" ? item.기타휴가내용  : item.휴가구분 }}
                </v-chip>
            </template>
        </v-data-table>
        <v-card class="mt-15"  color="#f4f9ff" v-if="!isManager">
            <v-card-title class="f3">{{ year }}년 휴가 정보</v-card-title>
            <v-card-text class="f2 mt-3">{{ cntTitle }}</v-card-text>
        </v-card>
    </div>
</template>
  
<script>
    export default {
        props : ["leaveCnts", "users"],
        data() {
            return {
                headers: [
                    { text: '휴가일', sortable: false, value: '휴가일', width:"400", align:"center"},
                    { text: '휴가 구분', sortable: false, value: '휴가구분', width:"300", align:"center"},
                    { text: '누적 휴가 수', sortable: false, value: '누적휴가수', width:"250", align:"center"},          
                ],
                isLoading : false,
                targetUser : this.$store.getters.getUser.id,
                years : [],
                year : new Date().getFullYear(),
                items : [],
                colors: {
                    "휴가" : "blue", 
                    "오전 반차" : "cyan",
                    "오후 반차" : "cyan", 
                    "기타 휴가" : "green",
                },
                isManager : this.$store.getters.getUser.isManager,
                cntTitle : "",
            }
        },
        methods : {
            getLists(id, year) {
                this.$get("/users/lists", {
                    id: id,
                    year : year,
                }).then((res) => {
                    let count = 0
                    let data = res.data.lists.reduce((acc, obj) => {
                        count += obj.휴가일수
                        obj.누적휴가수 = count 
                        acc.push(obj)
                        return acc
                    }, [])

                    /* 초기 로딩시 연동 select box 값 설정 */
                    if (this.years.length == 0) {
                        for (let i=new Date().getFullYear(); i>res.data.date[0].휴가시작연도-1; i--) {
                            this.years.push(i)
                        }
                    }
                    this.items = data
                    this.isLoading = false
                    const 휴가 = this.leaveCnts[this.year] && this.leaveCnts[this.year].휴가수 ? this.leaveCnts[this.year].휴가수 : "0"
                    const 사용휴가 = this.leaveCnts[this.year] && this.leaveCnts[this.year].사용휴가수 ? this.leaveCnts[this.year].사용휴가수 : "0"
                    const 잔여휴가 = this.leaveCnts[this.year] && this.leaveCnts[this.year].잔여휴가수 ? this.leaveCnts[this.year].잔여휴가수 : "0"
                    this.cntTitle = `${사용휴가}개 사용 | ${잔여휴가}개 사용 가능 (총 ${휴가}개 휴가 부여)`
                })
            },
            changeUser() {
                this.isLoading = true
                this.items = []
                this.getLists(this.targetUser, this.year)                
            },
            getColor(type) {
                return this.colors[type]
            },
        },
        mounted() {
            this.getLists(this.targetUser, new Date().getFullYear())            
        },
    }
</script>
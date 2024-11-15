<template>
    <div class="main-component" :class="{'mobile-component' : isMobile}">
        <v-dialog            
            v-model="dialog"
            :width="800"
            @click:outside="close"
        >
            <template v-slot:activator="{ on, attrs }">
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
                                return-object
                                label="이름 [아이디]"
                            ></v-autocomplete>
                        </v-col>
                    </v-row>
                </v-container>
                
                <v-card class="mt-15 mb-10"  color="#f4f9ff" v-show="targetUser.이름 && !isLoading">
                    <v-card-title style="display:inline" :class="isMobile ? 'f3_mobile' : 'f3'">{{ isManager ? `${targetUser.이름} ${targetUser.직위} ` : null }}{{ year }}년 휴가 정보</v-card-title>
                    <v-btn depressed color="primary" @click="showReward" class="ml-3" v-on="on" v-if="isDetailVisible">
                        추가휴가상세
                    </v-btn>
                    <div v-for="cntTitle in Object.values(cntTitles)" :key="cntTitle.title" v-if="cntTitle.visible">
                        <v-card-title class="bold" :class="isMobile ? 'f2_mobile' : 'f2'">{{ cntTitle.title }}</v-card-title>
                        <v-card-text class="mt-3" :class="isMobile ? 'f2_mobile' : 'f2'">{{ cntTitle.content }}</v-card-text>
                    </div>
                </v-card>
                <v-card>
                    <!-- 테이블 -->
                    <v-data-table
                        :headers="headers"
                        :items="items"
                        :loading="isLoading"
                        :items-per-page="-1"
                        hide-default-footer
                        class="elevation-1 mb-10"
                        :class="{'mobile-data-table' : isMobile}"
                    >
                        <!-- 해당 컬럼은 색추가 -->
                        <template v-slot:item.휴가구분="{ item }">
                            <v-chip
                                :color="$getColor(item.휴가구분)"
                                dark
                            >
                                {{ item.휴가구분 == "기타 휴가" ? item.기타휴가내용  : item.휴가구분 }}
                            </v-chip>
                        </template>
                    </v-data-table>
                </v-card>
            </template>
            <v-card>
                <reward_list
                    v-if="dialog"
                    :id="targetUser.아이디"
                    :year="year"
                    :isDelete="false"
                />
            </v-card>
        </v-dialog>
    </div>
</template>
  
<script>
import reward_list from "./include/reward_list.vue"
export default {
    components : {
        reward_list,
    },
    props : ["leaveCnts", "users"],
    name : "lists",
    data() {
        return {
            isMobile : this.$store.getters.getUser.isMobile,    
            dialog : false,
            headers: [
                { text: '휴가일', sortable: false, value: '휴가일', width:"400", align:"center"},
                { text: '휴가 구분', sortable: false, value: '휴가구분', width:"300", align:"center"},
                { text: '누적 휴가 수', sortable: false, value: '누적휴가수', width:"250", align:"center"},
            ],
            isLoading : false,
            targetUser : {
                아이디 : this.$store.getters.getUser.id,
                이름 : this.$store.getters.getUser.isManager ? null : this.$store.getters.getUser.name,
            },
            years : [],
            year : new Date().getFullYear(),
            items : [],
            colors: {
                "휴가" : "blue",
                "오전 반차" : "cyan",
                "오후 반차" : "cyan",
                "포상 휴가" : "blue-grey",
                "기타 휴가" : "green",
            },
            isManager : this.$store.getters.getUser.isManager,
            isDetailVisible : false,
            reward : {
                휴가일수 : 0,
                사용일수 : 0,
            },
            refresh : {
                휴가일수 : 0,
                사용일수 : 0,
            },
            cntTitles : {
                total : {title : "총 휴가 정보", content : "", visible : false},
                leave : {title : "연차 정보", content : "", visible : true},
                reward : {title : "포상 휴가 정보", content : "", visible : false},
                refresh : {title : "리프레시 휴가 정보", content : "", visible : false},
            },
        }
    },
    methods : {
        getLists(id, year) {
            this.isLoading = true
            this.$get("/leave/lists", {
                id: id,
                year : year,
                isManager : this.isManager
            }).then((res) => {
                this.$emit("getCnts", false, id, ()=>{
                    let count = 0
                    let data = res.data.reduce((acc, obj) => {
                        count += obj.휴가일수
                        obj.누적휴가수 = obj.휴가구분 == "기타 휴가" ? "-" : count
                        acc.push(obj)
                        return acc
                    }, [])

                    /* 초기 로딩시 연동 select box 값 설정 */
                    if (this.years.length == 0) {
                        for (let i=this.year + 1; i>this.year - 3; i--) {
                            this.years.push(i)
                        }
                    }
                    this.items = data
                    this.isLoading = false
                    this.setTitles()
                })
            })
        },
        getReward(id, year) {
            this.reward = {
                휴가일수 : 0,
                사용일수 : 0,
            }
            this.refresh = {
                휴가일수 : 0,
                사용일수 : 0,
            }
            this.$get("/reward/cnts", { id : id, year : year})
                .then(res => {
                    this.reward = res.data.reward[0]
                    this.refresh = res.data.refresh[0]

                    this.cntTitles.reward.visible = this.reward.휴가일수 > 0 ? true : false
                    this.cntTitles.refresh.visible = this.refresh.휴가일수 > 0 ? true : false
                    if (this.reward.휴가일수 > 0 || this.refresh.휴가일수 > 0) {
                        this.cntTitles.total.visible = true
                        this.isDetailVisible = true
                    } else {
                        this.cntTitles.total.visible = false
                        this.isDetailVisible = false
                    }
                    
                    this.getLists(id, year)
                })
        },
        changeUser() {
            this.items = []
            if (this.targetUser) {
                this.isLoading = true
                this.getReward(this.targetUser.아이디, this.year)
            } else {
                this.targetUser = {}
            }
        },
        setTitles() {
            console.log(this.leaveCnts)
            const 연차 = this.leaveCnts[this.year] && this.leaveCnts[this.year].휴가수 ? this.leaveCnts[this.year].휴가수 : 0
            const 사용연차 = this.leaveCnts[this.year] && this.leaveCnts[this.year].사용휴가수 ? this.leaveCnts[this.year].사용휴가수 : 0
            const 잔여연차 = this.leaveCnts[this.year] && this.leaveCnts[this.year].잔여휴가수 ? this.leaveCnts[this.year].잔여휴가수 : 0
            this.cntTitles.leave.content = `${사용연차}개 사용 | ${잔여연차}개 사용 가능 (총 ${연차}개 연차 부여)`

            const 포상 = this.reward.휴가일수
            const 사용포상 = this.reward.사용일수
            const 잔여포상 = 포상 - 사용포상
            this.cntTitles.reward.content = `${사용포상}개 사용 | ${잔여포상}개 사용 가능 (총 ${포상}개 포상 부여)`

            const 리프레시 = this.refresh.휴가일수
            const 사용리프레시 = this.refresh.사용일수
            const 잔여리프레시 = 리프레시 - 사용리프레시
            this.cntTitles.refresh.content = `${사용리프레시}개 사용 | ${잔여리프레시}개 사용 가능 (총 ${리프레시}개 리프레시 부여)`

            const 총휴가 = 연차 + 포상 + 리프레시
            const 총사용 = 사용연차 + 사용포상 + 사용리프레시
            const 총잔여 = 잔여연차 + 잔여포상 + 잔여리프레시
            this.cntTitles.total.content = `${총사용}개 사용 | ${총잔여}개 사용 가능 (총 ${총휴가}개 휴가부여)`
        },
        showReward() {
            this.dialog = true
        },
        close() {
            this.dialog = false
        },
    },
    mounted() {
        if (this.targetUser.이름 != null) {
            this.isLoading = true
            this.getReward(this.targetUser.아이디, this.year)
        } else {
            this.getLists('', this.year)
        }
    },
}
</script>
<template>
    <div>
        <v-card-title class="text-h5 grey lighten-2 bold">
            포상/리프레시 휴가 내역
            <v-spacer></v-spacer>
        </v-card-title>
        <!-- 포상/리프레시 내역 모달 -->
        <v-data-table
            :headers="headers"
            :items="items"
            :loading="isLoading"
            :items-per-page="-1"
            hide-default-footer
            class="elevation-1"
            :class="{'mobile-data-table' : isMobile}"
        >
            <!-- 해당 컬럼은 색추가 -->
            <template v-slot:item.휴가유형="{ item }">
                <v-chip
                    :color="colors[item.휴가유형]"
                    dark
                >
                    {{ item.휴가유형 }}
                </v-chip>
            </template>
            <template v-slot:item.삭제="{ item }" v-if="isUpdate">
                <v-btn depressed color="red lighten-1" @click="deleteReward(item)" :dark="true" v-if="item.사용일수 == 0">
                    삭제
                </v-btn>
            </template>
            <template v-slot:item.수정="{ item }" v-if="isUpdate">
                <v-btn depressed color="blue lighten-1" @click="showUpdateDialog(item)" :dark="true" v-if="item.사용일수 != item.휴가일수">
                    수정
                </v-btn>
            </template>
        </v-data-table>
        <!-- 포상/리프레시 추가 모달 -->
        <v-card v-if="updateDialog" style="width:30%; display: inline-block;">
            <v-card-title class="text-h5 grey lighten-2 bold">
                추가 휴가 수정
            </v-card-title>
            <v-form >
                <v-container style="width:100%">
                    <v-text-field v-model="selectedReward.휴가유형" disabled outlined></v-text-field>
                    <v-text-field v-model="selectedReward.등록일" disabled outlined></v-text-field>
                    <v-text-field v-model="selectedReward.휴가일수" label="휴가일수" class="required" outlined></v-text-field>
                    <v-text-field v-model="selectedReward.만료일" label="만료일 (YYYYMMDD)" class="required" counter="8" outlined></v-text-field>
                </v-container>
            </v-form>

            <v-card-actions>
                <v-btn color="primary" text @click="close">닫기</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="updateData">수정</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
export default {
    props : ["id", "year", "isUpdate"],
    name : "reward_list",
    data() {
        return {
            isMobile : this.$store.getters.getUser.isMobile,
            headers: [
                { text: '휴가 유형', sortable: false, value: '휴가유형', width:"200", align:"center"},
                { text: '휴가일수', sortable: false, value: '휴가일수', width:"100", align:"center"},
                { text: '사용일수', sortable: false, value: '사용일수', width:"100", align:"center"},
                { text: '등록일', sortable: false, value: '등록일', width:"150", align:"center"},
                { text: '만료일', sortable: false, value: '만료일', width:"150", align:"center"},                
            ],
            items : [],
            isLoading : true,
            colors: {
                포상 : "blue",
                리프레시 : "green",
            },
            updateDialog : false,
            selectedReward : {
                휴가유형 : "",
                등록일 : "",
                휴가일수 : "",
                만료일 : "",
            },
        }
    },
    methods : {
        showList(id, year) {
            this.items = []
            this.isLoading = true
            this.$get("/reward", {
                id : id,
                year : year,
            }).then(res => {
                this.items = res.data
                this.isLoading = false
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
                    this.$emit("updateDataCallback")
                })
            }
        },
        updateData() {
            if (this.selectedReward.휴가일수 < this.selectedReward.사용일수) {
                alert(`휴가일수는 사용일수보다 커야합니다. (${this.selectedReward.사용일수} 일)`)
                return
            }
            if (this.selectedReward.만료일 && this.selectedReward.만료일.length != 8) {
                alert(`만료일은 8자로 입력해주십시오. \n (예 : 20020202})`)
                return
            }
            if (!this.$dateValidation(this.selectedReward.만료일)) {
                alert(`${this.selectedReward.만료일}일은 유효하지 않은 날짜 입니다.`)
                return
            }

            if (confirm(`수정하시겠습니까?`)) {
                this.$patch("/reward", {
                    idx : this.selectedReward.IDX,
                    cnt : this.selectedReward.휴가일수,
                    expireDate : this.selectedReward.만료일,
                }).then(res => {
                    if (!res.status) {
                        alert(res.msg)
                    }
                    this.$emit("updateDataCallback")
                })
            }
        },
        close(item) {
            this.updateDialog = false
        },
        showUpdateDialog(item) {
            this.updateDialog = true
            this.selectedReward = this.$copy(item)
        }
    },
    created() {
        this.showList(this.id, this.year)
    },
    mounted() {
        if (this.isUpdate) {
            this.headers.push({ text: '수정', sortable: false, value: '수정', width:"100", align:"center", filter : false})
            this.headers.push({ text: '삭제', sortable: false, value: '삭제', width:"100", align:"center", filter : false})
        }
    }
}
</script>
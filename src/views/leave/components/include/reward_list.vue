<template>
    <div>
        <v-card-title class="text-h5 grey lighten-2 bold">
            연차 외 휴가 내역
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
            <template v-slot:item.삭제="{ item }" v-if="isDelete">
                <v-btn depressed color="red lighten-1" @click="deleteReward(item)" :dark="item.사용일수 == 0" v-if="!(item.사용일수 > 0)">
                    삭제
                </v-btn>
            </template>
        </v-data-table>
    </div>
</template>

<script>
export default {
    props : ["id", "year", "isDelete"],
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
                "포상" : "blue",
                "리프레시" : "green",
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
                    this.close()
                    this.$emit("getUsers", this.userInfo.연도, true)
                })
            }
        },
    },
    created() {
        this.showList(this.id, this.year)
    },
    mounted() {
        if (this.isDelete) this.headers.push({ text: '삭제', sortable: false, value: '삭제', width:"100", align:"center", filter : false})
    }
}
</script>
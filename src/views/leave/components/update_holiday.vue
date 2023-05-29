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
						<h3 class="di mt-3">
							올해 휴일 관리
						</h3>
						<span :class="{'manage-buttons' : !isMobile, 'block' : isMobile}">
							<v-btn depressed color="primary" @click="showInsert" class="ml-3">
								휴일추가
							</v-btn>
						</span>
					</div>

					<!-- 테이블 -->
					<v-data-table style="width: 85%; margin:auto; margin-top: 20px; margin-bottom:50px;"
						:headers="headers"
						:items="holidays"
						:loading="isLoading"
						:items-per-page="-1"
						hide-default-footer
						class="elevation-1"
						:class="{'mobile-data-table' : isMobile}"
					>
						<!-- 해당 컬럼은 색추가 -->
						<template v-slot:item.삭제="{ item }">
							<v-btn v-if="item.수동여부 == 'Y'" depressed color="red lighten-1" @click="deleteHoliday(item)" dark>
								삭제
							</v-btn>
						</template>
					</v-data-table>
				</div>
			</template>
			
			<div>
				<!-- 휴일 추가 모달 -->
				<v-card>
					<v-card-title class="text-h5 grey lighten-2">
						휴일 추가
					</v-card-title>
					<v-form >
						<v-container style="width:100%">
							<v-text-field v-model="insertHolidayInfo.명칭" label="명칭" class="required" outlined></v-text-field>
							<v-text-field v-model="insertHolidayInfo.시작일" label="시작일 (YYYYMMDD)" class="required" counter="8" outlined></v-text-field>
							<v-text-field v-model="insertHolidayInfo.종료일" label="종료일 (YYYYMMDD)" class="required" counter="8" outlined></v-text-field>
						</v-container>
					</v-form>

					<v-card-actions>
						<v-btn color="primary" text @click="close">닫기</v-btn>
						<v-spacer></v-spacer>
						<v-btn color="primary" text @click="insertHoliday">등록</v-btn>
					</v-card-actions>
				</v-card>
			</div>
        </v-dialog>
    </div>
</template>

<script>
export default {
	name : "holiday",
	data() {
		return {
            isMobile : this.$store.getters.getHoliday.isMobile,
			headers: [
                { text: '명칭', sortable: false, value: '명칭', width:"200", align:"center"},
                { text: '시작일', sortable: false, value: '시작일', width:"200", align:"center"},
                { text: '종료일', sortable: false, value: '종료일', width:"200", align:"center"},
                { text: '삭제', sortable: false, value: '삭제', width:"100", align:"center"},
            ],
			holidays : [],
            year : new Date().getFullYear(),
			insertHolidayInfo : {
				명칭 : "",
				시작일 : "",
				종료일 : "",
			},
			dialog: false,
			isLoading : false
		}
	},
	methods : {
		getHoliday() {
			this.$get("/holiday", {year : this.year})
			.then((res) => {
				this.isLoading = false
				this.holidays = res.data
			})
		},
		insertHoliday() {
			if (!this.insertHolidayInfo.명칭) {
                alert("명칭을 입력해주십시오.")
                return
            }
            if (this.insertHolidayInfo.시작일) {
                if (this.insertHolidayInfo.시작일.length != 8) {
                    alert(`시작일은 8자로 입력해주십시오. \n (예 : 20020202})`)
                    return
                }
                if (!this.dateValidation(this.insertHolidayInfo.시작일)) {
                    alert(`${this.insertHolidayInfo.시작일}일은 유효하지 않은 날짜 입니다.`)
                    return
                }

            }
            if (this.insertHolidayInfo.종료일) {
                if (this.insertHolidayInfo.종료일.length != 8) {
                    alert(`종료일은 8자로 입력해주십시오. \n (예 : 20020202})`)
                    return
                }
                if (!this.dateValidation(this.insertHolidayInfo.종료일)) {
                    alert(`${this.insertHolidayInfo.종료일}일은 유효하지 않은 날짜 입니다.`)
                    return
                }

            }
			let start = new Date(`${this.insertHolidayInfo.시작일.substring(0, 4)}-${this.insertHolidayInfo.시작일.substring(4, 6)}-${this.insertHolidayInfo.시작일.substring(6, 8)}`)
			const end = new Date(`${this.insertHolidayInfo.종료일.substring(0, 4)}-${this.insertHolidayInfo.종료일.substring(4, 6)}-${this.insertHolidayInfo.종료일.substring(6, 8)}`)
			const year = start.getFullYear()
			const cnt = this.$getDateCnt(start, end) + 1
			if (cnt > 5 && !confirm("휴일 수가 5일을 초과합니다. 등록하시겠습니까?")) return false

			let holidays = []
			for (let i = 0; i < cnt; i++) {
				holidays.push({
					name : this.insertHolidayInfo.명칭,
					holiday : this.$dateToYMD(start),
					year : year,
				})
				start.setDate(start.getDate() + 1)				
			}			
			
			this.$put("/holiday", {
				holidays : holidays,
			}).then(() => {
				this.getHoliday()
				this.close()
			})
				
		},
		deleteHoliday() {
		},
		showInsert() {
			this.dialog = true
		},
		close() {
			this.dialog = false
		},
		dateValidation(date) {
            const isDate = new Date(`${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}`)
            return isNaN(isDate) ? false : true
        },
	},
	created() {
		this.isLoading = true
		this.getHoliday()
	}
}
</script>
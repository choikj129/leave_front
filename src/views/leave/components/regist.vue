<template>
    <div class="main-component"  :class="{'mobile-component' : isMobile}">
        <v-row class="fill-height" style="width:98%;">
            <v-col>
                <!-- 상단 버튼 및 정보 -->
                <v-sheet height="80">
                    <v-toolbar flat>
                        <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
                            Today
                        </v-btn>
                        <v-btn fab text small color="grey darken-2" @click="prev">
                            <v-icon small>
                                mdi-chevron-left
                            </v-icon>
                        </v-btn>
                        <v-btn fab text small color="grey darken-2" @click="next">
                            <v-icon small>
                                mdi-chevron-right
                            </v-icon>
                        </v-btn>
                        <v-toolbar-title :class="{'f2_mobile' : isMobile}">
                            {{ calendarTitle }}
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-autocomplete v-if="isManager"
                            :items="users"
                            item-text="이름_아이디"
                            item-value="아이디"
                            @change="changeUser"
                            v-model="targetUser"
                            :auto-select-first="true"
                            return-object
                            label="이름 [아이디]"
                        ></v-autocomplete>
                        <v-spacer></v-spacer>
                        <v-btn depressed color="primary" @click="regist">
                            신청
                        </v-btn>
                    </v-toolbar>
                </v-sheet>

                <v-sheet style="margin-top : 2rem;">
                    <!-- 캘린더 -->
                    <v-calendar
                        ref="calendar"
                        v-model="focus"
                        color="secondary"
                        :events="events"
                        :event-color="getEventColor"
                        :type="'month'"
                        @change="changeMonth"
                        @click:next="next"
                        @click:date="selectEvent"
                        @click:event="showEvent"
                        @contextmenu:date="cancleClick"
                        locale="ko"
                        :show-month-on-first="false"
                        :day-format="getFormat"
                        :style="{ 'min-height' : calendarMinHeight}"
                    >
                    </v-calendar>

                    <!-- 이벤트 클릭 팝업 -->
                    <v-menu
                        max-width="350px"
                        v-model="selectedOpen"
                        :close-on-content-click="false"
                        :close-on-click="false"
                        :activator="selectedElement"
                        offset-x
                    >
                        <v-card color="grey lighten-4" min-width="350px"  flat>
                            <v-toolbar :color="selectedEvent.color" dark>
                                <v-menu bottom right>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn  outlined color="#f5f5f5" v-bind="attrs" v-on="on">
                                            <span>{{ selectedEvent.type }}</span>
                                            <v-icon right>mdi-menu-down</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-list v-if="!selectedEvent.disabled">
                                        <v-list-item @click="setType('휴가')">
                                            <v-list-item-title>휴가</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item v-if="selectedEvent.cnt < 2" @click="setType('오전 반차')">
                                            <v-list-item-title>오전 반차</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item v-if="selectedEvent.cnt < 2" @click="setType('오후 반차')">
                                            <v-list-item-title>오후 반차</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item v-if="selectedEvent.cnt <= rewardCnt && possibleReward" @click="setType('포상 휴가')">
                                            <v-list-item-title>포상 휴가</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item v-if="selectedEvent.cnt <= refreshCnt" @click="setType('리프레시 휴가')">
                                            <v-list-item-title>리프레시 휴가</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item @click="setType('기타 휴가')">
                                            <v-list-item-title>기타 휴가</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                                <v-text-field
                                    style="width:30%;margin-top: 14px;margin-left: 12px;"
                                    v-model="etcType"
                                    :autofocus="true"
                                    v-if="selectedEvent.type=='기타 휴가' && !selectedEvent.disabled"
                                ></v-text-field>
                                <v-spacer></v-spacer>
                                <v-btn icon @click="deleteEvent" v-if="selectedEvent.updateType != 'D'" >
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                                <v-btn icon @click="rollbackEvent" v-else>
                                    <v-icon>mdi-cached</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-card-text>
                                <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn text color="secondary" @click="closeEvent">
                                    close
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-menu>
                </v-sheet>
            </v-col>
        </v-row>
        <v-snackbar v-model="snackbar"
                :timeout="timeout"
                :width="500">
            <div style="font-size:small">
                끝나는 날을 선택해 주세요
            </div>
        <template v-slot:action="{ attrs }">
          <v-btn
            color="blue"
            text
            v-bind="attrs"
            @click="snackbar = false"
          >
            Close
          </v-btn>
        </template>
        </v-snackbar>
    </div>
</template>
  
<script>

export default {
    name : "calendar",
    props : ["users"],
    data() {
        return {
            isMobile : this.$store.getters.getUser.isMobile,
            isManager : this.$store.getters.getUser.isManager,            
            todayYMD : this.$dateToYMD(new Date(), "-"),
            calendarMinHeight : "700px",
            week: ["일", "월", "화", "수", "목", "금", "토"],
            timeout:-1,
            today : new Date(),
            holiday : this.$store.getters.getHoliday,
            targetUser : {
                아이디 : this.$store.getters.getUser.id,
                이름 : this.$store.getters.getUser.name,
            },
            events: [],
            focus: "",
            type : "휴가",
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            selectedType : "휴가",
            selectDate : false,
            selectDateBtn : null,
            selectMonth : new Date(),
            startDate : null,
            changeEvents : {추가 : {}, 취소 : []},
            originalEvents: {},
            calendarTitle: "",
            snackbar : false,
            etcType : "기타",
            dateHash : {},
            possibleReward : false,
            rewardLists : [],
            rewardCnt : 0,
            refreshLists : [],
            refreshCnt : 0,
        }
    },
    created() {
        this.getReward()
        if (this.isMobile) {
            this.calendarMinHeight = screen.height - 180 + "px"
        }
        if (this.isManager) this.targetUser = this.users[0]
        
        this.setCalendar()
    },
    methods: {
        async setCalendar() {            
            // 서버에서 휴가 데이터를 가져와서 캘린더에 표시할 이벤트를 설정합니다.
            this.$get("/leave", {id : this.targetUser.아이디}).then((res) => {
                this.originalEvents = {}
                this.events = []
                let events = res.data
                for (let i=0; i<events.length; i++) {
                    let event = events[i]                
                    event = {
                        name : event.내용,
                        start: new Date(event.시작일),
                        end: new Date(event.종료일),
                        startDate: event.시작일,
                        endDate: event.종료일,
                        color: this.$getColor(event.휴가구분),
                        index : Math.random().toString(36).substring(2),  /* 휴가 신청 목록 검색 용도 */
                        cnt : event.휴가일수,
                        type : event.휴가구분,
                        etcType : event.기타휴가내용,
                        disabled : true,
                        IDX : event.IDX,
                        rewardIdx : event.REWARD_IDX
                    }
                    this.originalEvents[event.index] = event
                    this.events.push(event)
                    
                    let startDate = new Date(event.startDate)
                    this.dateHashUpdate(startDate, event.cnt) // 날짜 해시 업데이트
                }
                this.setTitle() // 캘린더 제목 설정
            })
        },
        getReward() {
            // 사용자에게 할당된 보상 및 리프레시 휴가 정보를 가져옵니다.
            this.rewardCnt = 0
            this.refreshCnt = 0
            this.$get("/reward/user", { 
                id : this.targetUser.아이디,
                year : this.today.getFullYear(),
            }).then(res => {
                this.rewardLists = res.data.reward
                this.refreshLists = res.data.refresh

                let today = this.$dateToYMD(new Date(), "")
                
                // 포상 휴가 수 계산
                this.rewardLists.forEach(reward => {
                    if (today <= reward.만료일) this.rewardCnt += reward.휴가일수 - reward.사용일수
                })
                // 리프레시 휴가 수 계산
                this.refreshLists.forEach(refresh => {
                    if (today <= refresh.만료일) this.refreshCnt += refresh.휴가일수 - refresh.사용일수
                })
            })            
        },
        getFormat(e) {
            /* 달력 일 포맷 */
            return e.day
        },
        getEventColor(event) {
            /* 캘린더 이벤트 색 */
            return event.color
        },
        setTitle() {
            const year = this.selectMonth.getFullYear()
            this.calendarTitle = `${year}년 ${this.selectMonth.getMonth()+1 < 10 ? "0" + (this.selectMonth.getMonth()+1) : this.selectMonth.getMonth()+1}월`
        },
        setToday() {
            this.focus = ""
        },
        setType(type) {
            // 입력한 휴가 유형과 현재 선택한 유형이 다를 경우 포상, 리프레시 휴가 계산
            if (this.selectedEvent.type != type) {
                if (this.selectedEvent.type.startsWith("포상")) {
                    this.rewardCnt += Math.round(this.selectedEvent.cnt)
                } else if (type.startsWith("포상")) {
                    this.rewardCnt -= Math.round(this.selectedEvent.cnt)
                } else if (this.selectedEvent.type.startsWith("리프레시")) {
                    this.refreshCnt += Math.round(this.selectedEvent.cnt)
                } else if (type.startsWith("리프레시")) {
                    this.refreshCnt -= Math.round(this.selectedEvent.cnt)
                }
            }
            this.selectedEvent.type = type
            this.selectedEvent.cnt = type.endsWith("반차") ? 0.5 : Math.round(this.selectedEvent.cnt)

            /* 이벤트 휴가 타입 설정 */
            this.setEvent(type)
            this.selectedType = type
        },
        setEvent(type) {
            this.selectedEvent.name = this.selectedEvent.name.replace(/([\d-]+.\(.\)(.~.[\d-]+.\(.\))?).*/g, `$1 ${type}`)
            /* events에 있으면 수정 */
            for (let i=0; i<this.events.length; i++) {
                if (this.events[i].index == this.selectedEvent.index) {
                    this.events[i] = this.selectedEvent
                    break
                }
            }
            /* 원본 events에 없으면 changeEvents에 추가 */
            if (!this.originalEvents[this.selectedEvent.index]) {
                this.changeEvents.추가[this.selectedEvent.index] = this.selectedEvent
            }
        },
        prev() {
            this.$refs.calendar.prev()
        },
        next() {
            this.$refs.calendar.next()
        },
        changeMonth(event) {
            this.selectMonth = new Date(event.start.date)
            this.setTitle()
            // 싱크 이슈로 5ms 기다림
            setTimeout(() => {
                let children = document.getElementsByClassName("v-calendar-monthly")[0].children
                let childrenDay = document.getElementsByClassName("v-calendar-weekly__day")
                
                for (let i=1; i < children.length; i++) {
                    let child = children[i]
                    child.firstChild.getElementsByTagName("span")[0].style.cssText = "color:red!important"
                    child.lastChild.getElementsByTagName("span")[0].style.cssText = "color:blue!important"
                }
                // 공휴일 추가                
                let isPrev = true
                let isNext = false
                for(let i=0; i<childrenDay.length; i++) {
                    let childDay = childrenDay[i]
                    
                    let day = childDay.innerText
                    let days = day.split("\n")
                    day = days[0]
                    if (day == "") day = days[1]
                    let month = event.start.month
                    if (isPrev && day == 1) {
                        isPrev = false
                    } else if (!isPrev && day == 1) {
                        isNext = true
                    }
                    
                    if (isPrev) {
                        month--
                    } else if (isNext) {
                        month++
                    }

                    month %= 12
                    if (month == 0) month = 12
                    
                    day = day.length == 1 ? "0" + day : day.toString()
                    month = month < 10 ? "0" + month : month.toString()
                    let date = event.start.year + month + day
                    if (this.holiday[date]) {         
                        let holidayEl = childDay.getElementsByTagName("span")[0]       
                        holidayEl.style.color = "red"
                        let holidayName = this.holiday[date]
                        if (holidayName.length > 5) {
                            holidayEl.title = holidayName
                            holidayName =  holidayName.startsWith("대체공휴일") 
                                ? `${holidayName.slice(5).replace("(", "").replace(")", "")}<br>(대체공휴일)`
                                : holidayName.slice(0, 5) + "..."
                        }
                        holidayEl.innerHTML = parseInt(day) + "<br>" + holidayName
                    }
                }
            }, 5)
        },
        showEvent({nativeEvent, event}) {
            // 이벤트를 클릭했을 때 해당 이벤트의 세부 정보를 보여줍니다.
            const open = () => {
                this.selectedEvent = event
                this.selectedElement = nativeEvent.target
                requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
            }
            if (this.selectedOpen) {
                this.closeEvent()
                requestAnimationFrame(() => requestAnimationFrame(() => open()))
                return
            }
            this.etcType = event.etcType
            this.selectDate = false
            this.startDate = null
            if (this.selectDateBtn) {
                this.selectDateBtn.classList.remove("selectNode")
                this.selectDateBtn = null
            }
            open()
            nativeEvent.stopPropagation()
        },
        selectEvent(event) {
            // 날짜를 선택했을 때 호출되어 시작 및 종료 날짜를 설정합니다.
            const nativeEvent = event.nativeEvent
            const resetEvent = () => {
                this.selectDate = false
                this.startDate = null
                this.selectedOpen = false
                this.snackbar = false
                if (this.selectDateBtn) {
                    this.selectDateBtn.classList.remove("selectNode")
                    this.selectDateBtn = null
                }
            }
            if (this.selectedOpen) {
                this.closeEvent()
                this.selectDate = false
                return
            }
            
            if (this.dateHash[event.date]) {
                alert(`${event.date}일은 이미 등록된 날짜입니다.`)
                resetEvent()
                return
            }

            /* 처음 클릭한 날짜를 시작 or 종료 날짜로 */            
            if (!this.selectDate){
                this.selectDateBtn = event.nativeEvent.srcElement.parentNode
                this.selectDate = true
                this.startDate = event.date
                this.selectDateBtn = event.nativeEvent.srcElement.parentElement
                this.snackbar = true // 다음 날짜 선택 메시지

                if (event.nativeEvent.srcElement.parentElement.type == "button") {
                    this.selectDateBtn = this.selectDateBtn.parentElement
                }
                this.selectDateBtn.classList.add("selectNode")
                return
            }
            
            if (this.startDate > event.date) {
                [this.startDate, event.date] = [event.date, this.startDate]
            }
            const startDate = new Date(this.startDate)
            const endDate = new Date(event.date)
            
            const dateCnt = this.$getDateCnt(startDate, endDate) + 1

            for (let i=0; i<dateCnt; i++) {
                let sd = new Date(this.startDate)
                sd.setDate(startDate.getDate() + i)
                if (sd.getDay() == 0 || sd.getDay() == 6) {
                    alert("주말은 휴가를 신청할 수 없습니다.")
                    resetEvent()
                    return
                }
                if (this.holiday[this.$dateToYMD(sd)]) {
                    alert("공휴일은 휴가를 신청할 수 없습니다.")
                    resetEvent()
                    return
                }
                let date = this.$dateToYMD(sd, "-")
                if (this.dateHash[date]) {
                    alert(`${date}일은 이미 등록된 날짜입니다.`)
                    resetEvent()
                    return
                }
            }

            const name = this.startDate == event.date
                ? `${this.startDate} (${this.week[startDate.getDay()]}) 휴가`
                : `${this.startDate} (${this.week[startDate.getDay()]}) ~ ${event.date} (${this.week[endDate.getDay()]}) 휴가`

            this.selectedEvent = {
                name : name,
                start: startDate,
                end: endDate,
                startDate: this.startDate,
                endDate: event.date,
                color: this.$getColor("신규"),
                index : Math.random().toString(36).substring(2),
                cnt : dateCnt,
                type : "휴가",
                etcType : "",
                disabled : false,
                updateType : "I"
            }
            this.changeEvents.추가[this.selectedEvent.index] = this.selectedEvent
            this.events.push(this.selectedEvent)
            
            let possibleDate = 0
            this.rewardLists.forEach(reward => {
                const expiredDay = new Date(`${reward.만료일.substring(0, 4)}-${reward.만료일.substring(4, 6)}-${reward.만료일.substring(6, 8)}`)
                if(this.$getDateCnt(this.selectedEvent.end, expiredDay) >= 0) {
                    possibleDate += reward.휴가일수 - reward.사용일수
                }
            })
            
            if (possibleDate >= this.selectedEvent.cnt) {
                this.possibleReward = true
            } else {
                this.possibleReward = false
            }
            this.snackbar = false
            this.dateHashUpdate(new Date(this.startDate), dateCnt)
            this.selectedElement = nativeEvent.target
            resetEvent()
            nativeEvent.stopPropagation()
            
        },
        cancleClick(event) {
            if (this.selectDateBtn) {
                this.selectDateBtn.classList.remove("selectNode")
                this.selectDateBtn = null
                this.selectDate = false
                this.startDate = null
            }
        },
        closeEvent() {
            // 이벤트 팝업을 닫고, 기타 휴가의 경우 추가 정보를 설정합니다.
            if (this.selectedEvent.type=='기타 휴가') {
                if (!this.etcType) {
                    this.etcType = "기타"
                }
                this.selectedEvent.etcType = this.etcType
                const cancel = this.selectedEvent.updateType == "D" ? " 취소" : ""
                this.setEvent(this.etcType.endsWith("휴가") ? this.etcType : `${this.etcType} 휴가${cancel}`)
            } else this.selectedEvent.etcType = ""
            this.selectedOpen = false
        },
        deleteEvent(){
            if (confirm(`${this.selectedEvent.name}를 취소하시겠습니까?\n(취소 후 신청을 해야 적용됩니다.)`)) {                
                this.events = this.events.filter(event => {
                    if (event.index == this.selectedEvent.index) {
                        // 이미 등록된 지나간 휴가는 직원 삭제 불가
                        if (
                            this.originalEvents[this.selectedEvent.index] 
                            && this.todayYMD > event.startDate
                            && !this.isManager
                        ) {
                            alert("지난 날짜는 취소가 불가능합니다. 관리자에게 요청하세요.")
                            return true
                        }
                        this.dateHashUpdate(new Date(this.selectedEvent.startDate), this.selectedEvent.cnt, false)

                        if (event.type.startsWith("포상")) {
                            this.rewardCnt += event.cnt
                        } else if (event.type.startsWith("리프레시")) {
                            this.refreshCnt += event.cnt                 
                        }
                        
                        if (!this.originalEvents[this.selectedEvent.index]) {
                            // 신규 등록 취소
                            delete this.changeEvents.추가[this.selectedEvent.index]
                            return false
                        } else {                            
                            console.log(event)
                            // 휴가 취소
                            event.updateType = "D"
                            event.color = this.$getColor("삭제")
                            event.name += " 취소"
                            this.changeEvents.취소.push(event)
                        }
                    }
                    return true
                })

                this.selectedOpen = false
            }
        },
        rollbackEvent() {
            this.events.forEach(event => {
                if (this.selectedEvent.index == event.index) {
                    if (event.type.startsWith("포상")) {
                        this.rewardCnt -= event.cnt
                    } else if (event.type.startsWith("리프레시")) {
                        this.refreshCnt -= event.cnt
                    }
                    event.color = this.$getColor(event.type)
                    event.name = event.name.slice(0,-3)
                    event.updateType = undefined
                }
            })
            this.changeEvents.취소 = this.changeEvents.취소.filter(event => {
                this.selectedEvent.index != event.index
            })
        },
        regist() {
            // 선택된 이벤트를 서버에 등록합니다.
            if (this.selectedOpen) this.closeEvent()
            let message = ""
            let postEvents = []
            let rewardIndex = 0
            let refreshIndex = 0
            let rewardLists = this.$copy(this.rewardLists)
            let refreshLists = this.$copy(this.refreshLists)
            let updateReward = {}
            Object.keys(this.changeEvents).forEach((key) => {
                Object.values(this.changeEvents[key]).forEach((value) => {
                    value.updateReward = null
                    if (key == "추가") {                        
                        if (value.type.startsWith("포상")) {
                            let cnt = value.cnt
                            while (rewardLists[rewardIndex].휴가일수 < rewardLists[rewardIndex].사용일수 + cnt) {
                                cnt -= rewardLists[rewardIndex].휴가일수 - rewardLists[rewardIndex].사용일수
                                updateReward[rewardLists[rewardIndex].IDX] = value.cnt
                                rewardLists[rewardIndex].사용일수 = rewardLists[rewardIndex].휴가일수
                                rewardIndex++
                            }
                            rewardLists[rewardIndex].사용일수 += cnt
                            updateReward[rewardLists[rewardIndex].IDX] = value.cnt                            
                        } else if (value.type.startsWith("리프레시")) {
                            let cnt = value.cnt
                            while (refreshLists[refreshIndex].휴가일수 < refreshLists[refreshIndex].사용일수 + cnt) {
                                cnt -= refreshLists[refreshIndex].휴가일수 - refreshLists[refreshIndex].사용일수
                                updateReward[refreshLists[refreshIndex].IDX] = value.cnt
                                refreshLists[refreshIndex].사용일수 = refreshLists[refreshIndex].휴가일수
                                refreshIndex++                                
                            }                                                         
                            refreshLists[refreshIndex].사용일수 += cnt
                            updateReward[refreshLists[refreshIndex].IDX] = value.cnt                        
                        }

                        value.updateReward = JSON.stringify(updateReward)
                        updateReward = {}
                        postEvents.push(value)
                    }
                    message += `${value.name}\n`
                })
            })
            postEvents = postEvents.concat(this.changeEvents.취소)

            if (message == "") {
                alert("신청할 휴가가 존재하지 않습니다.")
                return
            }             
            if(confirm(message+"\n를 신청하시겠습니까?")){
                this.$patch("/leave", {
                    events : postEvents,
                    id : this.targetUser.아이디,
                    name : this.targetUser.이름,
                    reward : rewardLists.concat(refreshLists),
                }).then(res => {
                    if (res.status) {
                        this.changeEvents = {취소 : [], 추가 : {}}
                        this.getReward()
                        this.setCalendar()
                        this.$emit("getCnts", false, this.targetUser.아이디)
                    } else {
                        alert(res.msg)
                    }
                })
            }
        },
        dateHashUpdate(date, cnt, isAppend=true) {
            // 날짜 해시를 업데이트하여 특정 날짜를 추가하거나 삭제합니다.
            for (let c=0; c<Math.ceil(cnt); c++) {
                if (isAppend) {
                    this.dateHash[this.$dateToYMD(date, "-")] = true
                } else {
                    delete this.dateHash[this.$dateToYMD(date, "-")]
                }
                date.setDate(date.getDate() + 1)
            }
        },
        changeUser() {
            this.focus = ""
            this.type = "휴가"
            this.selectedEvent = {}
            this.selectedElement = null
            this.selectedOpen = false
            this.selectedType = "휴가"
            this.selectDate = false
            this.selectDateBtn = null
            this.selectMonth = new Date()
            this.startDate = null
            this.changeEvents = {추가 : {}, 취소 : []}
            this.originalEvents = {}
            this.calendarTitle = ""
            this.snackbar = false
            this.etcType = "기타"
            this.dateHash = {}
            this.possibleReward = false
            this.rewardLists = []
            this.rewardCnt = 0
            this.refreshLists = []
            this.refreshCnt = 0

            this.setCalendar()
        },
    },
}
</script>
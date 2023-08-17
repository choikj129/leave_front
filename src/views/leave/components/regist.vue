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
                        offset-x>
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
    data() {
        return {
            isMobile : this.$store.getters.getUser.isMobile,
            calendarMinHeight : "700px",
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
            events: [],
            calendarTitle: "",
            week: ["일", "월", "화", "수", "목", "금", "토"],
            etcType : "기타",
            dateHash : {},
            possibleReward : false,
            rewardLists : [],
            rewardCnt : 0,
            refreshLists : [],
            refreshCnt : 0,
            holiday : this.$store.getters.getHoliday,
            today : new Date(),
            timeout:-1,
            snackbar:false,
        }
    },
    created() {
        this.getReward()
        if (this.isMobile) {
            this.calendarMinHeight = screen.height - 180 + "px"
        }
        this.setCalendar()
    },
    methods: {
        async setCalendar() {            
            this.$get("/leave", {id : this.$store.getters.getUser.id}).then((res) => {
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
                    this.dateHashUpdate(startDate, event.cnt)
                }
                this.setTitle()
            })
        },
        getReward() {
            this.rewardCnt = 0
            this.refreshCnt = 0
            this.$get("/reward/user", { 
                id : this.$store.getters.getUser.id,
                year : this.today.getFullYear(),

            }).then(res => {
                this.rewardLists = res.data.reward
                this.refreshLists = res.data.refresh
                
                this.rewardLists.forEach(reward => {
                    this.rewardCnt += reward.휴가일수 - reward.사용일수
                })
                this.refreshLists.forEach(refresh => {
                    this.refreshCnt += refresh.휴가일수 - refresh.사용일수
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
            /* events에 있으면 수정*/
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
            setTimeout(() => {
                let children = document.getElementsByClassName("v-calendar-monthly")[0].children
                let childrenDay = document.getElementsByClassName("v-calendar-weekly__day")
                
                for (let i=1; i < children.length; i++) {
                    let child = children[i]
                    child.firstChild.getElementsByTagName("span")[0].style.cssText = "color:red!important"
                    child.lastChild.getElementsByTagName("span")[0].style.cssText = "color:blue!important"
                }
                //공휴일 추가                
                let isPrev = true
                let isNext = false
                for(let i=0; i<childrenDay.length; i++) {
                    let childDay = childrenDay[i]
                    
                    let day = childDay.innerText
                    day = day.split("\n")[0]
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
                    
                    day = day.length == 1 ? "0" + day : day.toString()
                    month = month < 10 ? "0" + month : month.toString()
                    let date = event.start.year + month + day
                    if (this.holiday[date]) {         
                        childDay.getElementsByTagName("span")[0].style.cssText = "color:red!important"
                        childDay.getElementsByTagName("span")[0].innerHTML = parseInt(day) + "<br>" + this.holiday[date] + "</br>"
                    }
                }
            }, 5)
        },
        showEvent({nativeEvent, event}){
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
            }else {
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
            if (this.selectedEvent.type=='기타 휴가') {
                if (!this.etcType) {
                    this.etcType = "기타"
                }
                this.selectedEvent.etcType = this.etcType
                const cancel = this.selectedEvent.updateType == "D" ? " 취소" : ""
                this.setEvent(this.etcType.endsWith("휴가") ? this.etcType : `${this.etcType} 휴가${cancel}`)
            }
            this.selectedOpen = false
        },
        deleteEvent(){
            if (confirm(`${this.selectedEvent.name}를 취소하시겠습니까?\n(취소 후 신청을 해야 적용됩니다.)`)) {                
                this.events = this.events.filter(event => {
                    if (event.index == this.selectedEvent.index) {
                        this.dateHashUpdate(new Date(this.selectedEvent.startDate), this.selectedEvent.cnt, false)

                        if (event.type.startsWith("포상")) {
                            this.rewardCnt += event.cnt
                        } else if (event.type.startsWith("리프레시")) {
                            this.refreshCnt += event.cnt                 
                        }

                        if (!this.originalEvents[this.selectedEvent.index]) {
                            delete this.changeEvents.추가[this.selectedEvent.index]
                            return false
                        }else {
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
            if (this.selectedOpen) this.closeEvent()
            let message = ""
            let postEvents = []
            let rewardIndex = 0
            let refreshIndex = 0
            let rewardLists = this.$copy(this.rewardLists)
            let refreshLists = this.$copy(this.refreshLists)
            let updateReward = {}
            Object.keys(this.changeEvents).forEach((key) =>{
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
                    id : this.$store.getters.getUser.id,
                    name : this.$store.getters.getUser.name,
                    reward : rewardLists.concat(refreshLists),
                }).then(res => {
                    if (res.status) {
                        this.changeEvents = {취소 : [], 추가 : {}}
                        this.getReward()
                        this.setCalendar()
                        this.$emit("getCnts", false, this.$store.getters.getUser.id)
                    } else {
                        alert(res.msg)
                    }
                })
            }
        },
        rnd(a, b) {
            return Math.floor((b - a + 1) * Math.random()) + a
        },        
        dateHashUpdate(date, cnt, isAppend=true) {
            for (let c=0; c<Math.ceil(cnt); c++) {
                if (isAppend) {
                    this.dateHash[this.$dateToYMD(date, "-")] = true
                } else {
                    delete this.dateHash[this.$dateToYMD(date, "-")]
                }
                date.setDate(date.getDate() + 1)
            }
        },
    },
}
</script>
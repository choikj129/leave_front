<template>
    <div class="main-component">
        <v-row class="fill-height" style="width:98%;">
            <v-col style="margin-bottom:2rem;">
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
                        <v-toolbar-title>
                            {{ calendarTitle }}
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn depressed color="primary" @click="regist">
                            신청
                        </v-btn>                    
                    </v-toolbar>
                    <v-card-text style="font-size: 1.5rem; float:right; font-weight: bold;">
                        {{ cntTitle }}
                    </v-card-text>
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
                        locale="ko"
                        :show-month-on-first="false"
                        :day-format="getFormat"
                        style="min-height: 700px; "
                    >
                    </v-calendar>

                    <!-- 이벤트 클릭 팝업 -->
                    <v-menu 
                        max-width="350px"
                        v-model="selectedOpen"
                        :close-on-content-click="false"
                        :close-on-click="true"
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
                                        <v-list-item @click="setType('기타 휴가')">
                                            <v-list-item-title>기타 휴가</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                                <v-text-field 
                                    placeholder="기타" 
                                    style="width:30%;margin-top: 14px;margin-left: 12px;"
                                    v-model="etcType"
                                    v-if="selectedEvent.type=='기타 휴가' && !selectedEvent.disabled"    
                                ></v-text-field>
                                <v-spacer></v-spacer>
                                <v-btn icon @click="deleteEvent">
                                    <v-icon>mdi-delete</v-icon>
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
    </div>
</template>
  
<script>
export default {
    props : ["leaveCnts", "users"],
    data() {
        return {
            focus: "",
            type : "휴가",
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            selectDate : false,
            selectMonth : new Date(),
            startDate : null,
            changeEvents : {추가 : {}, 취소 : []},
            originalEvents: {},
            events: [],
            colors: {
                "휴가" : "blue", 
                "오전 반차" : "cyan",
                "오후 반차" : "cyan", 
                "기타 휴가" : "green",
                "신규" : "orange",
            },
            calendarTitle: "",
            week: ["일", "월", "화", "수", "목", "금", "토"],
            etcType : "기타",
            cntTitle : "",
        }
    },
    created() {
        this.setCalendar()
        this.setTitle()
    },
    methods: {
        setCalendar() {
            this.$get("/leave", {id : this.$store.getters.getUser.id}).then((res) => {
                this.originalEvents = {}
                this.events = []
                let events = res.data
                for (let i=0; i<events.length; i++) {
                    let event = events[i]

                    /* 휴가 내용 재조립 */
                    const re = /[\d-]+.\(.\)(.~.[\d-]+.\(.\))?.(.*)/
                    let type = "휴가"
                    let etcType = ""
                    if (re.test(event.내용)) {
                        type = RegExp.$2                    
                            
                        if (type.trim().endsWith("휴가") && type.trim().length > 2) {
                            etcType = type.substring(0, type.lastIndexOf("휴가") - 1)
                            type = "기타 휴가"
                        }
                    }
                    
                    event = {
                        name : event.내용,                
                        start: new Date(event.시작일),
                        end: new Date(event.종료일),
                        startDate: event.시작일,
                        endDate: event.종료일,
                        color: this.colors[type],
                        index : Math.random().toString(36).substring(2),  /* 휴가 신청 목록 검색 용도 */
                        cnt : event.휴가일수,
                        type : type,
                        etcType : etcType,
                        disabled : true,
                        IDX : event.IDX
                    }
                    this.originalEvents[event.index] = event
                    
                    this.events.push(event)
                }
                this.setTitle()
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
            const 휴가 = this.leaveCnts[year] && this.leaveCnts[year].휴가수 ? this.leaveCnts[year].휴가수 : "0"
            const 잔여휴가 = this.leaveCnts[year] && this.leaveCnts[year].남은휴가수 ? this.leaveCnts[year].남은휴가수 : "0"
            this.cntTitle = this.$store.getters.getUser.isManager ? "관리자 계정" : `${year}년 잔여 휴가/총 휴가(${잔여휴가}/${휴가})`
        },
        setToday() {
            this.focus = ""
        },
        setType(type) {
            /* 이벤트 휴가 타입 설정 */
            this.selectedEvent.type = type
            this.selectedEvent.cnt = type.endsWith("반차") ? 0.5 : Math.round(this.selectedEvent.cnt)
            this.setEvent(type)
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
            this.selectMonth.setFullYear(event.start.year)
            this.selectMonth.setMonth(event.start.month - 1)
            this.setTitle()
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
            open()
            nativeEvent.stopPropagation()
        },
        selectEvent(event) {            
            if (this.$store.getters.getUser.isManager) return
            if (this.selectedOpen) {
                this.closeEvent()
                this.selectDate = false
                return
            }
            /* 처음 클릭한 날짜를 시작 or 종료 날짜로 */
            if (!this.selectDate){
                this.selectDate = true
                this.startDate = event.date
                return
            }
            const nativeEvent = event.nativeEvent
            
            if (this.startDate > event.date) {
                [this.startDate, event.date] = [event.date, this.startDate]
            }
            const startDate = new Date(this.startDate)
            const endDate = new Date(event.date)
            
            const dateCnt = this.getDateCnt(startDate, endDate)
            const name = this.startDate == event.date
                ? `${this.startDate} (${this.week[startDate.getDay()]}) 휴가` 
                : `${this.startDate} (${this.week[startDate.getDay()]}) ~ ${event.date} (${this.week[endDate.getDay()]}) 휴가`

            this.selectedEvent = {
                name : name,
                start: startDate,
                end: endDate,
                startDate: this.startDate,
                endDate: event.date,
                color: this.colors.신규,
                index : Math.random().toString(36).substring(2),
                cnt : dateCnt,
                type : "휴가",
                etcType : "",
                disabled : false,
                updateType : "I"
            }
            this.changeEvents.추가[this.selectedEvent.index] = this.selectedEvent
            this.selectedElement = nativeEvent.target
            this.selectDate = false
            this.startDate = null

            this.events.push(this.selectedEvent)

            nativeEvent.stopPropagation()
        },
        closeEvent() {
            if (this.selectedEvent.type=='기타 휴가') {
                if (!this.etcType) {
                    this.etcType = "기타"
                }
                this.selectedEvent.etcType = this.etcType
                this.setEvent(this.etcType.endsWith("휴가") ? this.etcType : this.etcType + " 휴가")
            }        
            this.selectedOpen = false
        },
        deleteEvent(){
            if (this.$store.getters.getUser.isManager) return
            if (confirm(`${this.selectedEvent.name}를 취소하시겠습니까?`)) {
                this.events = this.events.filter(event => {
                    if (event.index == this.selectedEvent.index) {
                        if (!this.originalEvents[this.selectedEvent.index]) {
                            delete this.changeEvents.추가[this.selectedEvent.index]
                        }else {
                            event.updateType = "D"
                            this.changeEvents.취소.push(event)
                        }
                    }
                    return event.index != this.selectedEvent.index
                }) 
                this.closeEvent()
            }
        },
        regist() {
            if (this.$store.getters.getUser.isManager) return
            let message = ""
            let postEvents = []
            Object.keys(this.changeEvents).forEach((key) =>{
                Object.values(this.changeEvents[key]).forEach((value) => {
                    if (key == "취소") {                        
                        message += `${value.name} 취소\n`
                    }else {                        
                        postEvents.push(value)
                        message += `${value.name}\n`                        
                    }
                })
            })
            postEvents = postEvents.concat(this.changeEvents.취소)
            if(message != "" && confirm(message+"\n를 신청하시겠습니까?")){
                this.$post("/leave", {
                    events : postEvents,
                    id : this.$store.getters.getUser.id
                }).then(res => {
                    if (res.status) {
                        this.$emit("getLists", false, () => this.setCalendar())
                        this.changeEvents = {취소 : [], 추가 : {}}
                    } else {
                        alert(res.msg)
                    }
                })
            }
        },
        changeCalendar(user) {
            this.isMe = this.$store.getters.getUser.id != user.아이디 ? false : true
            this.changeEvents = {추가 : {}, 취소 : []}
            this.selectedOpen = false
            this.selectDate = false
            this.startDate = null
            this.selectedEvent = {}
            this.selectedElement = null
            this.setCalendar(user.아이디)
            this.setTitle()
        },
        rnd(a, b) {
            return Math.floor((b - a + 1) * Math.random()) + a
        },
        getDateCnt(d1, d2) {
            return Math.abs((d2.getTime() - d1.getTime())/ (1000 * 60 * 60 * 24)) + 1
        },
    }
}
</script>
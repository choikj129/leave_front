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
                        <v-toolbar-title>
                            {{ calendarTitle }}
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
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
                        @click:event="showEvent"
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
                        :close-on-click="true"
                        :activator="selectedElement"
                        offset-x>
                        <v-card color="grey lighten-4" min-width="350px"  flat>
                            <v-toolbar :color="selectedEvent.color" dark>
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
    name : "calendar",
    data() {
        return {
            isMobile : this.$store.getters.getUser.isMobile,
            focus: "",
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            selectMonth : new Date(),
            events: [],
            colors: {
                "휴가" : "blue",
                "오전 반차" : "cyan",
                "오후 반차" : "cyan",
                "포상 휴가" : "blue-grey",
                "리프레시 휴가" : "blue-grey",
                "기타 휴가" : "green",
                "생일" : "pink lighten-2",
            },
            calendarTitle: "",
            week: ["일", "월", "화", "수", "목", "금", "토"],
            calendarMinHeight : "700px",
            holiday : this.$store.getters.getHoliday,
        }
    },
    async created() {
        if (this.isMobile) {
            this.calendarMinHeight = screen.height - 180 + "px"
        }
        await this.setCalendar()
                
        console.log(this.events)
    },
    methods: {
        async setCalendar() {
            this.events = []
            let birthdays = await this.$get("/birthday")
            birthdays.data.forEach(birthday => {
                this.events.push({
                    name : `${birthday.이름} ${birthday.생일}일 생일`,
                    start: new Date(birthday.생일),
                    end: new Date(birthday.생일),
                    startDate: birthday.생일,
                    endDate: birthday.생일,
                    color: this.colors["생일"],                
                    disabled : true,
                })
            })
            await this.$get("/leave").then((res) => {
                let events = res.data
                for (let i=0; i<events.length; i++) {
                    let event = events[i]
                    event = {
                        name : event.내용,
                        start: new Date(event.시작일),
                        end: new Date(event.종료일),
                        startDate: event.시작일,
                        endDate: event.종료일,
                        color: this.colors[event.휴가구분],
                        cnt : event.휴가일수,
                        type : event.휴가구분,
                        etcType : event.기타휴가내용,
                        disabled : true,
                        IDX : event.IDX,
                        rewardIdx : event.REWARD_IDX
                    }
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
        },
        setToday() {
            this.focus = ""
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
                let childrenDay = document.getElementsByClassName("v-calendar-weekly__day");
                
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
                    
                    let day = childDay.innerText;
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
            open()
            nativeEvent.stopPropagation()
        },
        closeEvent() {
            this.selectedOpen = false
        },
    }
}
</script>
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
import store from "../../../store";

export default {
    props : ["isMobile"],
    name : "calendar",
    data() {
        return {
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
                "기타 휴가" : "green",
                "신규" : "orange",
                "삭제" : "grey",
            },
            calendarTitle: "",
            week: ["일", "월", "화", "수", "목", "금", "토"],
            calendarMinHeight : "700px"
        }
    },
    created() {
        if (this.isMobile) {
            this.calendarMinHeight = screen.height - 180 + "px"
        }
        this.setCalendar()
        this.setTitle()
        this.setHoliday()
    },
    methods: {
        setHoliday() {
          this.$get("/holiday").then((res) => {
            if (res.status) {
              this.$store.commit("setHoliday", res.data)
            } else {
              alert(res.msg)
            }
          })
        },
        setCalendar() {
            this.$get("/leave", {isAll : true}).then((res) => {
                this.events = []
                let events = res.data
                for (let i=0; i<events.length; i++) {
                    let event = events[i]

                    /* 휴가 내용 재조립 */
                    const re = /[\d-]+.\(.\)(.~.[\d-]+.\(.\))?.(.*)/
                    let type = "휴가"
                    if (re.test(event.내용)) {
                        type = RegExp.$2                    
                            
                        if (type.trim().endsWith("휴가") && type.trim().length > 2) {
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
                        disabled : true,
                        IDX : event.IDX
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
            this.selectMonth.setFullYear(event.start.year)
            this.selectMonth.setMonth(event.start.month - 1)
            this.setTitle()
            setTimeout(() => {
                let children = document.getElementsByClassName("v-calendar-monthly")[0].children
                let childrenDay = document.getElementsByClassName("v-calendar-weekly__day");
                let holidayLength = store.getters.getHoliday.length
                let holiday = store.getters.getHoliday

                for (let i=1; i<children.length; i++) {
                    let child = children[i]
                    // console.log(child.firstChild.getElementsByTagName("span")[0])
                    child.firstChild.getElementsByTagName("span")[0].style.cssText = "color:red!important"
                    child.lastChild.getElementsByTagName("span")[0].style.cssText = "color:blue!important"
                }
                //공휴일 추가
                for(let i=0; i<childrenDay.length; i++) {
                  let temp = childrenDay[i].innerText;
                  for(let j=0; j<holidayLength; j++) {
                    if(holiday[j].년 == event.start.year && parseInt(holiday[j].월)  == event.start.month  &&  parseInt(temp) == parseInt(holiday[j].일)){
                      if(!(i < 7 && parseInt(temp) > 7) && !(i > 28 && parseInt(temp) < 7)){
                        childrenDay[i].getElementsByTagName("span")[0].style.cssText = "color:red!important"
                        childrenDay[i].getElementsByTagName("span")[0].innerHTML = temp + "<br>" + holiday[j].명칭 + "</br>"
                      }
                    }
                  }
                }
            }, 50)
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
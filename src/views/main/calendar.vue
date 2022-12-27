<template>
    <v-row class="fill-height" style="width:70%; margin-left: 22%;">
        <v-col>
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
            <v-sheet height="600">
                <v-calendar 
                    ref="calendar"
                    v-model="focus"
                    color="secondary"
                    :events="events"
                    :event-color="getEventColor"
                    :type="'month'"                    
                    @click:date="selectEvent"
                    @click:event="showEvent"
                    @change="updateRange"
                    locale="ko"
                    :show-month-on-first="false"
                    :day-format="getFormat"
                >
                </v-calendar>
                <v-menu 
                    v-model="selectedOpen"
                    :close-on-content-click="false"
                    :activator="selectedElement"
                    offset-x>
                    <v-card color="grey lighten-4" min-width="350px" flat>
                        <v-toolbar :color="selectedEvent.color" dark>
                            <v-menu bottom right>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn  outlined color="#f5f5f5" v-bind="attrs" v-on="on">
                                        <span>{{ typeToLabel[type] }}</span>
                                        <v-icon right>mdi-menu-down</v-icon>
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item @click="type = '휴가'">
                                        <v-list-item-title>휴가</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="type = '오전반차'">
                                        <v-list-item-title>오전 반차</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="type = '오후반차'">
                                        <v-list-item-title>오후 반차</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="type = '특별휴가'">
                                        <v-list-item-title>특별 휴가</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
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
</template>
  
<script>
export default {
    data: () => ({
        focus: "",
        type: "휴가",
        typeToLabel: {
            휴가: "휴가",
            오전반차: "오전 반차",
            오후반차: "오후 반차",
            특별휴가: "특별 휴가",
        },
        testColor : "black red black",
        selectedEvent: {},
        selectedElement: null,
        selectedOpen: false,
        selectDate : false,
        startDate : null,
        events: [],
        colors: ["blue", "indigo", "deep-purple", "cyan", "green", "orange", "grey darken-1"],
        names: ["Meeting", "Holiday", "PTO", "Travel", "Event", "Birthday", "Conference", "Party"],
        calendarTitle: "",
        week: ["일", "월", "화", "수", "목", "금", "토"],
        timeFormat : "T00:00:00"
    }),
    created() {
        this.events.push({
            name: "test",
            start: new Date(`2022-12-23${this.timeFormat}`),
            end: new Date(`2022-12-24${this.timeFormat}`),
            color: this.colors[this.rnd(0, this.colors.length - 1)],
            index : Math.random().toString(36).substring(2),
        })
    },
    mounted() {
        this.calendarTitle = this.$refs.calendar.title
        this.$refs.calendar.checkChange()
    },
    methods: {
        getFormat(e) {
            return e.day
        },
        viewDay({ date }) {
            this.focus = date
            this.type = "day"
        },
        getEventColor(event) {
            return event.color
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
        showEvent({nativeEvent, event}){
            const open = () => {
                this.selectedEvent = event
                this.selectedElement = nativeEvent.target
                requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
            }
            if (this.selectedOpen) {
                this.selectedOpen = false
                requestAnimationFrame(() => requestAnimationFrame(() => open()))
            } else {
                open()
            }
            nativeEvent.stopPropagation()
        },
        selectEvent(event) {            
            if (!this.selectDate){
                this.selectDate = true
                this.startDate = new Date(`${event.date+this.timeFormat}`)
                return
            }
            const nativeEvent = event.nativeEvent
            const startDate = `${this.startDate.getFullYear()}-${this.startDate.getMonth()+1}-${this.startDate.getDate()}`
            const endDate = new Date(`${event.date+this.timeFormat}`)
            const diffDate = this.startDate < endDate

            const name = startDate == event.date 
                ? `${startDate} (${this.week[this.startDate.getDay()]}) 휴가` 
                : `${startDate} (${this.week[this.startDate.getDay()]}) ~ ${event.date} (${this.week[endDate.getDay()]}) 휴가`
            this.selectedEvent = {
                name : name,
                start: diffDate ? this.startDate : endDate,
                end: diffDate ? endDate : this.startDate,
                color: this.colors[this.rnd(0, this.colors.length - 1)],
                index : Math.random().toString(36).substring(2),
            }
            this.selectedElement = nativeEvent.target
            this.selectDate = false
            this.startDate = null
                            
            this.events.push(this.selectedEvent)

            nativeEvent.stopPropagation()
        },
        closeEvent() {                        
            this.selectedOpen = false
        },
        deleteEvent(){
            this.events = this.events.filter(event => event.index != this.selectedEvent.index)            
            this.closeEvent()
            
        },
        updateRange({ start, end }) {
            // console.log("@@@@@@@@@@@@@@@@")
        },
        rnd(a, b) {
            return Math.floor((b - a + 1) * Math.random()) + a
        },
    },
}
</script>
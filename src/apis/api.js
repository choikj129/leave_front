import axios from "axios";
import store from "../store";

const methods = {
    get : async (url, params={}) => {
        if (!url.startsWith("/")) {
            url = "/" + url
        }

        if (Object.keys(params).length > 0) {
            url += "?"
            Object.keys(params).forEach((key, i) => {
                if (i > 0) {
                    url += "&"
                }
                url += `${key}=${params[key]}`
            })
        }

        try {            
            return await axios.get(url).then((res) => { return res })
        } catch(e) {
            console.error(e)
            return e
        }
    },
    post : async (url, params) => {
        if (!url.startsWith("/")) {
            url = "/" + url
        }
        try {
            return await axios.post(url, params).then((res) => { return res })
        } catch(e) {
            console.error(e)
            return e
        }
    },    
    put : async (url, params) => {
        if (!url.startsWith("/")) {
            url = "/" + url
        }
        try {
            return await axios.put(url, params).then((res) => { return res })
        } catch(e) {
            console.error(e)
            return e
        }
    },
    patch : async (url, params) => {
        if (!url.startsWith("/")) {
            url = "/" + url
        }
        try {
            return await axios.patch(url, params).then((res) => { return res })
        } catch(e) {
            console.error(e)
            return e
        }
    },
    delete : async (url, params) => {
        if (!url.startsWith("/")) {
            url = "/" + url
        }
        try {
            return await axios.delete(url, {
                data : params
            }).then((res) => { return res })
        } catch(e) {
            console.error(e)
            return e
        }
    },
    deepCopy : (object) => {
        return JSON.parse(JSON.stringify(object))
    },
    getDateCnt : (d1, d2) => {
        if (!d1 || !d2) return 0
        return Math.floor((d2.getTime() - d1.getTime())/ (1000 * 60 * 60 * 24))
    },
    dateToYMD : (date, sep="") => {
        const y = date.getFullYear()
        const m = date.getMonth()+1 < 10 ? "0" + (date.getMonth()+1) : date.getMonth()+1
        const d = date.getDate() < 10 ? "0" + (date.getDate()) : date.getDate()
        return `${y}${sep}${m}${sep}${d}`
    },
    setHoliday : async () => {
        try {
            let res = await axios.get("/holiday/detail").then((res) => { return res })
            if (res.status) {
                let holiday = {}
                res.data.forEach(data =>  {
                    holiday[data.날짜] = data.명칭
                })

                store.commit("setHoliday", holiday)
            }
            return true
        } catch(e) {
            console.error(e)
            return false
        }
    },
    dateValidation(date) {
        if (date.length != 8) throw new Error("date is YYYYMMDD")
        else {
            const isDate = new Date(`${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}`)
            return isNaN(isDate) ? false : true
        }
    },
}

/* Global 함수로 사용할 수 있게 */
export default {
    install (Vue) {
        Vue.prototype.$get = methods.get
        Vue.prototype.$post = methods.post
        Vue.prototype.$put = methods.put
        Vue.prototype.$patch = methods.patch
        Vue.prototype.$del = methods.delete
        Vue.prototype.$copy = methods.deepCopy
        Vue.prototype.$getDateCnt = methods.getDateCnt
        Vue.prototype.$dateToYMD = methods.dateToYMD
        Vue.prototype.$setHoliday = methods.setHoliday
        Vue.prototype.$dateValidation = methods.dateValidation
    }
}
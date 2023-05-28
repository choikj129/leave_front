import axios from "axios";

const methods = {
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
        console.log(url)
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
    getDateCnt(d1, d2) {
        if (!d1 || !d2) return 0
        return Math.floor((d2.getTime() - d1.getTime())/ (1000 * 60 * 60 * 24))
    },
    dateToYMD(date, sep="") {
        const y = date.getFullYear()
        const m = date.getMonth()+1 < 10 ? "0" + (date.getMonth()+1) : date.getMonth()+1
        const d = date.getDate() < 10 ? "0" + (date.getDate()) : date.getDate()
        return `${y}${sep}${m}${sep}${d}`
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
    }
}
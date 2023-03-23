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
}

/* Global 함수로 사용할 수 있게 */
export default {
    install (Vue) {
        Vue.prototype.$get = methods.get
        Vue.prototype.$post = methods.post
        Vue.prototype.$put = methods.put
        Vue.prototype.$patch = methods.patch
        Vue.prototype.$del = methods.delete
    }
}
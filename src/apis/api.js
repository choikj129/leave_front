import axios from "axios";

export default {
    async post(url, params) {
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
    async get(url, params={}) {
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
}
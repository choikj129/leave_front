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
        }
    },
    async get(url) {
        if (!url.startsWith("/")) {
            url = "/" + url
        }
        try {
            return await axios.get(url).then((res) => { return res })
        } catch(e) {
            console.error(e)
        }
    },
}
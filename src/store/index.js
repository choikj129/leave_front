import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

const state = {    
    user : {
        id : null,
        name : null,
        isManager : false,
    }
}

const getters = {
    getUser(state) {
        return state.user
    },
}

const mutations = {
    setUser(state, user) {
        return state.user = user
    },
}


const store = new Vuex.Store({
    state : state,
    getters : getters,
    mutations : mutations,
    actions : {},
})

export default store
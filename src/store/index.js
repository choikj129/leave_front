import Vue from "vue"
import Vuex from "vuex"
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const state = {    
    user : {
        id : null,
        name : null,
        isManager : false,
        isLogin : false,
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
    clearStore(state, user) {
        return state.user = {
            id : null,
            name : null,
            isManager : false,
            isLogin : false,
        }
    }
}


const store = new Vuex.Store({
    plugins : [createPersistedState()],
    state : state,
    getters : getters,
    mutations : mutations,
    actions : {},
})

export default store
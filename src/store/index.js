import Vue from "vue"
import Vuex from "vuex"
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)
/* store 데이터 */
const state = {    
    user : {
        id : null,
        name : null,
        position : null,
        isManager : false,
        isLogin : false,
    },
    position : {
        A : "사장",
        B : "부사장",
        C : "이사",
        D : "본부장",
        E : "부장",
        F : "차장",
        G : "과장",
        H : "대리",
        I : "주임",
    }
}
/* store 데이터 접근 
    ex) store.getters["state 키값"]
*/
const getters = {
    getUser(state) {
        return state.user
    },
    getPosition(state) {
        return state.position
    },
}

/* 데이터 수정할 수 있은 함수 */
const mutations = {
    setUser(state, user) {
        return state.user = user
    },
    clearStore(state, user) {
        return state.user = {
            id : null,
            name : null,
            position : null,
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
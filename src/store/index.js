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
        isMobile : false,
    },
    holiday : {},
    position : [],
    positionHash : {},
}
/* store 데이터 접근
    ex) store.getters["state 키값"]
*/
const getters = {
    getUser(state) {
        return state.user
    },
    getHoliday(state) {
        return state.holiday
    },
    getPosition(state) {
        return state.position
    },
    getPositionHash(state) {
        return state.positionHash
    }
}

/* 데이터 수정할 수 있은 함수 */
const mutations = {
    setUser(state, user) {
        return state.user = user
    },
    setHoliday(state, holiday) {
        return state.holiday = holiday
    },
    setPosition(state, position) {
        return state.position = position
    },
    setPositionHash(state, positionHash) {
        return state.positionHash = positionHash;
    },
    clearStore(state, user) {
        return state.user = {
            id : null,
            name : null,
            position : null,
            isManager : false,
            isLogin : false,
            isMobile : false,
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
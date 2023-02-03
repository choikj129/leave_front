import Vue from "vue"
import Vuex from "vuex"
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)
/* store ������ */
const state = {    
    user : {
        id : null,
        name : null,
        position : null,
        isManager : false,
        isLogin : false,
    }
}
/* store ������ ���� 
    ex) store.getters["state Ű��"]
*/
const getters = {
    getUser(state) {
        return state.user
    },
}

/* ������ ������ �� ���� �Լ� */
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
<template>
    <v-app id="inspire">
      <v-navigation-drawer
        v-model="drawer"
        app
      >
        <v-card
          class="mx-auto"
          max-width="344"
          color="#e2efff"
        >
          <img src="../../assets/img/odinue_ci.svg" style="width: 100%; position: relative;">
          <v-card-text style="font-size: 2rem; font-weight: bold;">
            {{user.name}}
          </v-card-text>

          <v-card-subtitle style="font-size: 1.5rem;font-weight: bold;">
            {{user.id}}@odinue.net
          </v-card-subtitle>
        </v-card>
  
        <v-list>
          <v-list-item
            v-for="link in links"
            :key="link.icon"
            v-if="!link.auth || (link.auth && user.isManager)"
          >
            <v-list-item-icon>
              <v-icon>{{ link.icon }}</v-icon>
            </v-list-item-icon>
  
            <v-list-item-content>
              <v-list-item-title>{{ link.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <calendar />
    </v-app>    
</template>

<script>
  import calendar from "./components/calendar"
  export default {
      components : {
        calendar
      },
      data() {
          return {
              cards: ['Today'],
              drawer: null,
              links: [
                  {icon : "mdi-calendar-check", text : "휴가", auth : false},
                  {icon : "mdi-inbox-arrow-down", text : "기록", auth : true},
              ],
              user : this.$store.getters.getUser 
          }
      },
  }
</script>
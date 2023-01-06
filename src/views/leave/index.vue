<template>
    <v-app id="inspire">
      <v-navigation-drawer
        v-model="drawer"
        app
      >
        <v-sheet
          color="#e2efff"
          class="pa-4"
        >
          <!-- <v-avatar
            class="mb-4"
            color="grey darken-1"
            size="64"
          ></v-avatar> -->
        <img src="../../assets/img/odinue_ci.svg" style="width: 100%; position: relative;">  
        <div>test@odinue.net</div>
        </v-sheet>
  
        <v-list>
          <v-list-item
            v-for="[icon, text] in links"
            :key="icon"
            link
          >
            <v-list-item-icon>
              <v-icon>{{ icon }}</v-icon>
            </v-list-item-icon>
  
            <v-list-item-content>
              <v-list-item-title>{{ text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <calendar />
    </v-app>    
</template>

<script>
  import { isGeneratorObject } from "util/types";
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
                  ['mdi-calendar-check', '휴가'],
                  ['mdi-inbox-arrow-down', 'Inbox'],
              ],
              // user : this.$store.getters.getUser.id
          }
      },
  }
</script>
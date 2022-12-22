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
        <div>john@odinue.net</div>
        </v-sheet>
  
        <v-divider></v-divider>
  
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
      <!-- <v-main>
        <v-container
          class="py-8 px-6"
          fluid
        >
          <v-row>
            <v-col
              v-for="card in cards"
              :key="card"
              cols="12"
            >
              <v-card>
                <v-subheader>{{ card }}</v-subheader>
  
                <v-list two-line>
                  <template v-for="n in 6">
                    <v-list-item
                      :key="n"
                    >
                      <v-list-item-avatar color="grey darken-1">
                      </v-list-item-avatar>
  
                      <v-list-item-content>
                        <v-list-item-title>Message {{ n }}</v-list-item-title>
  
                        <v-list-item-subtitle>
                          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil repellendus distinctio similique
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
  
                    <v-divider
                      v-if="n !== 6"
                      :key="`divider-${n}`"
                      inset
                    ></v-divider>
                  </template>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main> -->
    </v-app>    
</template>

<script>
  import calendar from "./calendar"
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
                  // ['mdi-delete', 'Trash'],
                  // ['mdi-alert-octagon', 'Spam'],
              ],
          }
      },
  }
</script>
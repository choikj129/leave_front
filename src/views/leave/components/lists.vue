<template>
    <v-card
        class="mx-auto"
        style="width: 35%; margin-top : 10rem"
    >
        <v-toolbar
            color="teal"
            dark
        >        
        <v-toolbar-title>휴가 리스트 (사용휴가/획득휴가)</v-toolbar-title> 
        </v-toolbar>
        
        <v-list>
            <v-list-group
                v-for="key in Object.keys(items)"
                :key="items[key].title"
                v-model="items[key].active"
                :prepend-icon="'mdi-message'"
                no-action
            >        
                <template v-slot:activator>
                    <v-list-item-content>
                        <v-list-item-title v-text="`${key} (${items[key].length}/${leaveCnts[key].총휴가수})`" style="font-size:2rem"></v-list-item-title>
                    </v-list-item-content>
                </template>
        
                <v-list-item
                    v-for="item in items[key]"
                    :key="item.휴가일"
                >
                    <v-list-item-content style="flex-wrap: nowrap;">
                        <v-list-item-title tag="span" v-text="item.휴가일" style="font-size:1.5rem"></v-list-item-title>
                        <v-list-item-title tag="span" v-text="item.기타휴가내용 != null ? item.기타휴가내용 : item.휴가구분" style="font-size:1.5rem"></v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list-group>
        </v-list>
    </v-card>
</template>
  
<script>
    // import api from "@/apis/api";
    export default {
        props : ["items", "leaveCnts"],
        data: () => ({
        }),
        mounted() {
        },
    }
</script>
<template>
    <v-app>
        <v-app-bar app>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
            <div class="margin-auto">
                <v-tabs v-model="selectedRoute" class="header-tabs">
                    <!-- Pangenome Selector  -->
                    <v-tab> <router-link :to="{ name: 'PangenomeSelection' }">Pangenome Selection</router-link></v-tab>
                    <!-- Other pages  -->
                    <v-tab> Structural Variations </v-tab>
                    <v-tab> Presence Absence </v-tab>
                    <!-- About  -->
                    <v-tab> <router-link :to="{ name: 'About' }">A propos</router-link></v-tab>
                </v-tabs>
            </div>
        </v-app-bar>
        <v-main>
            <!-- Content -->
            <router-view />
        </v-main>
    </v-app>
</template>

<script>
    import pangenomes from '@/data/pangenome';
    import { useStore } from 'vuex';
    import { ref } from '@vue/reactivity';
    export default {
        name: 'App',
        setup() {
            const selectedRoute = ref(0);
            const store = useStore();
            // Pangenomes default initiation
            store.dispatch('pangenomes/updatePangenomesAction', pangenomes);
            return { selectedRoute };
        }
    };
</script>

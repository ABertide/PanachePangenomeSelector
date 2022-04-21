import { createRouter, createWebHistory } from 'vue-router';
import PangenomeSelection from '@/views/PangenomeSelection.vue';

const routes = [
    {
        path: '/',
        name: 'PangenomeSelection',
        component: PangenomeSelection
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView')
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;

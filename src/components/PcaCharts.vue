<template>
    <div>
        <h2>Pca Panache</h2>
        <JSCharting :options="options" ref="chart" class="mb-5"></JSCharting>
    </div>
</template>

<script>
    import { ref } from '@vue/reactivity';
    import JSCharting from 'jscharting-vue';
    import { onMounted } from '@vue/runtime-core';
    import { useStore } from 'vuex';

    export default {
        components: {
            JSCharting
        },
        setup() {
            const store = useStore();
            const chart = ref(null);
            const name = ref('marker');
            const options = ref({
                type: 'marker',
                height: 500,
                legend: { template: '', visible: false },
                series: []
            });
            onMounted(() => {
                store.dispatch('chart/updateChartAction', chart.value);
            });
            return { name, options, chart };
        }
    };
</script>

<style lang="scss" scoped></style>

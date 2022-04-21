const state = {
    chart: {}
};
// getters: {
//     value: state => {
//         return state.value;
//     }
// },
const mutations = {
    updateChart(state, newChart) {
        state.chart = newChart;
    }
};
const actions = {
    updateChartAction({ commit }, newChart) {
        commit('updateChart', newChart);
    }
};

export default { namespaced: true, state, mutations, actions };

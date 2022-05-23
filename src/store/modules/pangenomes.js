const state = {
    pangenomes: []
};

// getters
const getters = {
    pangenomesSelected: state => {
        return state.pangenomes.filter(pangenome => pangenome.selected === true);
    }
};

// actions
const actions = {
    updatePangenomesAction({ commit }, newPangenomes) {
        commit('updatePangenomes', newPangenomes);
    },
    updateIsSelectedStateAction({ commit }, newPangenomes) {
        commit('updateIsSelectedState', newPangenomes);
    },
    updateIsNotSelectedStateAction({ commit }, newPangenomes) {
        commit('updateIsNotSelectedState', newPangenomes);
    }
};

// mutations
const mutations = {
    updatePangenomes(state, newPangenomes) {
        state.pangenomes = newPangenomes;
    },
    updateIsSelectedState(state, newPangenomes) {
        state.pangenomes.forEach(pangenome => (pangenome.selected = false));
        state.pangenomes[state.pangenomes.findIndex(pangenome => pangenome.name === newPangenomes.panID)].selected = true;
    },
    updateIsNotSelectedState(state, newPangenomes) {
        state.pangenomes[state.pangenomes.findIndex(pangenome => pangenome.name === newPangenomes.panID)].selected = false;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};

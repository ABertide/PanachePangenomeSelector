const state = {
    assemblies: []
};

// getters
const getters = {
    assembliesSelected: state => {
        return state.assemblies.filter(assembly => assembly.selected === true);
    }
};

// actions
const actions = {
    updateAssembliesAction({ commit }, newAssemblies) {
        commit('updateAssemblies', newAssemblies);
    },

    updateIsSelectedStateAction({ commit }, newAssemblies) {
        commit('updateIsSelectedState', newAssemblies);
    },
    updateIsNotSelectedStateAction({ commit }, newAssemblies) {
        commit('updateIsNotSelectedState', newAssemblies);
    },
    updateOverMousedStateAction({ commit }, newAssemblies) {
        commit('updateOverMousedState', newAssemblies);
    },
    updateNoMoreOverMousedStateAction({ commit }, newAssemblies) {
        commit('updateNoMoreOverMousedState', newAssemblies);
    }
};

// mutations
const mutations = {
    updateAssemblies(state, newAssemblies) {
        state.assemblies = newAssemblies;
    },

    updateIsSelectedState(state, newAssemblies) {
        state.assemblies = state.assemblies.map(assembly => {
            if (newAssemblies.assembly_name === assembly.assembly_name) {
                assembly.selected = true;
            }
            return assembly;
        });
    },
    updateIsNotSelectedState(state, newAssemblies) {
        state.assemblies = state.assemblies.map(assembly => {
            if (newAssemblies.assembly_name === assembly.assembly_name) {
                assembly.selected = false;
            }
            return assembly;
        });
    },
    updateOverMousedState(state, newAssemblies) {
        state.assemblies = state.assemblies.map(assembly => {
            if (newAssemblies.assembly_name === assembly.assembly_name) {
                assembly.overMoused = true;
            }
            return assembly;
        });
    },
    updateNoMoreOverMousedState(state, newAssemblies) {
        state.assemblies = state.assemblies.map(assembly => {
            if (newAssemblies.assembly_name === assembly.assembly_name) {
                assembly.overMoused = false;
            }
            return assembly;
        });
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};

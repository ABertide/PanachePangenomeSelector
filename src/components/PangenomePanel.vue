<template>
    <div v-if="pangenomesToTable">
        <h2 class="mb-4">Pangenome Panel</h2>
        <v-file-input class="mb-5" v-model="pangenomeFile" accept=".csv, .tsv" label="Choose a file or drop it here..." show-size counter @change="onChangeFile"></v-file-input>
        <div class="mb-5">
            <h4>Chose Pangenomes</h4>
            <v-text-field v-model="pangenomeSearched" label="Enter a pangenome id"></v-text-field>
            <!-- <b-dropdown-divider></b-dropdown-divider> -->
        </div>
        <div>
            <h4>List of Pangenome</h4>

            <va-data-table
                :items="pangenomesToTable"
                :columns="headers"
                :selectable="true"
                v-model="selectedItems"
                select-mode="single"
                @mouseover="myRowHover($event)"
                @mouseout="myUnRowHover($event)"
                @selection-change="selectAction"
                @click="updateSelectPangenomes"
            >
                <template #cell(icon)="data">
                    <img style="height: 40px" :src="data.value" />
                </template>
                <template #cell(id)="data">
                    <span>{{ data.value }}</span>
                </template>
                <template #cell(panID)="data">
                    <span>{{ data.value }}</span>
                </template>
                <template #cell(date)="data">
                    <span>{{ data.value }}</span>
                </template>
            </va-data-table>
            <v-btn v-if="!submited" :color="isSubmitable ? 'secondary' : 'grey'" :disabled="isSubmitable ? false : true" @click="submit"> Submit </v-btn>
            <v-btn v-else disabled> Submited </v-btn>
        </div>
    </div>
</template>

<script>
    import { ref } from '@vue/reactivity';
    import { computed } from '@vue/runtime-core';
    import { useStore } from 'vuex';
    export default {
        setup() {
            const store = useStore();
            const pangenomeSearched = ref('');
            const pangenomeFile = ref([]);
            let fileinput = ref('');
            let submited = ref(false);
            let selectedItems = ref([]);
            const isSubmitable = computed(() => {
                if (selectedItems.value.length > 0) {
                    return true;
                } else {
                    return false;
                }
            });
            const assemblies = computed(() => {
                return store.state.assemblies.assemblies;
            });
            const assembliesSelected = computed(() => store.getters['assemblies/assembliesSelected']);
            // const selectable =
            const pangenomes = computed(() => store.state.pangenomes.pangenomes);
            let pangenomesToTable = computed(() => {
                let pangenomeList = pangenomes.value.map(pangenome => {
                    let percentage = 0;
                    if (assembliesSelected.value.length !== 0) {
                        const assemblyIntersect = assembliesSelected.value.filter(assembly => pangenome.assemblies.includes(assembly.assembly_name));
                        percentage = (assemblyIntersect.length / pangenome.assemblies.length) * 100;
                    }
                    const tableItem = {
                        percentage: Math.round(percentage),
                        id: pangenome.id,
                        panID: pangenome.name,
                        date: pangenome.creationDate
                    };
                    if (percentage === 0) {
                        tableItem['icon'] = require('@/assets/0.png');
                    } else if (percentage <= 25) {
                        tableItem['icon'] = require('@/assets/25.png');
                    } else if (percentage <= 50) {
                        tableItem['icon'] = require('@/assets/50.png');
                    } else if (percentage <= 75) {
                        tableItem['icon'] = require('@/assets/75.png');
                    } else {
                        tableItem['icon'] = require('@/assets/100.png');
                    }
                    return tableItem;
                });
                if (pangenomeSearched.value != null && pangenomeList != undefined) {
                    pangenomeList = pangenomeList.filter(pangenome => pangenome.panID.toLowerCase().indexOf(pangenomeSearched.value.trim().toLowerCase()) > -1);
                }
                return pangenomeList;
            });

            const pangenomesID = ref(pangenomesToTable.value.map(pangenome => pangenome.panID));
            // watch(selectedItems)
            const headers = computed(() => {
                const header = [
                    { key: 'icon', label: 'Assemblies selected', sortable: true },
                    { key: 'id', label: 'Id', sortable: true },
                    { key: 'panID', label: 'PanID', sortable: true },
                    { key: 'date', label: 'Creation Date', sortable: true }
                ];
                return header;
            });
            const submit = () => {
                submited.value = true;
            };

            const onChangeFile = e => {
                let files = e.target.files || e.dataTransfer.files;
                if (!files.length) return;
                createInput(files[0]);
            };

            const updateSelectPangenomes = () => {
                const currentSelectedPangenome = selectedItems.value[0];
                if (currentSelectedPangenome !== undefined) {
                    store.dispatch('pangenomes/updateIsSelectedStateAction', currentSelectedPangenome);
                }
            };

            const createInput = file => {
                let promise = new Promise(resolve => {
                    var reader = new FileReader();
                    reader.onload = () => {
                        resolve((fileinput = reader.result));
                    };
                    reader.readAsText(file);
                });

                promise.then(
                    () => {
                        /* handle a successful result */
                        let lines = fileinput.split('\n');
                        let pangenomes = lines.map(line => {
                            if (!line.startsWith('id') && line.length !== 0) {
                                let cols = line.split('\t');
                                let pangenome = {
                                    id: parseInt(cols[0]),
                                    name: cols[1],
                                    assemblies: cols[2].split(',').map(assembly => assembly.replace(/\s/g, '')),
                                    creationDate: cols[3]
                                };
                                return pangenome;
                            }
                        });
                        pangenomes = pangenomes.filter(pangenome => pangenome !== undefined);
                        let pangenomesObjects = pangenomes.map(pangenome => {
                            pangenome['selected'] = false;
                            return pangenome;
                        });
                        store.dispatch('pangenomes/updatePangenomesAction', pangenomesObjects);
                    },
                    error => {
                        /* handle an error */
                        console.error(error);
                    }
                );
            };
            const myRowHover = e => {
                let outerText = '';
                if (e.target.__vnode.type === 'td') {
                    // line table case
                    outerText = e.target.parentElement.outerText;
                } else if (e.target.className === 'va-checkbox__input-container') {
                    // Checkbox case

                    outerText = e.target.parentElement.parentElement.parentElement.outerText;
                    console.log(outerText);
                } else if (e.target.className === 'va-checkbox__square') {
                    // Checkbox case

                    outerText = e.target.parentElement.parentElement.parentElement.parentElement.outerText;
                } else {
                    // span into line table case
                    outerText = e.target.parentElement.parentElement.outerText;
                }

                if (outerText.startsWith('check') && outerText !== 'check') {
                    // Do it only for table content not header
                    const panID = outerText.split('\t')[3];
                    const assemblies_names = assemblies.value.filter(assembly => assembly.pangenome.includes(panID)).map(assembly => assembly.assembly_name);
                    const pangenomeSelected = pangenomes.value.filter(pangenome => pangenome.selected);
                    if (pangenomeSelected.length === 0) {
                        store.state.chart.chart.instance
                            .series()
                            .points(p => assemblies_names.includes(p.name) && p.selected === true)
                            .options({ color: '#c95e00' });
                        store.state.chart.chart.instance
                            .series()
                            .points(p => assemblies_names.includes(p.name) && p.selected === false)
                            .options({ color: 'gray' });
                    } else {
                        const assembliesSelected = pangenomeSelected.map(pangenome => pangenome.assemblies).flat();
                        store.state.chart.chart.instance
                            .series()
                            .points(p => assemblies_names.includes(p.name) && assembliesSelected.includes(p.name))
                            .options({ color: 'black' });
                        store.state.chart.chart.instance
                            .series()
                            .points(p => assemblies_names.includes(p.name) && p.selected === true && !assembliesSelected.includes(p.name))
                            .options({ color: 'blue' });
                        store.state.chart.chart.instance
                            .series()
                            .points(p => !assemblies_names.includes(p.name) && p.selected === true && assembliesSelected.includes(p.name))
                            .options({ color: '#c95e00' });
                        store.state.chart.chart.instance
                            .series()
                            .points(p => assemblies_names.includes(p.name) && p.selected === false && !assembliesSelected.includes(p.name))
                            .options({ color: 'blue' });
                        store.state.chart.chart.instance
                            .series()
                            .points(p => !assemblies_names.includes(p.name) && p.selected === false && assembliesSelected.includes(p.name))
                            .options({ color: '#ffda8f' });
                    }
                }
            };
            const selectAction = SelectionChangeEmit => {
                const currentPangenome = SelectionChangeEmit.currentSelectedItems[0];
                const previousPangenome = SelectionChangeEmit.previousSelectedItems[0];
                if (previousPangenome !== undefined && currentPangenome !== undefined) {
                    if (previousPangenome.panID === currentPangenome.panID) {
                        store.dispatch('pangenomes/updateIsNotSelectedStateAction', currentPangenome);
                        selectedItems.value = [];
                    }
                }
            };
            const myUnRowHover = () => {
                const pangenomeSelected = pangenomes.value.filter(pangenome => pangenome.selected);
                let pangenomeAssembliesSelected = pangenomeSelected.map(pangenome => pangenome.assemblies).flat();
                store.state.chart.chart.instance
                    .series()
                    .points(p => p.selected === true)
                    .options({ color: 'gray' });
                if (pangenomeAssembliesSelected.length > 0) {
                    store.state.chart.chart.instance
                        .series()
                        .points(p => p.selected === false && pangenomeAssembliesSelected.includes(p.name))
                        .options({ color: 'black' });
                    store.state.chart.chart.instance
                        .series()
                        .points(p => p.selected === false && !pangenomeAssembliesSelected.includes(p.name))
                        .options({ color: '#cad2e0' });
                } else {
                    store.state.chart.chart.instance
                        .series()
                        .points(p => p.selected === false)
                        .options({ color: 'black' });
                }
            };

            return {
                pangenomeSearched,
                pangenomeFile,
                isSubmitable,
                pangenomes,
                headers,
                selectedItems,
                pangenomesToTable,
                submited,
                submit,
                pangenomesID,
                onChangeFile,
                myUnRowHover,
                myRowHover,
                assembliesSelected,
                selectAction,
                updateSelectPangenomes
            };
        }
    };
</script>

<style scoped></style>

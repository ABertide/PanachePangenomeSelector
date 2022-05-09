<template>
    <div>
        <h2>Assemblies Table</h2>
        <v-dialog v-model="showModal" max-width="290">
            <v-card>
                <v-card-title class="text-h5"> Heteroic group filter </v-card-title>

                <v-card-text>
                    <h3>Chose heterotic groups to display</h3>
                    <v-checkbox v-for="option in heteroticGroups" :key="option.value" v-model="selected" :label="option" :value="option" hide-details></v-checkbox>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn color="green darken-1" text @click="showModalAction"> Close </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- <va-data-table :items="assembliesTable" :columns="headers" :selectable="false" v-model="selectedItems" select-mode="multiple"> -->
        <va-data-table :items="assembliesTable" :columns="headers" :hoverable="true" @mouseover="myRowHover($event)" @mouseout="myUnRowHover($event)">
            <template #cell(selected)="data">
                <va-checkbox v-model="selectedItems" :array-value="data.cells[2].value" @click="selectAction(data.cells[2].value)" />
            </template>
            <template #header(id)="data">
                <div>
                    <span @click="sortCol(data.label)"
                        >{{ data.label }} <v-icon large>{{ chevrons.id }}</v-icon></span
                    >
                </div>
            </template>
            <template #cell(id)="data">
                <div>
                    <span>{{ data.value }}</span>
                </div>
            </template>
            <template #cell(assemblyName)="data">
                <span>{{ data.value }}</span>
            </template>
            <template #header(assemblyName)="data">
                <div class="row">
                    <span class="mr-1" id="header-title" @click="sortCol(data.label)"
                        >{{ data.label }} <v-icon large>{{ chevrons.assemblyName }}</v-icon></span
                    >
                    <va-input placeholder="Filter..." v-model="assemblyNameFilter" />
                </div>
            </template>
            <template #cell(phenotype)="data">
                <span>{{ data.value }}</span>
            </template>
            <template #header(phenotype)="data">
                <div class="row">
                    <span class="mr-1" id="header-title" @click="sortCol(data.label)"
                        >{{ data.label }} <v-icon large>{{ chevrons.phenotype }}</v-icon></span
                    >

                    <va-input placeholder="Filter..." v-model="phenotypeFilter" />
                </div>
            </template>
            <template #cell(pangenome)="data">
                <span>{{ data.value }}</span>
            </template>
            <template #header(pangenome)="data">
                <div class="row align-items-center">
                    <span class="mr-1" id="header-title" @click="sortCol(data.label)"
                        >{{ data.label }} <v-icon large>{{ chevrons.pangenome }}</v-icon></span
                    >
                    <va-input placeholder="Filter..." v-model="pangenomeFilter" />
                </div>
            </template>
            <template #cell(heteroticGroup)="data">
                <span>{{ data.value }}</span>
            </template>
            <template #header(heteroticGroup)="data">
                <span id="tooltip-target-1" @click="showModalAction()">{{ data.label }}</span>
            </template>
        </va-data-table>
    </div>
</template>

<script>
    import { ref } from '@vue/reactivity';
    import { computed } from '@vue/runtime-core';
    import { useStore } from 'vuex';
    export default {
        setup() {
            const selectedItems = ref([]);
            const selected = ref([]);
            const store = useStore();
            const assemblyNameFilter = ref('');
            const phenotypeFilter = ref('');
            const pangenomeFilter = ref('');
            const showModal = ref(false);
            let directionLastSorted = ref('');
            let sortBy = ref('');
            const chevrons = ref({ assemblyName: 'mdi-chevron-down', selected: 'mdi-chevron-down', id: 'mdi-chevron-down', phenotype: 'mdi-chevron-down', pangenome: 'mdi-chevron-down' });

            const headers = ref([
                { key: 'selected', label: '', sortable: false },
                { key: 'id', label: 'Id', sortable: false },
                { key: 'assemblyName', label: 'Assembly Name', sortable: false },
                { key: 'phenotype', label: 'Phenotype', sortable: false },
                { key: 'pangenome', label: 'Pangenome', sortable: false },
                { key: 'heteroticGroup', label: 'Heterotic Group', sortable: false }
            ]);

            const assemblies = computed(() => {
                if (selected.value.length !== 0) {
                    return store.state.assemblies.assemblies.filter(assembly => {
                        return (
                            assembly.heterotic_group.filter(hg => {
                                return selected.value.includes(hg);
                            }).length !== 0
                        );
                    });
                } else {
                    return store.state.assemblies.assemblies;
                }
            });

            const showModalAction = () => {
                showModal.value = !showModal.value;
            };

            const assembliesTable = computed(() => {
                // Reformat input information
                let assembliesToTable = assemblies.value.map(assembly => {
                    return {
                        id: assembly.id,
                        assemblyName: assembly.assembly_name,
                        phenotype: assembly.phenotype,
                        pangenome: assembly.pangenome.join(', '),
                        heteroticGroup: assembly.heterotic_group.join(', '),
                        color: assembly.color,
                        selected: assembly.selected,
                        overMoused: assembly.overMoused
                    };
                });
                // Filtering on assemblies table
                if (assemblyNameFilter.value !== '') {
                    assembliesToTable = assembliesToTable.filter(assembly => {
                        return assembly.assemblyName.toLowerCase().includes(assemblyNameFilter.value.toLowerCase());
                    });
                }
                if (phenotypeFilter.value !== '') {
                    assembliesToTable = assembliesToTable.filter(assembly => {
                        return assembly.phenotype.toLowerCase().includes(phenotypeFilter.value.toLowerCase());
                    });
                }
                if (pangenomeFilter.value !== '') {
                    assembliesToTable = assembliesToTable.filter(assembly => {
                        return assembly.pangenome.toLowerCase().includes(pangenomeFilter.value.toLowerCase());
                    });
                }
                if (sortBy.value !== '' && assembliesToTable.length !== 0) {
                    if (directionLastSorted.value === 'ascd') {
                        // assembliesToTable = assembliesToTable.sort((a, b) => (a[sortBy.value] > b[sortBy.value] ? 1 : b[sortBy.value] > a[sortBy.value] ? -1 : 0));
                        // natsort
                        assembliesToTable = assembliesToTable.sort((a, b) =>
                            a[sortBy.value].localeCompare(b[sortBy.value], navigator.languages[0] || navigator.language, { numeric: true, ignorePunctuation: true })
                        );
                    } else {
                        assembliesToTable = assembliesToTable.sort(
                            (a, b) => a[sortBy.value].localeCompare(b[sortBy.value], navigator.languages[0] || navigator.language, { numeric: true, ignorePunctuation: true }) * -1
                        );
                    }
                }

                return assembliesToTable;
            });

            const heteroticGroups = computed(() => {
                return [
                    ...new Set(
                        store.state.assemblies.assemblies
                            .map(assembly => {
                                return assembly.heterotic_group;
                            })
                            .flat()
                    )
                ];
            });
            const sortCol = chevron => {
                chevron = chevron.replace(/\s/g, '');
                chevron = chevron[0].toLowerCase() + chevron.slice(1);
                sortBy.value = chevron;
                if (chevrons.value[sortBy.value] === 'mdi-chevron-down') {
                    chevrons.value[sortBy.value] = 'mdi-chevron-up';
                    directionLastSorted.value = 'ascd';
                } else {
                    chevrons.value[sortBy.value] = 'mdi-chevron-down';
                    directionLastSorted.value = 'descd';
                }
            };

            const selectAction = assemblyNameSelected => {
                const assembly = assemblies.value.filter(assembly => assembly.assembly_name === assemblyNameSelected)[0];
                if (assembly.selected) {
                    store.dispatch('assemblies/updateIsNotSelectedStateAction', assembly);
                    store.state.chart.chart.instance
                        .series()
                        .points(p => p.name === assembly.assembly_name)
                        .options({ color: 'black', selected: false });
                } else {
                    store.dispatch('assemblies/updateIsSelectedStateAction', assembly);
                    store.state.chart.chart.instance
                        .series()
                        .points(p => p.name === assembly.assembly_name)
                        .options().items[0].userOptions.marker.outline.color = 'gray';
                    store.state.chart.chart.instance
                        .series()
                        .points(p => p.name === assembly.assembly_name)
                        .options({ color: 'gray', selected: true });
                }
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
                    const assemblyNameSelected = outerText.split('\t')[2];
                    const assembly = assemblies.value.filter(assembly => assembly.assembly_name === assemblyNameSelected)[0];
                    // e.overMoused = true;
                    store.state.chart.chart.instance
                        .series()
                        .points(p => p.name === assembly.assembly_name)
                        .options({ color: assembly.color });
                }
            };
            const myUnRowHover = e => {
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
                    console.log(outerText);
                    const assemblyNameSelected = outerText.split('\t')[2];
                    const assembly = assemblies.value.filter(assembly => assembly.assembly_name === assemblyNameSelected)[0];
                    // e.overMoused = false;
                    store.state.chart.chart.instance
                        .series()
                        .points(p => p.name === assembly.assembly_name && !p.selected)
                        .options({ color: 'black' });
                    store.state.chart.chart.instance
                        .series()
                        .points(p => p.name === assembly.assembly_name && p.selected)
                        .options({ color: 'gray' });
                }
            };

            return {
                selectedItems,
                selected,
                assemblies,
                headers,
                assembliesTable,
                showModal,
                showModalAction,
                heteroticGroups,
                selectAction,
                myUnRowHover,
                myRowHover,
                assemblyNameFilter,
                phenotypeFilter,
                pangenomeFilter,
                sortCol,
                chevrons
            };
        }
    };
</script>

<style scoped>
    #header-title {
        flex-grow: 0;
        display: inline-flex;
        align-items: center;
    }
</style>

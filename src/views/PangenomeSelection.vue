<template>
    <!-- Pangenome selector Contenor -->
    <div class="Home">
        <h1>Pangenome Selector</h1>
        <!-- Assemblies Input File -->
        <v-file-input class="mb-5" v-model="assembliesFile" accept=".csv, .tsv" label="Choose a file or drop it here..." show-size counter @change="onFileChange"></v-file-input>
        <v-row>
            <!-- Chart and Assemblies Table -->
            <v-col>
                <PcaCharts />
                <AssembliesTable />
            </v-col>
            <!-- Pangenome Table -->
            <v-col lg="3" md="4">
                <PangenomePanel />
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';
    import { ref } from '@vue/reactivity';
    import { computed } from '@vue/runtime-core';
    import { useStore } from 'vuex';

    // Components
    import PangenomePanel from '../components/PangenomePanel.vue';
    import AssembliesTable from '../components/AssembliesTable.vue';
    import PcaCharts from '../components/PcaCharts.vue';

    export default defineComponent({
        name: 'PangenomeSelection',

        components: { AssembliesTable, PangenomePanel, PcaCharts },
        setup() {
            const store = useStore();
            // File value
            const assembliesFile = ref([]);
            let fileinput = ref('');

            // Assemblies File upload
            const onFileChange = e => {
                // Get file by events
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length) return;
                createInput(files[0]);
            };

            const createInput = file => {
                // Input reading
                let promise = new Promise(resolve => {
                    var reader = new FileReader();
                    reader.onload = () => {
                        resolve((fileinput = reader.result));
                    };
                    reader.readAsText(file);
                });

                promise.then(
                    () => {
                        // Input Parsing
                        let lines = fileinput.split('\n');
                        let assemblies = lines.map(line => {
                            if (!line.startsWith('id') && line.length !== 0) {
                                let cols = line.split('\t');
                                let assembly = {
                                    id: parseInt(cols[0]),
                                    x: parseFloat(cols[1]),
                                    y: parseFloat(cols[2]), // Float to include values between 0 to 1
                                    assembly_name: cols[3],
                                    phenotype: cols[4],
                                    pangenome: cols[5].split(', '),
                                    heterotic_group: cols[6].split(', '),
                                    majore: cols[7]
                                };
                                return assembly;
                            }
                        });
                        // Filter assemblies badly loaded
                        assemblies = assemblies.filter(assembly => assembly !== undefined);
                        let colors = [];
                        let assembliesObjects = assemblies.map(assembly => {
                            // Add metadata
                            assembly['color'] = 'black';
                            assembly['metadata'] = 'heterotic_group';
                            assembly['selected'] = false;
                            assembly['overMoused'] = false;
                            if (assembly.majore !== undefined) {
                                if (assembly.majore.toLowerCase().replace(/\s+/g, '') === 'true') {
                                    assembly['majore'] = true;
                                } else {
                                    assembly['majore'] = false;
                                }
                            } else {
                                assembly['majore'] = false;
                            }
                            return assembly;
                        });
                        // Get all heterotic group
                        let heterotic_group = [...new Set(assembliesObjects.map(assembly => String(...assembly.heterotic_group)))];

                        // Get color by hetoric group
                        new Set(heterotic_group.map(() => colors.push(generateColor())));
                        assembliesObjects.map(assembly => {
                            assembly['color'] = colors[heterotic_group.indexOf(assembly[assembly['metadata']][0])];
                        });

                        // Add assemblies to store
                        store.dispatch('assemblies/updateAssembliesAction', assembliesObjects);

                        // Get assemblies stored
                        const assembliesStored = computed(() => store.state.assemblies.assemblies);

                        // add Assemblies to chart
                        // Serie creation
                        let series = addSeries(assembliesStored.value);
                        // Add serie into instance
                        series.forEach(serie => store.state.chart.chart.instance.series.add(serie));
                    },
                    error => {
                        /* handle an error */
                        console.error(error);
                    }
                );
            };

            const pangenomesSelectedStored = computed(() => {
                return store.getters['pangenomes/pangenomesSelected'];
            });

            // Color Generator
            const generateColor = () => {
                let newColor = '#' + ((Math.random() * 0xffffff) << 0).toString(16);
                return newColor;
            };

            // Set series for chart
            const addSeries = newAssemblies => {
                // Serie is an object with a list of points
                let assembliesByMetadata = [];
                let metadatas = [];

                // Chart stored and initiated in PcaChart component
                let chart = store.state.chart.chart;

                if (newAssemblies !== undefined) {
                    newAssemblies.forEach(assembly => {
                        // Get all metadata value (default is Heterotic group value)
                        metadatas.push(...assembly[assembly.metadata]);
                    });
                    // Get Unique value
                    metadatas = [...new Set(metadatas)];

                    // Ordered assemblies by metadata in Objects
                    // [
                    //     {
                    //      metadataName: metadata_1,
                    //      assemblies: [assembly_1, ...]
                    //     }
                    // ]
                    metadatas.forEach(metadata => assembliesByMetadata.push({ metadataName: metadata, assemblies: newAssemblies.filter(assembly => assembly[assembly.metadata].includes(metadata)) }));

                    let series = [];
                    assembliesByMetadata.forEach(metadata => {
                        // Each metadata (each serie)
                        let pointsAdded = [];
                        metadata.assemblies.forEach(assembly => {
                            // Points setting

                            let markerType = 'circle';
                            let pointLabel = '';
                            let defaultColor = '#cad2e0';
                            if (assembly.selected) {
                                defaultColor = '#cad2e0';
                            }
                            if (assembly.majore === true) {
                                markerType = 'square';
                                pointLabel = assembly.assembly_name;
                            }
                            // Get point if the current assembly is already set in another serie
                            let assemblyTreated = series.map(serie => {
                                let currentSerie = serie.points.map(point => {
                                    if (point !== undefined) {
                                        return point.name;
                                    }
                                });
                                if (currentSerie !== undefined) {
                                    return currentSerie;
                                }
                            });

                            let PointObj = {
                                // Point himself
                                // Point arguments
                                x: assembly.x,
                                y: assembly.y,
                                name: assembly.assembly_name,
                                color: defaultColor,
                                marker: { type: markerType },
                                // Default color
                                metadata: assembly.color,
                                label: {
                                    text: pointLabel,
                                    align: 'center',
                                    color: '#cad2e0'
                                },
                                selected: assembly.selected,
                                events: {
                                    // all events related to chart
                                    // "this" is particular, it don't refered to the website, but the "this" keyword refers to the clicked/hovered/... point object.
                                    // !!!! function have to be defined in this space not outside like a methods !!!!
                                    mouseOver: function () {
                                        // changing hovered state in to store for the current assembly
                                        store.dispatch('assemblies/updateOverMousedStateAction', assembly);

                                        // Set color for the current point
                                        this.series.currentOptions.color = assembly.color;

                                        // Set color for all points with the same metadata
                                        chart.instance
                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                            .points()
                                            .items.forEach(point => {
                                                chart.instance
                                                    .series(s => assembly[assembly.metadata].includes(s.name))
                                                    .points(allPoint => allPoint.name === point.name)
                                                    .options({ color: point.currentOptions.metadata });
                                            });
                                        chart.instance
                                            .series(s => !assembly[assembly.metadata].includes(s.name))
                                            .points()
                                            .items.forEach(point => {
                                                chart.instance
                                                    .series(s => !assembly[assembly.metadata].includes(s.name))
                                                    .points(allPoint => allPoint.name === point.name)
                                                    .options({ color: '#cad2e0' });
                                            });
                                    },
                                    mouseOut: function () {
                                        // Redo all colors

                                        this.currentOptions.marker.outline.color = 'gray';

                                        // For all points with the same metadata
                                        chart.instance
                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                            .points()
                                            .items.forEach(point => {
                                                if (pangenomesSelectedStored.value.length === 0) {
                                                    if (point.selected) {
                                                        // Gray if it's selected
                                                        chart.instance
                                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                                            .points(allPoint => allPoint.name === point.name)
                                                            .options({ color: '#c95e00' });
                                                    } else {
                                                        // Else Black
                                                        chart.instance
                                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                                            .points(allPoint => allPoint.name === point.name)
                                                            .options({ color: '#cad2e0' });
                                                    }
                                                } else {
                                                    chart.instance
                                                        .series()
                                                        .points(allPoint => pangenomesSelectedStored.value[0].assemblies.includes(allPoint.name))
                                                        .options({ color: 'black' });

                                                    if (point.selected) {
                                                        // Gray if it's selected
                                                        chart.instance
                                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                                            .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: '#c95e00' });
                                                        chart.instance
                                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                                            .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: 'black' });
                                                    } else {
                                                        // Else Black
                                                        chart.instance
                                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                                            .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: '#cad2e0' });
                                                        chart.instance
                                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                                            .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: 'black' });
                                                    }
                                                }
                                            });

                                        if (this.series.points(p => p.name === assembly.assembly_name)) {
                                            // for the current point only
                                            this.series
                                                .points(p => p.name === assembly.assembly_name)
                                                .items.forEach(point => {
                                                    store.dispatch('assemblies/updateNoMoreOverMousedStateAction', assembly);
                                                    if (pangenomesSelectedStored.value.length === 0) {
                                                        if (point.selected) {
                                                            this.series.points(allPoint => allPoint.name === point.name).options({ color: '#c95e00' });
                                                        } else {
                                                            this.series.points(allPoint => allPoint.name === point.name).options({ color: '#cad2e0' });
                                                        }
                                                    } else {
                                                        if (point.selected) {
                                                            this.series
                                                                .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                                .options({ color: '#c95e00' });
                                                            this.series
                                                                .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                                .options({ color: 'black' });
                                                        } else {
                                                            this.series
                                                                .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                                .options({ color: '#cad2e0' });
                                                            this.series
                                                                .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                                .options({ color: 'black' });
                                                        }
                                                    }
                                                });
                                        }
                                        // for all other points
                                        this.series
                                            .points(p => p.name !== assembly.assembly_name)
                                            .items.forEach(point => {
                                                if (pangenomesSelectedStored.value.length === 0) {
                                                    if (point.selected) {
                                                        this.series.points(allPoint => allPoint.name === point.name).options({ color: '#c95e00' });
                                                    } else {
                                                        this.series.points(allPoint => allPoint.name === point.name).options({ color: '#cad2e0' });
                                                    }
                                                } else {
                                                    if (point.selected) {
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: '#c95e00' });
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: 'black' });
                                                    } else {
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: '#cad2e0' });
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: 'black' });
                                                    }
                                                }
                                            });
                                    },
                                    click: function () {
                                        // On clicked point
                                        // For the current point
                                        this.series
                                            .points(p => p.name === assembly.assembly_name)
                                            .items.forEach(point => {
                                                if (pangenomesSelectedStored.value.length === 0) {
                                                    if (point.selected) {
                                                        store.dispatch('assemblies/updateIsNotSelectedStateAction', assembly);
                                                        // If it was selected -> unselect this point
                                                        point.series.currentOptions.color = '#cad2e0';
                                                        this.series.points(allPoint => allPoint.name === point.name).options({ color: '#cad2e0', selected: assembly.selected });
                                                        this.userOptions.marker.outline.color = 'white';
                                                    } else {
                                                        // If it was unselect -> select
                                                        store.dispatch('assemblies/updateIsSelectedStateAction', assembly);
                                                        point.series.currentOptions.color = '#c95e00';
                                                        this.series.points(allPoint => allPoint.name === point.name).options({ color: '#c95e00', selected: assembly.selected });
                                                        this.userOptions.marker.outline.color = 'gray';
                                                    }
                                                } else {
                                                    if (point.selected) {
                                                        store.dispatch('assemblies/updateIsNotSelectedStateAction', assembly);
                                                        // If it was selected -> unselect this point
                                                        if (!pangenomesSelectedStored.value[0].assemblies.includes(point.name)) {
                                                            point.series.currentOptions.color = '#c95e00';
                                                        } else {
                                                            point.series.currentOptions.color = 'black';
                                                        }
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: '#cad2e0', selected: assembly.selected });
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: 'black', selected: assembly.selected });
                                                        this.userOptions.marker.outline.color = 'white';
                                                    } else {
                                                        // If it was unselect -> select
                                                        store.dispatch('assemblies/updateIsSelectedStateAction', assembly);
                                                        if (!pangenomesSelectedStored.value[0].assemblies.includes(point.name)) {
                                                            point.series.currentOptions.color = '#c95e00';
                                                        } else {
                                                            point.series.currentOptions.color = 'black';
                                                        }
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: '#c95e00', selected: assembly.selected });
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: 'black', selected: assembly.selected });
                                                        this.userOptions.marker.outline.color = 'gray';
                                                    }
                                                }
                                            });
                                        // For other points
                                        this.series
                                            .points(p => p.name !== assembly.assembly_name)
                                            .items.forEach(point => {
                                                // Keep colors
                                                if (pangenomesSelectedStored.value.length === 0) {
                                                    if (point.selected) {
                                                        this.series.currentOptions.color = '#c95e00';
                                                        this.series.points(allPoint => allPoint.name === point.name).options({ color: '#c95e00' });
                                                    } else {
                                                        this.series.currentOptions.color = '#cad2e0';
                                                        this.series.points(allPoint => allPoint.name === point.name).options({ color: '#cad2e0' });
                                                    }
                                                } else {
                                                    if (point.selected) {
                                                        if (!pangenomesSelectedStored.value[0].assemblies.includes(point.name)) {
                                                            point.series.currentOptions.color = '#c95e00';
                                                        } else {
                                                            point.series.currentOptions.color = 'black';
                                                        }
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: '#c95e00' });
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: 'black' });
                                                    } else {
                                                        if (!pangenomesSelectedStored.value[0].assemblies.includes(point.name)) {
                                                            point.series.currentOptions.color = '#cad2e0';
                                                        } else {
                                                            point.series.currentOptions.color = 'black';
                                                        }
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && !pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: '#cad2e0' });
                                                        this.series
                                                            .points(allPoint => allPoint.name === point.name && pangenomesSelectedStored.value[0].assemblies.includes(point.name))
                                                            .options({ color: 'black' });
                                                    }
                                                }
                                            });
                                    }
                                }
                            };

                            // Keep the assembly only if it's not treated
                            if (!assemblyTreated.flat().includes(assembly.assembly_name)) {
                                pointsAdded.push(PointObj);
                            }
                        });
                        // Add serie
                        series.push({
                            id: metadata.metadataName,
                            name: metadata.metadataName,
                            type: 'marker',
                            pointMarker: 'circle',
                            defaultPoint: {
                                marker: { size: 11, outline: { width: 2, color: 'white' } }
                            },
                            color: 'black',
                            points: pointsAdded
                        });
                    });
                    // Return series if assemblies is defined
                    return series;
                } else {
                    // else Return empty list
                    return [];
                }
            };

            return { assembliesFile, fileinput, onFileChange };
        }
    });
</script>

<style scoped></style>

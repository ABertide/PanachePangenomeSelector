<template>
    <div class="Home">
        <h1>Pangenome Selector</h1>
        <v-file-input class="mb-5" v-model="assembliesFile" accept=".csv, .tsv" label="Choose a file or drop it here..." show-size counter @change="onFileChange"></v-file-input>
        <v-row>
            <v-col><PcaCharts /> <AssembliesTable /></v-col>
            <v-col lg="3" md="4">
                <PangenomePanel />
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';
    import { ref } from '@vue/reactivity';

    // Components
    import PangenomePanel from '../components/PangenomePanel.vue';
    import AssembliesTable from '../components/AssembliesTable.vue';
    import PcaCharts from '../components/PcaCharts.vue';
    // import addSeries from '@/mixins/chartFunctions.js';
    import { useStore } from 'vuex';

    export default defineComponent({
        name: 'PangenomeSelection',

        components: { AssembliesTable, PangenomePanel, PcaCharts },
        setup() {
            const assembliesFile = ref([]);
            let fileinput = ref('');
            const store = useStore();

            const generateColor = () => {
                let newColor = '#' + ((Math.random() * 0xffffff) << 0).toString(16);
                return newColor;
            };

            const onFileChange = e => {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length) return;
                createInput(files[0]);
            };

            const addSeries = newAssemblies => {
                let assembliesByMetadata = [];
                let metadatas = [];
                let chart = store.state.chart.chart;
                if (newAssemblies !== undefined) {
                    newAssemblies.forEach(assembly => {
                        metadatas.push(...assembly[assembly.metadata]);
                    });
                    metadatas = [...new Set(metadatas)];
                    metadatas.forEach(metadata => assembliesByMetadata.push({ metadataName: metadata, assemblies: newAssemblies.filter(assembly => assembly[assembly.metadata].includes(metadata)) }));

                    let series = [];
                    assembliesByMetadata.forEach(metadata => {
                        let pointsAdded = [];
                        metadata.assemblies.forEach(assembly => {
                            let markerType = 'circle';
                            let pointLabel = '';
                            let defaultColor = 'black';
                            if (assembly.selected) {
                                defaultColor = 'gray';
                            }
                            if (assembly.majore === true) {
                                markerType = 'square';
                                pointLabel = assembly.assembly_name;
                            }
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
                                x: assembly.x,
                                y: assembly.y,
                                name: assembly.assembly_name,
                                color: defaultColor,
                                marker: { type: markerType },
                                metadata: assembly.color,
                                label: {
                                    text: pointLabel, // Automatic alignment can be overwritten:
                                    align: 'center',
                                    color: 'black'
                                },
                                selected: assembly.selected,
                                events: {
                                    mouseOver: function () {
                                        store.dispatch('assemblies/updateOverMousedStateAction', assembly);
                                        this.series.currentOptions.color = assembly.color;
                                        chart.instance
                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                            .points()
                                            .items.forEach(point => {
                                                chart.instance
                                                    .series(s => assembly[assembly.metadata].includes(s.name))
                                                    .points(allPoint => allPoint.name === point.name)
                                                    .options({ color: point.currentOptions.metadata });
                                            });

                                        // this.series.points().options({ color: assembly.color });
                                    },
                                    mouseOut: function () {
                                        this.currentOptions.marker.outline.color = 'gray';
                                        chart.instance
                                            .series(s => assembly[assembly.metadata].includes(s.name))
                                            .points()
                                            .items.forEach(point => {
                                                if (point.selected) {
                                                    chart.instance
                                                        .series(s => assembly[assembly.metadata].includes(s.name))
                                                        .points(allPoint => allPoint.name === point.name)
                                                        .options({ color: 'gray' });
                                                } else {
                                                    chart.instance
                                                        .series(s => assembly[assembly.metadata].includes(s.name))
                                                        .points(allPoint => allPoint.name === point.name)
                                                        .options({ color: 'black' });
                                                }
                                            });
                                        if (this.series.points(p => p.name === assembly.assembly_name))
                                            this.series
                                                .points(p => p.name === assembly.assembly_name)
                                                .items.forEach(point => {
                                                    store.dispatch('assemblies/updateNoMoreOverMousedStateAction', assembly);
                                                    if (point.selected) {
                                                        this.series.points(allPoint => allPoint.name === point.name).options({ color: 'gray' });
                                                    } else {
                                                        this.series.points(allPoint => allPoint.name === point.name).options({ color: 'black' });
                                                    }
                                                });
                                        this.series
                                            .points(p => p.name !== assembly.assembly_name)
                                            .items.forEach(point => {
                                                if (point.selected) {
                                                    this.series.points(allPoint => allPoint.name === point.name).options({ color: 'gray' });
                                                } else {
                                                    this.series.points(allPoint => allPoint.name === point.name).options({ color: 'black' });
                                                }
                                            });
                                        // store.dispatch('updateNoMoreOverMousedStateAction', assembly);
                                    },
                                    click: function () {
                                        this.series
                                            .points(p => p.name === assembly.assembly_name)
                                            .items.forEach(point => {
                                                store.dispatch('assemblies/updateIsNotSelectedStateAction', assembly);
                                                if (point.selected) {
                                                    point.series.currentOptions.color = 'black';
                                                    this.series.points(allPoint => allPoint.name === point.name).options({ color: 'black', selected: assembly.selected });
                                                    this.userOptions.marker.outline.color = 'white';
                                                } else {
                                                    store.dispatch('assemblies/updateIsSelectedStateAction', assembly);
                                                    point.series.currentOptions.color = 'gray';
                                                    this.series.points(allPoint => allPoint.name === point.name).options({ color: 'gray', selected: assembly.selected });
                                                    this.userOptions.marker.outline.color = 'gray';
                                                }
                                            });
                                        this.series
                                            .points(p => p.name !== assembly.assembly_name)
                                            .items.forEach(point => {
                                                if (point.selected) {
                                                    this.series.currentOptions.color = 'gray';
                                                    this.series.points(allPoint => allPoint.name === point.name).options({ color: 'gray' });
                                                } else {
                                                    this.series.currentOptions.color = 'black';
                                                    this.series.points(allPoint => allPoint.name === point.name).options({ color: 'black' });
                                                }
                                            });
                                    }
                                }
                            };

                            if (!assemblyTreated.flat().includes(assembly.assembly_name)) {
                                pointsAdded.push(PointObj);
                            }
                        });
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
                    return series;
                    // return [];
                } else {
                    return [];
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
                        let assemblies = lines.map(line => {
                            if (!line.startsWith('id') && line.length !== 0) {
                                let cols = line.split('\t');
                                let assembly = {
                                    id: parseInt(cols[0]),
                                    x: parseInt(cols[1]),
                                    y: parseInt(cols[2]),
                                    assembly_name: cols[3],
                                    phenotype: cols[4],
                                    pangenome: cols[5].split(', '),
                                    heterotic_group: cols[6].split(', '),
                                    majore: cols[7]
                                };
                                return assembly;
                            }
                        });
                        assemblies = assemblies.filter(assembly => assembly !== undefined);
                        let colors = [];
                        let assembliesObjects = assemblies.map(assembly => {
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
                        let heterotic_group = [...new Set(assembliesObjects.map(assembly => String(...assembly.heterotic_group)))];

                        new Set(heterotic_group.map(() => colors.push(generateColor())));
                        assembliesObjects.map(assembly => {
                            assembly['color'] = colors[heterotic_group.indexOf(assembly[assembly['metadata']][0])];
                        });
                        store.dispatch('assemblies/updateAssembliesAction', assembliesObjects);
                        const assembliesStored = store.state.assemblies.assemblies;
                        let series = addSeries(assembliesStored);
                        series.forEach(serie => store.state.chart.chart.instance.series.add(serie));
                    },
                    error => {
                        /* handle an error */
                        console.error(error);
                    }
                );
            };
            return { assembliesFile, fileinput, onFileChange };
        }
    });
</script>

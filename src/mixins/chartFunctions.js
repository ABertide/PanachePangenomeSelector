// // import Name from '@/components/Name.vue';

// export default function () {
//     function addSeries(newAssemblies, store) {
//         let assembliesByMetadata = [];
//         let metadatas = [];
//         let chart = store.state.chart.chart;
//         if (newAssemblies !== undefined) {
//             newAssemblies.forEach(assembly => {
//                 metadatas.push(...assembly[assembly.metadata]);
//             });
//             metadatas = [...new Set(metadatas)];
//             metadatas.forEach(metadata => assembliesByMetadata.push({ metadataName: metadata, assemblies: newAssemblies.filter(assembly => assembly[assembly.metadata].includes(metadata)) }));

//             let series = [];
//             assembliesByMetadata.forEach(metadata => {
//                 let pointsAdded = [];
//                 metadata.assemblies.forEach(assembly => {
//                     let markerType = 'circle';
//                     let pointLabel = '';
//                     let defaultColor = 'black';
//                     if (assembly.selected) {
//                         defaultColor = 'gray';
//                     }
//                     if (assembly.majore === true) {
//                         markerType = 'square';
//                         pointLabel = assembly.assembly_name;
//                     }
//                     let assemblyTreated = series.map(serie => {
//                         let currentSerie = serie.points.map(point => {
//                             if (point !== undefined) {
//                                 return point.name;
//                             }
//                         });
//                         if (currentSerie !== undefined) {
//                             return currentSerie;
//                         }
//                     });
//                     let PointObj = {
//                         x: assembly.x,
//                         y: assembly.y,
//                         name: assembly.assembly_name,
//                         color: defaultColor,
//                         marker: { type: markerType },
//                         metadata: assembly.color,
//                         label: {
//                             text: pointLabel, // Automatic alignment can be overwritten:
//                             align: 'center',
//                             color: 'black'
//                         },
//                         selected: assembly.selected,
//                         events: {
//                             mouseOver: function () {
//                                 store.dispatch('updateOverMousedStateAction', assembly);
//                                 this.series.currentOptions.color = assembly.color;
//                                 chart.instance
//                                     .series(s => assembly[assembly.metadata].includes(s.name))
//                                     .points()
//                                     .items.forEach(point => {
//                                         chart.instance
//                                             .series(s => assembly[assembly.metadata].includes(s.name))
//                                             .points(allPoint => allPoint.name === point.name)
//                                             .options({ color: point.currentOptions.metadata });
//                                     });

//                                 // this.series.points().options({ color: assembly.color });
//                             },
//                             mouseOut: function () {
//                                 this.currentOptions.marker.outline.color = 'gray';
//                                 chart.instance
//                                     .series(s => assembly[assembly.metadata].includes(s.name))
//                                     .points()
//                                     .items.forEach(point => {
//                                         if (point.selected) {
//                                             chart.instance
//                                                 .series(s => assembly[assembly.metadata].includes(s.name))
//                                                 .points(allPoint => allPoint.name === point.name)
//                                                 .options({ color: 'gray' });
//                                         } else {
//                                             chart.instance
//                                                 .series(s => assembly[assembly.metadata].includes(s.name))
//                                                 .points(allPoint => allPoint.name === point.name)
//                                                 .options({ color: 'black' });
//                                         }
//                                     });
//                                 // if (this.series.points(p => p.name === assembly.assembly_name))
//                                 this.series
//                                     .points(p => p.name === assembly.assembly_name)
//                                     .items.forEach(point => {
//                                         store.dispatch('updateNoMoreOverMousedStateAction', assembly);
//                                         if (point.selected) {
//                                             this.series.points(allPoint => allPoint.name === point.name).options({ color: 'gray' });
//                                         } else {
//                                             this.series.points(allPoint => allPoint.name === point.name).options({ color: 'black' });
//                                         }
//                                     });
//                                 this.series
//                                     .points(p => p.name !== assembly.assembly_name)
//                                     .items.forEach(point => {
//                                         if (point.selected) {
//                                             this.series.points(allPoint => allPoint.name === point.name).options({ color: 'gray' });
//                                         } else {
//                                             this.series.points(allPoint => allPoint.name === point.name).options({ color: 'black' });
//                                         }
//                                     });
//                                 // store.dispatch('updateNoMoreOverMousedStateAction', assembly);
//                             },
//                             click: function () {
//                                 this.series
//                                     .points(p => p.name === assembly.assembly_name)
//                                     .items.forEach(point => {
//                                         store.dispatch('updateIsNotSelectedStateAction', assembly);
//                                         if (point.selected) {
//                                             point.series.currentOptions.color = 'black';
//                                             this.series.points(allPoint => allPoint.name === point.name).options({ color: 'black', selected: assembly.selected });
//                                             this.userOptions.marker.outline.color = 'white';
//                                         } else {
//                                             store.dispatch('updateIsSelectedStateAction', assembly);
//                                             point.series.currentOptions.color = 'gray';
//                                             this.series.points(allPoint => allPoint.name === point.name).options({ color: 'gray', selected: assembly.selected });
//                                             this.userOptions.marker.outline.color = 'gray';
//                                         }
//                                     });
//                                 this.series
//                                     .points(p => p.name !== assembly.assembly_name)
//                                     .items.forEach(point => {
//                                         if (point.selected) {
//                                             this.series.currentOptions.color = 'gray';
//                                             this.series.points(allPoint => allPoint.name === point.name).options({ color: 'gray' });
//                                         } else {
//                                             this.series.currentOptions.color = 'black';
//                                             this.series.points(allPoint => allPoint.name === point.name).options({ color: 'black' });
//                                         }
//                                     });
//                             }
//                         }
//                     };

//                     if (!assemblyTreated.flat().includes(assembly.assembly_name)) {
//                         pointsAdded.push(PointObj);
//                     }
//                 });
//                 series.push({
//                     id: metadata.metadataName,
//                     name: metadata.metadataName,
//                     type: 'marker',
//                     pointMarker: 'circle',
//                     defaultPoint: {
//                         marker: { size: 11, outline: { width: 2, color: 'white' } }
//                     },
//                     color: 'black',
//                     points: pointsAdded
//                 });
//             });
//             return series;
//         } else {
//             return [];
//         }
//     }
//     return addSeries();
// }

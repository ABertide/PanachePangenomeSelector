import { createStore } from 'vuex';
import pangenomes from '@/store/modules/pangenomes';
import assemblies from '@/store/modules/assemblies';
import chart from '@/store/modules/chart';

export default createStore({
    modules: { assemblies, pangenomes, chart }
});

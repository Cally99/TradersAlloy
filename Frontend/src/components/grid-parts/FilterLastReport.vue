<template lang="pug">
    v-container(class="ma-6 pa-0" style="width:200px;")
        div
            div(style="margin:5px; font-size:17px;") Last Report Date
            v-divider
            div(style="margin:5px; font-size:16px;") Filter
                v-radio-group(v-model="radioGroup" class="ms-12" style="margin-top:-2px;") 
                    v-radio(
                        v-for="n in radio_array"
                        :key="n"
                        :label="`${n}`"
                        :value="n"
                        @click="click(n)"
                    )
</template>

<script>
import Vue from 'vue';
import moment from 'moment';

export default Vue.extend({
    name: "FilterLastReport",
    components: {
    },
    beforeMount() {

    },
    computed: {
    },
    mounted() {
        // if (!this.setRange)
        //     this.params.context.componentParent.setFilter();
    },
    data() {
        return {
            radio_array: ['yesterday', '7 days ago', '30 days ago', 'no filter'],
            radioGroup: 'no filter',
            setRange: false,
            is_yesterday: false,
            is_7: false,
            is_30: false,
            is_nofilter: true,
            last_report_date: {last_report_date_filter: 'no filter'}
        };
    },
    methods: {
        click(param) {
            this.setRange = false;
            
            if (param == 'yesterday') {
                this.is_yesterday = true
                this.is_7 = false
                this.is_30 = false
                this.is_nofilter = false
                this.last_report_date.last_report_date_filter = 'yesterday'
            }
            if (param == '7 days ago') {
                this.is_yesterday = false
                this.is_7 = true
                this.is_30 = false
                this.is_nofilter = false
                this.last_report_date.last_report_date_filter = '7 days ago'
            }
            if (param == '30 days ago') {
                this.is_yesterday = false
                this.is_7 = false
                this.is_30 = true
                this.is_nofilter = false
                this.last_report_date.last_report_date_filter = '30 days ago'
            }
            if (param == 'no filter') {
                this.is_yesterday = false
                this.is_7 = false
                this.is_30 = false
                this.is_nofilter = true
                this.last_report_date.last_report_date_filter = 'no filter'
            }
            this.params.filterChangedCallback(this.last_report_date);
        },
        doesFilterPass(params) {
            if (params.data.last_report_date) {
                var date_data = new Date(params.data.last_report_date);
                if (this.is_yesterday) {
                    var yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                    return moment(date_data).isSame(yesterday)
                } else if (this.is_7) {
                    var days_7_ago = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    return moment(date_data).isAfter(days_7_ago)
                } else if (this.is_30) {
                    var days_30_ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    return moment(date_data).isAfter(days_30_ago)
                } else {
                    return true
                }
            } else {
                if (this.is_nofilter)
                    return true
            }
        },
        isFilterActive() {
            return true;
        },
        init (params) {            
            this.eGui = document.createElement('div');
            this.eGui.innerHTML =
                '<div>' +
                '  <v-range-slider /> Last Report' +
                '</div>';
        },
        getGui() {
            return this.eGui;
        },
        getModel() {
        },
        setModel(model) {
            if (model) {
                const filter = JSON.parse(this.params.context.componentParent.filters.filter);
                var last_report_date_saved = filter['last_report_date'] ? filter['last_report_date'] : 'no filter'
                this.radioGroup = last_report_date_saved
                this.last_report_date.last_report_date_filter = last_report_date_saved
                if (last_report_date_saved == 'yesterday') {
                    this.is_yesterday = true
                    this.is_7 = false
                    this.is_30 = false
                    this.is_nofilter = false
                }
                if (last_report_date_saved == '7 days ago') {
                    this.is_yesterday = false
                    this.is_7 = true
                    this.is_30 = false
                    this.is_nofilter = false
                }
                if (last_report_date_saved == '30 days ago') {
                    this.is_yesterday = false
                    this.is_7 = false
                    this.is_30 = true
                    this.is_nofilter = false
                }
                if (last_report_date_saved == 'no filter') {
                    this.is_yesterday = false
                    this.is_7 = false
                    this.is_30 = false
                    this.is_nofilter = true
                }
                this.params.filterChangedCallback(this.last_report_date);
            } else {
                this.radioGroup = 'no filter'
                this.last_report_date.last_report_date_filter = 'no filter'
                this.is_yesterday = false
                this.is_7 = false
                this.is_30 = false
                this.is_nofilter = true
                this.params.filterChangedCallback(this.last_report_date);
            }
        },
    },
});
</script>

<style scoped>
    .custom-menu-button.reset-button{
        right:10px;
        border: 1px solid #ABA5A5;
        background-color: #DADADA;
        color: black;
    }
    .left {
        overflow-y:scroll;
        width:50%;
    }
</style>

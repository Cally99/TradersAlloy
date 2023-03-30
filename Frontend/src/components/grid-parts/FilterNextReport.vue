<template lang="pug">
    v-container(class="ma-6 pa-0" style="width:200px;")
        div
            div(style="margin:5px; font-size:17px;") Next Report Date
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
    name: "FilterNextReport",
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
            radio_array: ['today', 'within 7 days', 'within 30 days', 'no filter'],
            radioGroup: 'no filter',
            setRange: false,
            is_today: false,
            is_7: false,
            is_30: false,
            is_nofilter: true,
            next_report_date: {next_report_date_filter: 'no filter'}
        };
    },
    methods: {
        click(param) {
            this.setRange = false;
            
            if (param == 'today') {
                this.is_today = true
                this.is_7 = false
                this.is_30 = false
                this.is_nofilter = false
                this.next_report_date.next_report_date_filter = 'today'
            }
            if (param == 'within 7 days') {
                this.is_today = false
                this.is_7 = true
                this.is_30 = false
                this.is_nofilter = false
                this.next_report_date.next_report_date_filter = 'within 7 days'
            }
            if (param == 'within 30 days') {
                this.is_today = false
                this.is_7 = false
                this.is_30 = true
                this.is_nofilter = false
                this.next_report_date.next_report_date_filter = 'within 30 days'
            }
            if (param == 'no filter') {
                this.is_today = false
                this.is_7 = false
                this.is_30 = false
                this.is_nofilter = true
                this.next_report_date.next_report_date_filter = 'no filter'
            }
            this.params.filterChangedCallback(this.next_report_date);
        },
        doesFilterPass(params) {
            if (params.data.next_report_date) {
                var date_data = new Date(params.data.next_report_date);
                if (this.is_today) {
                    var today_date = new Date(Date.now())
                    return moment(date_data).isSame(today_date, 'day')
                } else if (this.is_7) {
                    var days_7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    return moment(date_data).isBefore(days_7)
                } else if (this.is_30) {
                    var days_30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    return moment(date_data).isBefore(days_30)
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
                '  <v-range-slider /> Next Report' +
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
                var next_report_date_saved = filter['next_report_date'] ? filter['next_report_date'] : 'no filter'
                this.radioGroup = next_report_date_saved
                this.next_report_date.next_report_date_filter = next_report_date_saved
                if (next_report_date_saved == 'today') {
                    this.is_today = true
                    this.is_7 = false
                    this.is_30 = false
                    this.is_nofilter = false
                }
                if (next_report_date_saved == 'within 7 days') {
                    this.is_today = false
                    this.is_7 = true
                    this.is_30 = false
                    this.is_nofilter = false
                }
                if (next_report_date_saved == 'within 30 days') {
                    this.is_today = false
                    this.is_7 = false
                    this.is_30 = true
                    this.is_nofilter = false
                }
                if (next_report_date_saved == 'no filter') {
                    this.is_today = false
                    this.is_7 = false
                    this.is_30 = false
                    this.is_nofilter = true
                }
                this.params.filterChangedCallback(this.next_report_date);
            } else {
                this.radioGroup = 'no filter'
                this.next_report_date.next_report_date_filter = 'no filter'
                this.is_today = false
                this.is_7 = false
                this.is_30 = false
                this.is_nofilter = true
                this.params.filterChangedCallback(this.next_report_date);
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

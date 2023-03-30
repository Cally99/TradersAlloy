<template lang="pug">
    div(class="grey7 pa-6")
        v-container(class="ma-0 pa-0" style="width:250px;")
            div
                div(style="margin:5px; font-size:17px;") {{ $t('next_report_date') }}
                v-divider
                div(style="margin:5px; font-size:16px;") {{ $t('filter') }}
                    v-radio-group(v-model="radioGroup" class="ms-12" style="margin-top:-2px;") 
                        v-radio(
                            v-for="n in radio_array"
                            :key="n"
                            :label="`${n}`"
                            :value="n"
                            @click="click(n)"
                            color="blue3"
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
        canFilter() {
            return this.is_filter;
        },
    },
    mounted() {
        this.is_filter = true;
    },
    data() {
        return {
            radio_array: [this.$t('today'), this.$t('within_seven_days'), this.$t('within_thirty_days'), this.$t('no_filter')],
            radioGroup: this.$t('no_filter'),
            is_today: false,
            is_7: false,
            is_30: false,
            is_nofilter: true,
            next_report_date: {next_report_date_filter: this.$t('no_filter')},
            is_filter: false,
        };
    },
    watch: {
        canFilter(val) {
            if (val) {
                if (this.params.context.componentParent.filters.filter) {
                    let filter = this.params.context.componentParent.filters.filter;
                    filter = typeof filter === "object" ? filter : JSON.parse(filter);
                    
                    
                    var next_report_date_saved = filter['next_report_date'] ? filter['next_report_date'] : this.$t('no_filter');
                    this.radioGroup = next_report_date_saved;
                    this.next_report_date.next_report_date_filter = next_report_date_saved;
                    if (next_report_date_saved == this.$t('today')) {
                        this.clear();
                        this.is_today = true;
                    }
                    if (next_report_date_saved == this.$t('within_seven_days')) {
                        this.clear();
                        this.is_7 = true;
                    }
                    if (next_report_date_saved == this.$t('within_thirty_days')) {
                        this.clear();
                        this.is_30 = true;
                    }
                    if (next_report_date_saved == this.$t('no_filter')) {
                        this.clear();
                        this.is_nofilter = true;
                    }
                    this.params.filterChangedCallback(this.next_report_date);
                } else {
                    this.radioGroup = this.$t('no_filter');
                    this.next_report_date.next_report_date_filter = this.$t('no_filter');
                    this.clear();
                    this.is_nofilter = true;
                    this.params.filterChangedCallback(this.next_report_date);
                }
                this.is_filter = false;
            }
        }
    },
    methods: {
        clear() {
            this.is_today = false;
            this.is_7 = false;
            this.is_30 = false;
            this.is_nofilter = false;
        },
        click(param) {
            if (param == this.$t('today')) {
                this.clear();
                this.is_today = true;
                this.next_report_date.next_report_date_filter = this.$t('today');
            }
            if (param == this.$t('within_seven_days')) {
                this.clear();
                this.is_7 = true;
                this.next_report_date.next_report_date_filter = this.$t('within_seven_days');
            }
            if (param == this.$t('within_thirty_days')) {
                this.clear();
                this.is_30 = true;
                this.next_report_date.next_report_date_filter = this.$t('within_thirty_days');
            }
            if (param == this.$t('no_filter')) {
                this.clear();
                this.is_nofilter = true;
                this.next_report_date.next_report_date_filter = this.$t('no_filter');
            }
            this.params.filterChangedCallback(this.next_report_date);
        },
        doesFilterPass(params) {
            if (params.data.next_report_date) {
                var date_data = new Date(params.data.next_report_date);
                var today_date = new Date(Date.now());
                if (this.is_today) {
                    return moment(date_data).isSame(today_date, 'day');
                } else if (this.is_7) {
                    var days_7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    return moment(date_data).isBefore(days_7) && moment(date_data).isAfter(today_date);
                } else if (this.is_30) {
                    var days_30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    return moment(date_data).isBefore(days_30) && moment(date_data).isAfter(today_date);
                } else {
                    return true;
                }
            } else {
                if (this.is_nofilter)
                    return true;
            }
        },
        isFilterActive() {
            return true;
        },
        init (params) {            
            this.eGui = document.createElement('div');
            this.eGui.innerHTML =
                '<div>' +
                '  <v-range-slider /> ' + this.$t('next_report') +
                '</div>';
        },
        getGui() {
            return this.eGui;
        },
        getModel() {
        },
        setModel(model) {
            this.is_filter = true;
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

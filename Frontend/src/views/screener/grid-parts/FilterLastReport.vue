<template lang="pug">
    div(class="grey7 pa-6")
        v-container(class="ma-0 pa-0" style="width:250px;")
            div
                div(style="margin:5px; font-size:17px;") {{ $t('last_report_date') }}
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
    name: "FilterLastReport",
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
            radio_array: [this.$t('yesterday'), this.$t('seven_days_ago'), this.$t('thirty_days_ago'), this.$t('no_filter')],
            radioGroup: this.$t('no_filter'),
            is_yesterday: false,
            is_7: false,
            is_30: false,
            is_nofilter: true,
            last_report_date: {last_report_date_filter: this.$t('no_filter')},
            is_filter: false,
        };
    },
    watch: {
        canFilter(val) {
            if (val) {
                if (this.params.context.componentParent.filters.filter) {
                    let filter = this.params.context.componentParent.filters.filter;
                    filter = typeof filter === "object" ? filter : JSON.parse(filter);
                    
                    var last_report_date_saved = filter['last_report_date'] ? filter['last_report_date'] : this.$t('no_filter');
                    this.radioGroup = last_report_date_saved;
                    this.last_report_date.last_report_date_filter = last_report_date_saved;
                    if (last_report_date_saved == this.$t('yesterday')) {
                        this.clear();
                        this.is_yesterday = true;
                    }
                    if (last_report_date_saved == this.$t('seven_days_ago')) {
                        this.clear();
                        this.is_7 = true;
                    }
                    if (last_report_date_saved == this.$t('thirty_days_ago')) {
                        this.clear();
                        this.is_30 = true;
                    }
                    if (last_report_date_saved == this.$t('no_filter')) {
                        this.clear();
                        this.is_nofilter = true;
                    }
                    this.params.filterChangedCallback(this.last_report_date);
                } else {
                    this.radioGroup = this.$t('no_filter');
                    this.last_report_date.last_report_date_filter = this.$t('no_filter');
                    this.clear();
                    this.is_nofilter = true;
                    this.params.filterChangedCallback(this.last_report_date);
                }
                this.is_filter = false;
            }
        }
    },
    methods: {
        clear() {
            this.is_yesterday = false;
            this.is_7 = false;
            this.is_30 = false;
            this.is_nofilter = false;
        },
        click(param) {         
            if (param == this.$t('yesterday')) {
                this.clear();
                this.is_yesterday = true;
                this.last_report_date.last_report_date_filter = this.$t('yesterday')
            }
            if (param == this.$t('seven_days_ago')) {
                this.clear();
                this.is_7 = true;
                this.last_report_date.last_report_date_filter = this.$t('seven_days_ago')
            }
            if (param == this.$t('thirty_days_ago')) {
                this.clear();
                this.is_30 = true;
                this.last_report_date.last_report_date_filter = this.$t('thirty_days_ago')
            }
            if (param == this.$t('no_filter')) {
                this.clear();
                this.is_nofilter = true;
                this.last_report_date.last_report_date_filter = this.$t('no_filter')
            }
            this.params.filterChangedCallback(this.last_report_date);
        },
        doesFilterPass(params) {
            if (params.data.last_report_date) {
                var date_data = new Date(params.data.last_report_date);
                var yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
                if (this.is_yesterday) {
                    return moment(date_data).isSame(yesterday);
                } else if (this.is_7) {
                    var days_7_ago = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return moment(date_data).isAfter(days_7_ago) && moment(date_data).isBefore(yesterday);
                } else if (this.is_30) {
                    var days_30_ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    return moment(date_data).isAfter(days_30_ago) && moment(date_data).isBefore(yesterday);
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
                '  <v-range-slider /> ' + this.$t('last_report') +
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

<template lang="pug">
    div(class="pa-6")
        v-container(class="pa-0 exchange-container" style="width:290px; height:600px;")
            span(class="custom-menu-button reset-button" @click="filterReset") {{ $t('Reset') }}
            h3 {{ $t('sweden') }}
                div(v-for="item in swedens")
                    v-checkbox( v-model="item.checked" :label="item.label" class="ma-0 pa-0" @change="changeValue(item.label)")
            h3 {{ $t('finland') }}
                div(v-for="item in filands")
                    v-checkbox( v-model="item.checked" :label="item.label" class="ma-0 pa-0" @change="changeValue(item.label)")
            h3 {{ $t('norway') }}
                div(v-for="item in norways")
                    v-checkbox( v-model="item.checked" :label="item.label" class="ma-0 pa-0" @change="changeValue(item.label)")
            h3 {{ $t('denmark') }}
                div(v-for="item in denmarks")
                    v-checkbox( v-model="item.checked" :label="item.label" class="ma-0 pa-0" @change="changeValue(item.label)")

</template>

<script>
import Vue from 'vue';


export default Vue.extend({
    name: "FilterExchanges",
    mounted() {
        this.is_filter = true;
        this.swedens.forEach((item) => this.list.push(item.label));
        this.filands.forEach((item) => this.list.push(item.label));
        this.norways.forEach((item) => this.list.push(item.label));
        this.denmarks.forEach((item) => this.list.push(item.label));
    },
    computed: {
        canFilter() {
            return this.is_filter;
        },
    },
    methods: {
        changeValue(value) {
            const id = this.list.indexOf(value);
            if (id === -1) {
                this.list.push(value);
            } else {
                this.list.splice(id, 1);
            }
            this.params.filterChangedCallback(this.list);
        },
        onParentModelChanged(parentModel) {
        },
        init (params) {
        },
        onRbChanged() {
        },
        getGui() {
            return this.eGui;
        },
        doesFilterPass(params) {
            if (this.list.length == 12) return true;
            return this.list.indexOf(params.data.exchange) > -1;
        },
        isFilterActive() {
            return true;
        },
        getModel(model) {
        },
        setModel(model) {
            this.is_filter = true;
        },
        getModelAsString(model) {
        },
        filterReset() {
            this.list = [];
            this.swedens.forEach((item) => {item.checked = true; this.list.push(item.label)});
            this.filands.forEach((item) => {item.checked = true; this.list.push(item.label)});
            this.norways.forEach((item) => {item.checked = true; this.list.push(item.label)});
            this.denmarks.forEach((item) => {item.checked = true; this.list.push(item.label)});
            
            this.params.filterChangedCallback(this.list);
        }
    },

    data: function() {
        return {
            list:[],
            swedens: [
                {
                    value: 35201,
                    checked: true,
                    label: "Nasdaq Stockholm"
                },
                {
                    value: 35197,
                    checked: true,
                    label: "Spotlight Stock Market"
                },
                {
                    value: 35181,
                    checked: true,
                    label: "First North Stockholm"
                },
                {
                    value: 29929,
                    checked: true,
                    label: "Nordic Growth Market"
                },
                {
                    value: 4680264,
                    checked: true,
                    label: "Nordic SME"
                },
                {
                    value: 29930,
                    checked: true,
                    label: "Nordic MTF"
                },
            ],
            filands: [
                {
                    value: 35235,
                    checked : true,
                    label : "Nasdaq Helsinki"
                },
                {
                    value: 35182,
                    checked : true,
                    label : "First North Finland"
                }
            ],
            norways: [
                {
                    value : 39890,
                    checked: true,
                    label: "Oslo Bors"
                },
                {
                    value : 33187,
                    checked: true,
                    label: "Oslo Axess"
                }
            ],
            denmarks: [
                {
                    value : 35262,
                    checked: true,
                    label: "Nasdaq Copenhagen"
                },
                {
                    value : 35183,
                    checked: true,
                    label: "First North Denmark"
                }
            ],
            is_filter: false,
        };
    },
    beforeMount() {
    },
    watch: {
        canFilter(val) {
            if (val) {
                if (this.params.context.componentParent.filters.filter) {
                    let filter = this.params.context.componentParent.filters.filter;
                    filter = typeof filter === "object" ? filter : JSON.parse(filter);
                    let model = filter.exchange
                    if (model && model.length > 0) {
                        this.list = [];
                        this.swedens = this.swedens.map((item) => {
                            return {...item, checked: model.includes(item.label)};
                        })
                        this.filands = this.filands.map((item) => {
                            return {...item, checked: model.includes(item.label)};
                        })
                        this.norways = this.norways.map((item) => {
                            return {...item, checked: model.includes(item.label)};
                        })
                        this.denmarks = this.denmarks.map((item) => {
                            return {...item, checked: model.includes(item.label)};
                        })
                        model.forEach(label => {
                            this.list.push(label);
                        });
                        this.params.filterChangedCallback(this.list);
                    } else {
                        this.filterReset();
                    }
                } else {
                    this.filterReset();
                }
                this.is_filter = false;
            }
        }
    }
});
</script>

<style>
    .custom-menu-button.reset-button{
        right:10px;
        border: 1px solid #ABA5A5;
        background-color: #DADADA;
        color: black;
    }
    .exchange-container {
    }
</style>

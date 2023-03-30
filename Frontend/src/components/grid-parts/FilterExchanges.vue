<template lang="pug">
    v-container(class="ma-6 pa-0" style="width:290px;")
        //- v-form( v-model="value" )
        span(class="custom-menu-button reset-button" @click="filterReset") Reset
        h3 Sweden
            div(v-for="item in swedens")
                v-checkbox( 
                    v-model="item.checked" 
                    :label="item.label" 
                    class="ma-0 pa-0" 
                    @change="changeValue(item.label)")
            //- v-checkbox( v-model="v_35201" label="Nasdaq Stockholm"  value="35201" class="ma-0 pa-0" @change="changeValue($event)")
            //- v-checkbox( v-model="v_35197" label="Spotlight Stock Market"  value="35197" class="ma-0 pa-0" )
            //- v-checkbox( v-model="v_35181" label="First North Stockholm"  value="35181" class="ma-0 pa-0" )
            //- v-checkbox( v-model="v_29929" label="Nordic Growth Market"  value="29929" class="ma-0 pa-0")
            //- v-checkbox( v-model="v_29930" label="Nordic MTF"  value="29930" class="ma-0 pa-0")
        h3 Finland
            div(v-for="item in filands")
                v-checkbox( v-model="item.checked" :label="item.label" class="ma-0 pa-0" @change="changeValue(item.label)")
            //- v-checkbox( v-model="v_35235" label="Nasdaq Helsinki"  value="35235" class="ma-0 pa-0")
            //- v-checkbox( v-model="v_35182" label="First North Finland"  value="35182" class="ma-0 pa-0")
        h3 Norway
            div(v-for="item in norways")
                v-checkbox( v-model="item.checked" :label="item.label" class="ma-0 pa-0" @change="changeValue(item.label)")
            //- v-checkbox( v-model="v_39890" label="Oslo Bors"  value="39890" class="ma-0 pa-0")
            //- v-checkbox( v-model="v_33187" label="Oslo Axess"  value="33187" class="ma-0 pa-0")
        h3 Denmark
            div(v-for="item in denmarks")
                v-checkbox( v-model="item.checked" :label="item.label" class="ma-0 pa-0" @change="changeValue(item.label)")
            //- v-checkbox( v-model="v_35262" label="Nasdaq Copenhagen"  value="35262" class="ma-0 pa-0")
            //- v-checkbox( v-model="v_35183" label="First North Denmark"  value="35183" class="ma-0 pa-0")

</template>

<script>
import Vue from 'vue';


export default Vue.extend({
    name: "FilterExchanges",
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
            this.eGui = document.createElement('div');
            this.eGui.innerHTML =
                '<div>' +
                '  <v-range-slider /> Profit Margin LAST Q' +
                '</div>';
        },
        onRbChanged() {
        },
        getGui() {
            return this.eGui;
        },
        doesFilterPass(params) {
            return this.list.indexOf(params.data.exchange) > -1;
        },
        isFilterActive() {
            return true;
        },
        getModel(model) {
        },
        setModel(model) {
            if (model && model.length > 0) {
                this.list = [];
                this.swedens = this.swedens.map((item) => {
                    return {...item, checked: model.includes(item.label)}
                })
                this.filands = this.filands.map((item) => {
                    return {...item, checked: model.includes(item.label)}
                })
                this.norways = this.norways.map((item) => {
                    return {...item, checked: model.includes(item.label)}
                })
                this.denmarks = this.denmarks.map((item) => {
                    return {...item, checked: model.includes(item.label)}
                })
                model.forEach(label => {
                    this.list.push(label);
                });
                this.params.filterChangedCallback(this.list)
            } else {
                this.filterReset()
            }
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
        };
    },
    beforeMount() {
    },
    mounted() {
        this.swedens.forEach((item) => this.list.push(item.label));
        this.filands.forEach((item) => this.list.push(item.label));
        this.norways.forEach((item) => this.list.push(item.label));
        this.denmarks.forEach((item) => this.list.push(item.label));
    },
});
</script>

<style>
    .custom-menu-button.reset-button{
        right:10px;
        border: 1px solid #ABA5A5;
        background-color: #DADADA;
        color: black;
    }
</style>

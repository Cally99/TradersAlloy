<template lang="pug">
    div
        span(style="font-size:20px;")
            b {{ $t('view') }}
        div(class="d-flex justify-space-between mt-5" style="align-items: center;")
            span(style="font-size:15px; height:27px;")
                b {{ $t('Quarterly') }}
            div(class="d-flex" style="height:27px;")
                v-radio-group(row class="p-0 m-0")
                    input(@click="click_btn('q', 'latest')" class="mt-1 mr-2" type="radio" label="flmmet" :name="filterGroup" :checked="defaultSelected === 'q_latest'")
                    label {{ $t('numerical_values') }}
                    input(@click="click_btn('q', 'chart')" class="mt-1 mr-2 ml-10" type="radio" :name="filterGroup" :checked="defaultSelected === 'q_chart'")
                    label {{ $t('Chart') }}

        div(class="d-flex justify-space-between mt-4" style="align-items: center;")
            span(style="font-size:15px;  height:27px;")
                b {{ $t('full_year') }}
            div(class="d-flex" style="height:27px;")
                v-radio-group(row class="p-0 m-0")
                    input(@click="click_btn('y', 'latest')" class="mt-1 mr-2" type="radio" label="flmmet" :name="filterGroup" :checked="defaultSelected === 'y_latest'")
                    label {{ $t('numerical_values') }}
                    input(@click="click_btn('y', 'chart')" class="mt-1 mr-2 ml-10" type="radio" :name="filterGroup" :checked="defaultSelected === 'y_chart'")
                    label {{ $t('Chart') }}

        div(class="d-flex justify-space-between mt-4" style="align-items: center;")
            span(style="font-size:15px;  height:27px;")
                b {{ $t('ttm') }}
            div(class="d-flex" style="height:27px;")
                v-radio-group(row class="p-0 m-0")
                    input(@click="click_btn('t', 'latest')" class="mt-1 mr-2" type="radio" label="flmmet" :name="filterGroup" :checked="defaultSelected === 't_latest'")
                    label {{ $t('numerical_values') }}
                    input(@click="click_btn('t', 'chart')" class="mt-1 mr-2 ml-10" type="radio" :name="filterGroup" :checked="defaultSelected === 't_chart'")
                    label {{ $t('Chart') }}
</template>

<script>
export default {
    name: 'FilterViewRadioGroup',
    props: {
        filterGroup: String,
        defaultSelected: String
    },
    data: function() {
        return {

        };
    },
    methods: {
        click_btn(category, type) {
            this.$parent.click_btn(category, type);
        }
    }
}
</script>

<style>
input[type="radio"] {
    /* remove standard background appearance */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    /* create custom radiobutton appearance */
    display: inline-block;
    width: 12px;
    height: 12px;
    padding: 2px;

    /* background-color only for content */
    background-clip: content-box;
    border: 1px solid #081016;
    background-color: #e7e6e7;
    border-radius: 50%;
}
input[type="radio"]:checked {
    background-color: #325D85;
}
</style>
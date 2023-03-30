<script>
"use strict";

import ApiStocks from '@/Services/ApiStocks.js';
import { Bar } from 'vue-chartjs'

export default {
    name: 'CanvasPE',
    extends: Bar,
    mounted () {
        this.init()
    },
    data () {
        return {
        }
    },
    methods: {
        init() {
            let financials = this.$store.getters.getFinancials;
            let label_array = [];
            let data_array = [];
            financials.forEach(element => {
                if (element.company_id[0] === this.company_id) {
                    for(var i=0; i<element.company_id.length; i++) {
                        if (i===0) {
                            label_array.push(element.period[i]);
                            data_array.push(element.pe[i]);
                        } else {
                            if (element.period[i] != element.period[i-1]) {
                                label_array.push(element.period[i]);
                                data_array.push(element.pe[i]);
                            }
                        }
                    }
                }
            });
            this.renderChart({
                labels: label_array,
                datasets: [
                    {
                        label: 'P/E',
                        backgroundColor: '#258183',
                        data: data_array
                    }
                ]
            })
        },
    },
    props: {
        company_id : Number
    },
    watch: {
        company_id() {
            this.init()
        }
    }
}

</script>

<style scoped>

</style>

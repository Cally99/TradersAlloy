<script>
"use strict";


import ApiStocks from '@/Services/ApiStocks.js';
import { Bar } from 'vue-chartjs'

export default {
    name: 'SandboxCanvas',
    extends: Bar,
    data () {
        return {
            labels: [],
        }
    },
    methods: {
        init() {
            let financials = this.$store.getters.getFinancials
            let label_array = []
            let data_array = []
            financials.forEach(element => {
                if (element.company_id[0] === this.company_id) {
                    for(var i=0; i<element.company_id.length; i++) {
                        if (i==0) {
                            label_array.push(element.period[i])
                            data_array.push(element.eps[i])
                        } else {
                            if (element.period[i] != element.period[i-1]) {
                                label_array.push(element.period[i])
                                data_array.push(element.eps[i])
                            }
                        }
                    }
                }
            });
            this.renderChart({
                labels: label_array,
                datasets: [
                    {
                        label: 'EPS',
                        backgroundColor: '#447184',
                        data: data_array
                    }
                ]
            })
        }
    },
    mounted () {
        this.init()
    },
    watch: {
        company_id() {
            this.init()
        }
    },
    props: {company_id : Number},
    created: function() {
    },
}

</script>

<style scoped>

</style>

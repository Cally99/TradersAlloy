<script>
"use strict";

import { Line } from 'vue-chartjs'

export default {
    name: 'CanvasDataLoad',
    extends: Line,
    props: {
        dataLoad: Object
    },
    mounted () {
        let label_array = this.dataLoad.map(x => x.date_report);
        let scheduled = this.dataLoad.map(x => x.events);
        let actual = this.dataLoad.map(x => x.reports);

        this.renderChart({
            labels: label_array,
            options: {
                maintainAspectRatio: false,
                responsive: false,
            },
            datasets: [
                {
                    label: 'Scheduled',
                    //backgroundColor: '#a89d9c',
                    borderColor: '#a89d9c',
                    borderDash:[20,20],
                    stacked: true,
                    data: scheduled

                },
                {
                    label: 'Actual',
                    stacked: true,
                    //backgroundColor: '#1a6c09',
                    borderColor: '#1a6c09',
                    data: actual
                }
            ]
        })
    },
}

</script>

<style scoped>
</style>

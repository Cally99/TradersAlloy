<template lang="pug">
    div(v-if="computedInsiders")
        v-row(dense)
            v-col(cols="12")
                //- ChartPrice( :isin="isin" :insref="insref" :width="1500" :height="700" type="insider" )
                v-sheet(style="flex:4;margin-right:20px;")
                    AgGridVue(
                        style="width: 98%; height: 1000px; margin:12px;"
                        :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
                        id="screener"
                        gridApi=null
                        gridColumnApi=null
                        :animateRows="true"
                            :defaultColDef="defaultColDef"
                        :columnDefs="columnDefs"
                        :rowData="computedInsiders"
                    )
</template>

<script>
import ChartPrice from "@/components/ChartPrice.vue";
import { AgGridVue } from "ag-grid-vue";
import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-dark.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

export default {
  name: "StocksInsiders",
  components: {
      AgGridVue,
      ChartPrice
  },
  props: { company_id: Number, stock_id: Number },
  computed: {
    computedInsiders() {
        const trades = this.$store.getters["getInsiders"](this.company_id);
        if ( trades  && trades.insiders) {
            return trades.insiders;
        } else {
            return false;
        }
    },
     columnDefs() {
         return [
            {headerName: this.$t('instrument_name'),
                field: "instrument_name",
                minWidth: 200,
                resizable: true,
                sortable: false
            },
            {headerName: this.$t('Person'),
                field: "person",
                maxWidth: 200,
            },
            {headerName: this.$t('person_title') ,
                field: "person_title",
                maxWidth: 300,
            },
            {headerName: this.$t('action'),
                field: "transaction_nature",
                type: "rightAligned",
                maxWidth: 150,
                sortable: false
            },
            {headerName: this.$t('Transaction_Date'),
                field: "transaction_date",
                maxWidth: 150,
                type: "rightAligned",
            },
            {headerName: this.$t('Volume'),
                field: "volume",
                maxWidth: 100,
                sortable: false,
                type: "rightAligned",
            },
            {headerName:this.$t('Price'),
                field: "price",
                maxWidth: 100,
                sortable: false,
                type: "rightAligned",
            },
            {headerName: this.$t('Value'),
                valueGetter: function(params) {
                    return Math.round(params.data.price * params.data.volume);
                },
                maxWidth: 150,
                type: "rightAligned",
            },
            {headerName: this.$t('qty_or_amount'),
                field: "qty_or_amount",
                maxWidth: 150,
                type: "rightAligned",
                sortable: false
            },
            {headerName: this.$t('Currency'),
                field: "transaction_currency",
                maxWidth: 100,
                type: "rightAligned",
                sortable: false
            }
            ]
     }
  },
  mounted() {
      this.overlay = true;
      this.gridApi = this.gridOptions.api;
      this.gridColumnApi = this.gridOptions.columnApi;
  },
  data() {
    return {
        defaultColDef: {
            resizable:false,
            sortable: true,
        },
        gridOptions: {
            enableSorting: true,
        },
      search: "",
      insiders: [],
    };
  }
};
</script>

<style scoped>
>>> .ag-header-viewport {
    background-color: #E0E6EB !important;
}
</style>

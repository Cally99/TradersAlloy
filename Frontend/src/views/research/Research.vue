<template lang="pug">
    div(style="width: 1450px; height: 100%; margin: 25px 0 0 20px")
        div(v-show="showRemoveResearch" id="confirmDelete" ref="confirmDelete" class="confirm-delete-popup-design pt-1 pb-1 pl-1 pr-1") {{this.$t('Delete')}} {{this.selectedResearchToDelete}} {{this.$t('Research')}}?
            div(class="confirm-delete-popup-design-yes" @click="confirmDeleteYes") {{this.$t('Yes')}}
            div(class="confirm-delete-popup-design-no" @click="confirmDeleteNo") {{this.$t('No')}}
        div(style="font-size:30px") {{this.$t('Research')}}
        div(class="agGridContainer")
            ag-grid-vue(
                style="width: 1000px; height: 100%; margin: 20px 0 0 0"
                :class="{'ag-theme-dark':$vuetify.theme.isDark,'ag-theme-balham':!$vuetify.theme.isDark}"
                :columnDefs="columnDefs"
                :rowData="rowData"
                :suppressRowClickSelection="true"
                :rowSelection="rowSelection"
                :frameworkComponents="frameworkComponents"
                :animateRows="true"
                :pagination="false"
                :gridOptions="gridOptions"
                :defaultColDef="defaultColDef"
                :suppressCellSelection="true"
                :rowStyle="rowStyle"
                )
</template>

<script>
import "../../../node_modules/ag-grid-community/dist/styles/ag-grid.css";
import "../../../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css";
import { AgGridVue } from 'ag-grid-vue';
import ScreenerTicker from "../screener/grid-parts/ScreenerTicker.vue";
import ResearchIcon from "../research/researchIcon.vue";
import DeleteIcon from "../research/deleteIcon.vue";
import ApiService from '@/Services/ApiService.js';

export default {
    name: "Research",
    components: {
        AgGridVue,
        ResearchIcon,
        DeleteIcon
    },
    data(){
        return {
            rowStyle:null,
            deleteTicker: null,
            researchs: null,
            userId: null,
            showRemoveResearch: false,
            selectedResearchToDelete: null,
            item:{},
            columnDefs: null,
            rowData: [],
            agGridRowData: [],
            userResearches: null,
            ticker: [],
            mapStocks: [],
            rowSelection: null,
            frameworkComponents: null,
            gridOptions: {
                borders: false,
                rowHeight: 40,
                headerHeight: 60
            },
            defaultColDef: {
                resizable: true,
                sortable: true,
            },
        }
    },
    beforeMount() {
        this.rowStyle = {
            background: "white"
        },

        this.frameworkComponents = {
            screenerTicker: ScreenerTicker,
            researchIcon: ResearchIcon,
            deleteIcon: DeleteIcon
        },
        this.columnDefs = [
            {
                headerName: '',
                field: '',
                width: 50,
                headerCheckboxSelection: true,
                checkboxSelection: true,
                cellClass: 'my-class'
            },
            {
                headerName: this.$t('Ticker'),
                field: 'Ticker',
                width: 100,
                cellRenderer: 'screenerTicker',
                cellRendererParams: {
                    action : this.goToStock.bind(this),
                },
                cellClass: 'my-class'
            },
            { headerName: this.$t('Name'), field: 'Name', width: 200, cellClass: 'my-class'},
            {
                headerName: '',
                field: 'Research',
                cellRenderer: 'researchIcon',
                cellRendererParams: {
                    action : this.goToResearch.bind(this),
                },
                width: 50,
                cellClass: 'my-class'
            },
            { headerName: this.$t('Watchlist'), field: 'Watchlist', width: 140, cellClass: 'my-class' },
            { headerName: this.$t('Created'), field: 'created', width: 140, cellClass: 'my-class' },
            { headerName: this.$t('Last_Modified'), field: 'LastModified', width: 140, cellClass: 'my-class' },
            {
                headerName: '',
                width: 625,
                field: 'DeleteResearch',
                cellRenderer: 'deleteIcon',
                cellRendererParams: {
                    action : this.showConfirmDelete.bind(this),
                },
                cellStyle: {
                    display: "flex",
                    'justify-content': "end",
                },
                cellClass: 'my-class'
            },
        ];
        this.userId = this.$store.getters["getUser"].user;
        this.rowSelection = 'multiple';
        this.getResearchs();
    },
    methods: {
        async getResearchs() {
            this.rowData = null;
            this.researchs = (await ApiService.fetchResearchData(this.userId)).data;
            if(this.researchs.length > 0) {
                this.researchs.forEach((e) => {
                    if (this.$store.getters["getMapStocks"].find(s => s.stock_id === e.stock_id)) {
                        let stockName = this.$store.getters["getMapStocks"].find(s => s.stock_id === e.stock_id).name;

                        let ticker = e.ticker;
                        let dateCreated = e.date_created;
                        let modifiedDate = e.last_update_date.split('T')[0];
                        let watchlistName = [];
                        let research = e.ticker;
                        let deleteResearch = e.ticker;
                        let watchlist = this.$store.getters["getWatchlistItems"].find(g => g.stock_id === e.stock_id);
                        if (watchlist) {
                            const joins = JSON.parse(JSON.stringify(this.$store.getters["getWatchlistJoins"]) );
                            const joinsOfThisStock = joins.filter(item => {return item.stock_id === e.stock_id});
                            joinsOfThisStock.forEach(join => {
                                watchlistName.push( (this.$store.getters["getWatchlists"].find( WL => WL.watchlist_id === join.watchlist_id).name) );
                            });
                        } else {
                            watchlistName = "-"
                        }
                        this.agGridRowData.push(
                            { Ticker: ticker, Name: stockName, Research: research, Watchlist: watchlistName+"", created: dateCreated, LastModified: modifiedDate, DeleteResearch: deleteResearch }
                        );
                        this.rowData = this.agGridRowData;
                    }
                });
            } else {
                this.rowData = [];
            }
        },
        goToStock(ticker) {
            let stock = this.$store.getters["getAllStocks"].find(s=> s.ticker === ticker);
            this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: stock.stock_id}});
        },
        goToResearch(ticker) {
            let stock = this.$store.getters["getAllStocks"].find(s=> s.ticker === ticker);
            this.$router.push({name: 'landing-page.stock-detail', params: {stock_id: stock.stock_id}, query: {tab: 1}});
        },
        showConfirmDelete(ticker) {
            let stock = this.$store.getters["getAllStocks"].find(s=> s.ticker === ticker);
            this.deleteRequestBody = {
                user_id: this.userId,
                stock_id: stock.stock_id
            };
            this.deleteTicker = stock.ticker;
            this.selectedResearchToDelete = stock.name;
            this.showRemoveResearch = true;
        },
        confirmDeleteNo() {
            this.showRemoveResearch = false;
            this.deleteRequestBody = {
                user_id: null,
                stock_id: null
            }
            this.deleteTicker = null;
        },
        async confirmDeleteYes(){
            await ApiService.deleteContent(this.deleteRequestBody);
            let selectedRow = this.rowData.find(e => e.Ticker === this.deleteTicker);
            let newRowData = this.rowData.filter(row => {
                return row !== selectedRow;
            });
            this.rowData = newRowData;
            this.showRemoveResearch = false;
            this.deleteRequestBody = {
                user_id: null,
                stock_id: null
            }
            this.deleteTicker = null;
            console.log("research deleted");
        },
    }
}
</script>

<style scoped>
.agGridContainer {
    height:100%;
    width:100%;
}
.button-delete{
    width: 30px;
    height: 8px;
    background-color:red;
}
>>> .set-research-new-color {
    fill: #25B19A;
}
.confirm-delete-popup-design {
    display:flex;
    justify-content: end;
    align-items: center;
    width: 400px;
    z-index:100;
    position: absolute;
    top:190px;
    left: 1315px;
    font-size: 14px;
    color: #54555E;
}
.confirm-delete-popup-design-yes, .confirm-delete-popup-design-no {
    background-color: #ECECEC;
    border: 2px solid #C9C9C9;
    padding:4px;
    margin-left:10px;
}
.confirm-delete-popup-design-yes:hover, .confirm-delete-popup-design-no:hover {
    cursor: pointer;
}
>>> .ag-header-viewport {
   background-color: #F1F2F4 !important;
}
>>> .ag-header-cell-label {
    font-weight: bold;
}
>>> .my-class{
    background-color: white;
}
</style>

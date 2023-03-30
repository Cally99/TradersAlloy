<template>
     <div style="height: 100%">
            <div class="outer-div">
                <div class="button-bar">
                    <button v-on:click="onChart1()">Top 5 Medal Winners (Gold &amp; Silver)</button>
                    <button v-on:click="onChart2()">Bronze Medals by Country</button>
                </div>
                <div class="grid-wrapper" >
                    <ag-grid-vue
                        style="width: 100%; height: 1000px;"
                        class="ag-theme-alpine"
                        id="myGrid"
                        :columnDefs="columnDefs"
                        :defaultColDef="defaultColDef"
                        :rowData="rowData"
                        :enableRangeSelection="true"
                        :enableCharts="true"
                       ></ag-grid-vue>
                </div>
            </div>
        </div>
</template>

<script>

    window.createRowData = function createRowData() {
        var countries = [
            'Ireland',
            'Spain',
            'United Kingdom',
            'France',
            'Germany',
            'Luxembourg',
            'Sweden',
            'Norway',
            'Italy',
            'Greece',
            'Iceland',
            'Portugal',
            'Malta',
            'Brazil',
            'Argentina',
            'Colombia',
            'Peru',
            'Venezuela',
            'Uruguay',
            'Belgium',
        ];
        return countries.map(function(country, index) {
            return {
            country: country,
            gold: Math.floor(((index + 1 / 7) * 333) % 100),
            silver: Math.floor(((index + 1 / 3) * 555) % 100),
            bronze: Math.floor(((index + 1 / 7.3) * 777) % 100),
            };
        });
    };

    import { AgGridVue } from "ag-grid-vue";
    import 'ag-grid-enterprise';
    import { LicenseManager } from "ag-grid-enterprise";
    LicenseManager.setLicenseKey(
        "CompanyName=TradersAlloy OU,LicensedApplication=Traders Alloy,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=1,AssetReference=AG-009106,ExpiryDate=27_July_2021_[v2]_MTYyNzM0MDQwMDAwMA==905a1d0e81035375a78176e093d36bb2"
    );
    

    import "ag-grid-community/dist/styles/ag-grid.css";
    import "ag-grid-community/dist/styles/ag-theme-dark.css";
    import "ag-grid-community/dist/styles/ag-theme-alpine.css";


    export default {
        components: {
            'ag-grid-vue': AgGridVue,
        },
        data: function() {
            return {
            gridOptions: null,
            gridApi: null,
            columnApi: null,
            columnDefs: null,
            defaultColDef: null,
            rowData: null,
            };
        },
        beforeMount() {
            this.gridOptions = {};
            this.columnDefs = [
                {
                    field: 'country',
                    width: 150,
                    chartDataType: 'category',
                },
                {
                    field: 'gold',
                    chartDataType: 'series',
                    sort: 'desc',
                },
                {
                    field: 'silver',
                    chartDataType: 'series',
                    sort: 'desc',
                },
                {
                    field: 'bronze',
                    chartDataType: 'series',
                },
            ];
            this.defaultColDef = {
                flex: 1,
                minWidth: 100,
                filter: true,
                resizable: true,
            };
            this.rowData = createRowData();
            this.popupParent = document.body;
        },
        mounted() {
            this.gridApi = this.gridOptions.api;
            this.gridColumnApi = this.gridOptions.columnApi;
        },
        methods: {
            onChart1() {
            var params = {
                cellRange: {
                rowStartIndex: 0,
                rowEndIndex: 4,
                columns: ['country', 'gold', 'silver'],
                },
                chartType: 'groupedColumn',
                chartPalette: 'bright',
                processChartOptions: function(params) {
                var opts = params.options;
                opts.title.enabled = true;
                opts.title.text = 'Top 5 Medal Winners';
                if (opts.xAxis) {
                    opts.xAxis.label.rotation = 30;
                }
                opts.seriesDefaults.tooltip.renderer = function(params) {
                    var titleStyle = params.color
                    ? ' style="color: white; background-color:' + params.color + '"'
                    : '';
                    var title = params.title
                    ? '<div class="ag-chart-tooltip-title"' +
                        titleStyle +
                        '>' +
                        params.title +
                        '</div>'
                    : '';
                    var value = params.datum[params.yKey]
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
                    return (
                    title +
                    '<div class="ag-chart-tooltip-content" style="text-align: center">' +
                    value +
                    '</div>'
                    );
                };
                return opts;
                },
            };
            this.gridApi.createRangeChart(params);
            },
            onChart2() {
            var params = {
                cellRange: {
                columns: ['country', 'bronze'],
                },
                chartType: 'groupedBar',
                chartPalette: 'pastel',
                processChartOptions: function(params) {
                var opts = params.options;
                opts.seriesDefaults.showInLegend = false;
                opts.title.enabled = true;
                opts.title.text = 'Bronze Medal by Country';
                opts.seriesDefaults.tooltip.renderer = function(params) {
                    var titleStyle = params.color
                    ? ' style="color: white; background-color:' + params.color + '"'
                    : '';
                    var title = params.title
                    ? '<div class="ag-chart-tooltip-title"' +
                        titleStyle +
                        '>' +
                        params.title +
                        '</div>'
                    : '';
                    var value = params.datum[params.yKey]
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
                    return (
                    title +
                    '<div class="ag-chart-tooltip-content" style="text-align: center">' +
                    value +
                    '</div>'
                    );
                };
                return opts;
                },
            };
            this.gridApi.createRangeChart(params);
            },
            onGridReady(params) {},
        },
    }
</script>


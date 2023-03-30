<template lang="pug">
    div
        v-row
            //- Main Panel
            v-col
                v-container(scrollable)
                    dashboard( :id="'dashExample'" )
                        dash-layout(v-for="layout in dlayouts" v-bind="layout" :debug="true" :key="layout.breakpoint")
                            dash-item( v-for="item in layout.items" v-bind.sync="item" :key="item.id")
                                div(class="content")
                                    component( :is="item.type" :properties="item.props")
            //- Left Toolbar
            v-col
                v-container( fluid )
                    v-layout( column )
                        div( class="widget mb-2" v-for="w in widgets" @click="addWidget(w.type)")
                            div(class="widget__title")
                            v-icon(class="mt-3 " x-large) {{w.icon}}
                            div {{w.title}}

</template>

<script>
    import { Dashboard, DashLayout, DashItem } from "vue-responsive-dash";
    import WidgetChart from "./WidgetChart";
    import WidgetPositions from "./WidgetPositions";
    import WidgetAlerts from "./WidgetAlerts";
    import WidgetTradeJournal from "./WidgetTradeJournal";
    import WidgetNews from "./WidgetNews";
    import WidgetWatchlist from "./WidgetWatchlist";
    import WidgetScratchPad from "./WidgetScratchPad";
    import WidgetPerformance from "./WidgetPerformance";


    export default {
        name: "App",
        components: {
            WidgetChart,
            WidgetNews,
            WidgetPositions,
            WidgetAlerts,
            WidgetTradeJournal,
            WidgetScratchPad,
            WidgetPerformance,
            WidgetWatchlist,
            Dashboard,
            DashLayout,
            DashItem
        },
        methods: {
            addWidget(type) {
                const arr = this.dlayouts[1].items;
                let nextId = Math.max.apply(Math, arr.map(function(o) { return o.id; })) +1;

                const widget = this.widgets.find(w => {return type === w.type});
                const newCard = { id: nextId, x: 0, y: 0, width: 1, height: 1,
                    type: type,
                    title: widget.title,
                    props: widget.defaultProps
                }

                arr.push( newCard );

            },
            closeWidget(id) {
                const arr = this.dlayouts[1].items;
                const index = arr.findIndex(i => i.id === id);
                this.dlayouts[1].items.splice(index, 1);
            },
        },
        data() {
            return {
                widget: WidgetChart,
                widgets:[
                    {type: 'WidgetChart', title:'Chart: ', icon: 'show_chart', defaultProps: {insref:'772'}},
                    {type: 'WidgetScratchPad', title:'Scratch Pad', icon: 'notes', defaultProps: {content:'to do list...'}},
                    {type: 'WidgetPerformance', title:'Performance', icon: 'speed', defaultProps: {alternative: 1}},
                    {type: 'WidgetWatchlist', title:'Watchlist', icon: 'visibility', defaultProps: {watchlistId: -1}},
                    {type: 'WidgetPositions', title:'Positions', icon: 'attach_money', defaultProps: {watchlistId: 656}},
                    {type: 'WidgetNews', title:'News', icon: 'insert_comment', defaultProps: {}},
                    {type: 'WidgetAlerts', title:'Alerts', icon: 'notifications', defaultProps: {}},
                    {type: 'WidgetTradeJournal', title:'Trade Journal', icon: 'date_range', defaultProps: {}},
                ],
                dlayouts: [
                    {
                        breakpoint: "xl",
                        numberOfCols: 6,
                        items: [
                            { id: 0, x: 1, y: 0, width: 1, height: 1,    title: 'Chart:', type: 'WidgetChart', props: {insref: '772'} , configWidget: 'WidgetChartConfig'},
                            { id: 1, x: 2, y: 0, width: 1, height: 1,    title: 'Performance', type: 'WidgetPerformance', props: {alternative: 2} , configWidget: 'WidgetChartConfig' },
                            { id: 2, x: 1, y: 1, width: 1, height: 1,    title: 'Scratch Pad', type: 'WidgetScratchPad', props: {content:'eggs... milk... cheese'} , configWidget: null },
                        ]
                    },
                    {
                        breakpoint: "lg",
                        breakpointWidth: 1200,
                        numberOfCols: 4,
                        items: [
                            { id: 0, x: 1, y: 0, width: 1, height: 1,    title: 'Chart:', type: 'WidgetChart', props: {insref: '772'} , configWidget: 'WidgetChartConfig'},
                            { id: 1, x: 2, y: 0, width: 1, height: 1,    title: 'Performance', type: 'WidgetPerformance', props: {alternative: 2} , configWidget: 'WidgetChartConfig' },
                            { id: 2, x: 1, y: 1, width: 1, height: 1,    title: 'Scratch Pad', type: 'WidgetScratchPad', props: {content:'eggs... milk... cheese'} , configWidget: null },


                        ]
                    },
                    {
                        breakpoint: "md",
                        breakpointWidth: 996,
                        numberOfCols: 3,
                        items: [
                            { id: "1", x: 0, y: 0, width: 1, height: 1 },
                            { id: "2", x: 1, y: 0, width: 2, height: 1 },
                            { id: "3", x: 2, y: 1, width: 1, height: 1 },
                            { id: "4", x: 3, y: 1, width: 1, height: 1 },
                        ]
                    },
                ]
            };
        }
    };
</script>

<style>
    .widget__title{
        background-color:#4d5669;
        height:9px;
        margin:-4px;
    }
    .widget {
        text-align: center;
        display: block;
        width: 120px;
        border: 1px solid #7c7f81;
        background-color: #ffffff;
        border-radius: 4px;
        box-shadow: 5px 5px 3px 0px rgb(202, 202, 202);
        padding:4px;
        cursor: grab;
    }
    .toolbar {
        margin: 3px;
        display:grid;
        grid-template-columns: repeat(12,1fr);
        gap: 20px;
    }
    .cards {
        margin: 3px;
        display:grid;
        grid-template-columns: repeat(12,1fr);
        gap: 20px;
    }
    .card__title {
        background-color:#4d5669;
        color: white;
        text-align:center;
    }
    .myCard {
        display: block;
        width: 180px;
        border: 1px solid #7c7f81;
        background-color: #ffffff;
        border-radius: 4px;
        box-shadow: 5px 5px 3px 0px rgb(202, 202, 202);
        padding:4px;
    }
    .content {
        height: 100%;
        width: 100%;
        border: 1px solid #bdc7dd;
    }
</style>

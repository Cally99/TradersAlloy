<template lang="pug">
    v-dialog( content-class="table-config" v-model="$parent.confDlg" width="1356")
        v-card( style="padding: 10px;")
            v-card-title( class="headline d-flex justify-space-between align-center" style="width:100%;")
                div Configure Watchlist Columns
                v-icon( class="cursor-pointer" @click="closeConfDlg") mdi-close

            v-card-text
                div( class="addable-square row" style="overflow:auto;")
                    draggable(
                        class="list-group"
                        tag="ul"
                        v-model="$parent.addable_headers"
                        v-bind="dragOptions"
                        group="people"
                        :list="$parent.addable_headers"
                        @start="drag = true"
                        @end="drag = false"
                        style="width:100%;"
                    )

                        transition-group( :name="!drag ? 'flip-list' : null" type="transition")
                            li( v-for="element in $parent.addable_headers"
                                class="list-group-item"
                                :key="element.order"
                            )
                                i( :class="element.fixed ? 'fa fa-anchor' : 'glyphicon glyphicon-pushpin'"
                                    @click="element.fixed = !element.fixed"
                                    aria-hidden="true"
                                )
                                img( :src="element.image")

                div( class="outline" style="text-align:center;")
                    h1( style="margin-top:280px; font-size:40px; color:#ccc8c8;") Drag columns to configure

                div( v-if="viewMode == 'list'" class="w-full-config row")
                    table( class="table table-striped" style="text-align:left;")
                        thead( class="thead-dark")
                        draggable( v-model="$parent.config_headers" tag="tr" v-bind="dragOptions" :list="$parent.config_headers" group="people")
                            th( v-for="header in $parent.config_headers" :key="header.text" scope="col") {{ headerText(header.text) }}

                        tbody
                            tr( v-for="item in watchlists.slice(0,3)" :key="item.Name")
                                td( v-for="header in $parent.config_headers" :key="header.text")
                                    span( v-if="header.text === 'Ticker'" class="ticker") {{ item.ticker }}
                                    span( v-if="header.text === 'Name'") Ferroamp
                                    span( v-if="header.text === 'Last Eps'") 2.02
                                    span( v-if="header.text === 'Sales'") 18827739
                                    span( v-if="header.text === 'Sector'") no sector defined
                                    span( v-if="header.text === 'Last Earnings Date'") 2020-11-20
                                    span( v-if="header.text === 'Next Earnings Date'") 2020-11-20
                                    span( v-if="header.text === 'Price (EOD)'") 4.33
                                    span( v-if="header.text === 'Watched Since'") ~ today
                                    span( v-if="header.text === '∆%'") 98%
                                    span( v-if="header.text === 'Conviction'")
                                        v-icon( class="off_black" small) mdi-heart
                                        v-icon( class="off_red" small) mdi-heart
                                        v-icon( class="red--text text--lighten-1" small) mdi-heart
                                        v-icon( class="red--text text--lighten-1" small) mdi-heart
                                        v-icon( class="red--text text--lighten-1" small) mdi-heart

                                    div( v-if="header.text=='Research'")
                                        div( v-if="item.research_state == 'EXISTS'")
                                            i( class="green--text text--lighten-2 material-icons") assignment

                                        div( v-else)
                                            span( style="display:block; font-size:10px !important; text-align:center;") No Research
                                
                                    div( v-if="header.text=='Trade Plan'" class="d-flex")
                                        v-icon( style="float:right; display:inline;" class="material") mdi-bell
                                        v-icon( style="float:right; display:inline;" class="material") mdi-bell
                                        v-icon( style="float:right; display:inline;" class="material") mdi-bell
                                        span( class="green--text ml-4") 2

                                    span( v-if="header.text === 'Diary Notes'") Click to add Journal Notes
                                    span( v-if="header.text === 'Tags'")
                                        v-chip( label small class="ma-1") Your tags here

            v-card-actions
                v-spacer
                v-btn( depressed color="primary" @click="saveWatchlistConfig") Save and Close
</template>

<script>
import ApiService from "../../Services/ApiService.js";
import draggable from "vuedraggable";

export default {
    name: "ViewModeListConfigure",
    props: {
        viewMode: String,
        watchlists: Array
    },
    components: {
        draggable
    },
    data() {
        return {
            drag: false
        };
    },
    computed: {
        dragOptions() {
            return {
                animation: 200,
                group: "description",
                disabled: false,
                ghostClass: "ghost"
            };
        }
    },
    methods: {
        closeConfDlg() {
            this.$parent.confDlg = false;
        },
        async saveWatchlistConfig() {
            this.$parent.watch_headers = [...this.$parent.config_headers];

            let setting_data = {
                user_id: JSON.parse(localStorage.getItem('user')).user_id,
                feature: 'WATCHLIST',
                content: JSON.stringify(this.$parent.watch_headers)
            };

            try {
                await ApiService.saveSettings(setting_data);

                this.$parent.watch_headers.push({text:'', value:'delete', sortable:false, order:16});
                this.closeConfDlg();
            } catch(error) {
                console.log(error.message);
            }
        },
        headerText(val) {
            console.log(val);
            if (val == "Diary Notes") {
                val = "Trade Journal"
            }
            if (val == "Sales") {
                val = "Sales (Millions)"
            }
            if (val == "Eps") {
                val = "Last Eps"
            }
            return val;
        }
    }
}
</script>

<style scoped>
>>> .ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

>>> .flip-list-move {
  transition: transform 0.5s;
}

>>> .list-group {
  min-height: 20px;
}

>>> .table-config.v-dialog {
    position:absolute;
    top: 100px;
    height: 700px;
}

>>> .table-config .v-card {
    height: 100%;
}

>>> .table-config .w-full-config {
    position: absolute;
    top: 290px;
    margin: 15px;
    box-shadow:0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12)

}

>>> .table-config .outline {
    position:absolute;
    top: 290px;
    width: 1287px;
    height: 350px;
    border:2px solid;
}

>>> .table-config .outline:hover {
    border:2px solid #178dfa;
}

>>> .table-config .v-card__actions {
    position:absolute;
    top:645px;
    left: 1158px;
}

>>> .table-config .table th, .table td {
    padding: 5px;
}

>>> .table-config .w-full-config .table th {
    border: 1px solid #d4d3d3;
    color: #717070;
    background-color: #e2e2e2;
}

>>> .table-config .w-full-config {
    cursor: grab;
}

>>> .table-config .addable-square {
    height: 210px;
    overflow: auto;
    border:3px dotted;
}

>>> .table-config .addable-square:hover {
    border:3px dotted #178dfa;
}

>>> .list-group-item {
  cursor: move;
  border:none;
}

>>> .list-group-item i {
  cursor: pointer;
}

>>> .list-group .list-group-item {
    margin: 7px 3px;
    padding: 0px;
    box-shadow:0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.05), 0 9px 46px 8px rgba(0,0,0,.12)
}
</style>

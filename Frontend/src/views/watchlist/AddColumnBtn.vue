<template lang="pug">
    <div style="opacity: 1; margin-top:0px;">
        <span class="blue3" style="padding: 5px 15px; border-radius: 5px; color: white;" @click="onMenuClicked()"> Add Column </span>
        v-container(v-if="showMenuPopup" id="addColumnAG" class="p-3 addButton addColumnDropDown" style="height:350px;width:280px;")
            div(v-for="item in columns" style="margin:1px 0px -18px 25px; display: flex; justify-content: space-between;")
                v-checkbox(v-model="item.checked" color="blue3" dense :label="item.label" class="ma-0 pa-0 my-checkbox" style="height:35px;" @change="changeValue(item.label)")
                    
    </div>
</template>

<script>
import Vue from 'vue';
import {mapActions, mapGetters} from "vuex";

export default Vue.extend({

    data: function() {
        return {
            showMenuPopup: false,
            is_filter: false,
            is_first: true,
            list:[],
            columns : [
                // {
                //     checked: true,
                //     label: this.$t('Ticker'),
                // },
                {
                    checked: true,
                    label: this.$t('Name')
                },
                {
                    checked: true,
                    label: this.$t('Sector')
                },
                {
                    checked: true,
                    label: this.$t('last_earnings'),
                },
                {
                    checked: true,
                    label: this.$t('next_earnings'),
                },
                {
                    checked: true,
                    label: this.$t('price_eod'),
                },
                {
                    checked: true,
                    label: this.$t('last_eps'),
                },
                {
                    checked: true,
                    label: this.$t('last_sales'),
                },
                {
                    checked: true,
                    label: this.$t('Watched_Since'),
                },
                {
                    checked: true,
                    label: '∆%'
                },
                {
                    checked: true,
                    label: this.$t('Conviction'),
                },
                {
                    checked: true,
                    label: this.$t('research'),
                },
                {
                    checked: true,
                    label: this.$t('trade_plan'),
                },
                {
                    checked: true,
                    label: this.$t('Trade_Journal'),
                },
                {
                    checked: true,
                    label: this.$t('My_Tags'),
                },

            ]
        };
    },
    beforeMount() {
    },
    computed: {
        ...mapGetters(["getWL_columns"]),
        canFilter() {
            return this.is_filter;
        },
        screenerId() {
            return this.$route.params.id;
        }
    },
    mounted() {
        this.is_filter = true;
    },

    methods: {
        closeMenuPopup(e) {
            const addColumnAG = document.getElementById('addColumnAG');            
            if(addColumnAG && !addColumnAG.contains(e.target)) {
                addColumnAG.style.display = 'none';
            }
        },
        onMenuClicked() {
            this.showMenuPopup = !this.showMenuPopup;
            this.showMenuPopup = true;
            const addColumnAG = document.getElementById('addColumnAG');
            if (addColumnAG) {
                addColumnAG.style.display = 'block';
            }
            document.addEventListener('mouseup', this.closeMenuPopup);
            this.is_first = false;
        },
        changeValue(value) {
            const id = this.list.indexOf(value);
            if (id === -1) {
                this.list.push(value);
            } else {
                this.list.splice(id, 1);
            }
            this.params.context.componentParent.setAddColumn(this.list);
            document.addEventListener('mouseup', this.closeMenuPopup);
            
            this.is_first = false;
        },
        setModel(model) {
            this.is_filter = true;
        },
        isFilterActive() {
            return true;
        },
        getModel() {
        },
        doesFilterPass(params) {
            return true;
        },

        close(e) {
            this.showMenuPopup = false
        },
        created() {
            window.addEventListener('click', this.close);
        },

        beforeDestroy() {
            window.removeEventListener('click', this.close);
        },
    },
    watch: {
        screenerId(val) {
        },
        canFilter(val) {
            if (val) {
                let colDefs = [];
                this.params.context.componentParent.isABC
                let model = [];

                setTimeout(() => {
                    let WL_columns = this.getWL_columns;
                    if (WL_columns.columns) {
                        colDefs = WL_columns.columns;
                        colDefs.forEach(item => {
                            model.push(item);
                        })
                    } else {
                        colDefs = this.params.context.componentParent.columnDefs;
                        colDefs.forEach(item => {
                            if (item.hide) {
                                model.push(item.headerName);
                            }
                        })
                    }

                    this.list = [];
                    this.columns = this.columns.map((item) => {
                        return {...item, checked: !(model.includes(item.label))};
                    })
                    model.forEach(label => {
                        this.list.push(label);
                    });
                    
                    if (this.params.context.componentParent.is_firstMounted)
                        this.onMenuClicked();
                    this.is_filter = false;
                }, 50);
            }
        }
    }
});
</script>

<style scoped>
.v-messages {
    min-height: 0px !important;
}
::v-deep .my-checkbox .v-label {
    font-size: 13px;
}
.addColumnDropDown {
    z-index: 10;
    top: 250px;
    position: fixed;
    right:10px;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 5px 0 0 0 ;
    width:360px;box-shadow: 10px 13px 48px -4px rgba(0,0,0,0.49);
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;  /* what is this ? */
}
</style>
<style>
.v-input--selection-controls__ripple::before {
    width: 0px !important;
    height: 0px !important;
}
</style>
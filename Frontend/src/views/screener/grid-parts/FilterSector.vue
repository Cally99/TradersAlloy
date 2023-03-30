<template lang="pug">
    div(class="p-3 sector" style="height:600px;width:800px;")
        span(class="custom-menu-button reset-button" @click="resetSectors()") {{ $t('Reset') }}
        h3 {{ $t('Sector') }}
        v-divider
        v-layout
            section(class="left")
                v-treeview(
                    v-model="selection"
                    :items="translatedSectors"
                    selectable
                    selection-type="independent"
                    return-object
                    item-disabled="locked"
                )
                    template( v-slot:append="{ item, open }")
                        SPAN( v-if="!item.ticker && item.children[0].ticker") ({{item.children.length}})
            section
                template(v-if="!filtered_sectors.length")
                    div {{ $t('No_sectors_selected') }}
                template(v-else)
                    div(v-for="(node, index) in filtered_sectors" :key="node.id")
                        v-chip(
                            class="ma-2"
                            close
                            color="blue3"
                            text-color="white"
                            @click:close="removeItem(node, index)"
                        ) {{node.name}}
</template>


<script>
import Vue from 'vue';
import { mapGetters } from "vuex";


export default Vue.extend({
    components: {
    },
    mounted() {
        this.is_filter = true;
    },
    data : function() {
        return {
            selection: [],
            filtered_sectors: [],
            is_filter: false,
        };
    },
    created: function () {
    },
    computed: {
        ...mapGetters({
            sectors: 'getSectorsTree',
        }),
        translatedSectors() {
            let sectorsCopy = JSON.parse(JSON.stringify(this.sectors));
            sectorsCopy = sectorsCopy.filter((s) => s.name !== 'Sector / Industry');

            sectorsCopy = sectorsCopy.map((item) => {
                if(this.$t(item.name)) {
                    // Main Groups
                    item.name = this.$t(item.name);
                }

                // Sub Groups
                item.children.map((i) => {
                    if(this.$t(i.name)) {
                        i.name = this.$t(i.name);
                    }

                    return i;
                });

                return item;
            });
            
            return sectorsCopy;
        },
        sectorIds() {
            return this.filtered_sectors.map(sector => sector.id);
        },
        canFilter() {
            return this.is_filter;
        },
    },
    beforeMount() {
    },
    methods: {
        removeItem (item, index) {
            this.selection = this.selection.filter(sector => sector.id != item.id);
        },
        resetSectors() {
            this.selection = [];
        },
        init (params) {            
            this.eGui = document.createElement('div');
            this.eGui.innerHTML =
                '<div>' +
                '  <span /> ' + this.$t('Sector')
                '</div>';
        },
        getGui() {
            return this.eGui;
        },
        doesFilterPass(params) {
            if (this.filtered_sectors.length == 0) {
                return true;
            } else {
                for(var i=0; i<this.filtered_sectors.length; i++) {
                    if (this.filtered_sectors[i].id == params.data.sector_id)
                        return true;
                }
            }
        },
        isFilterActive() {
            this.active = true;
            return true;
        },
        getModel() {
        },
        setModel(model) {
            this.is_filter = true;
        },
    },
    watch: {
        selection: function(newVal, oldVal) {
            var diffs, isAdd;
            if (newVal.length > oldVal.length) {
                isAdd = true;
                diffs = newVal.filter((n) => oldVal.findIndex(o => o.id == n.id) == -1);
            } else {
                isAdd = false;
                diffs = oldVal.filter((o) => newVal.findIndex(n => n.id == o.id) == -1);
            }
            const self = this;
            const recall = function(obj) {
                const childs = obj.children;
                if (!childs)
                    return;

                if (isAdd) {
                    if (!self.sectorIds.includes(obj.id))
                        self.filtered_sectors.push(obj);
                } else {
                    self.filtered_sectors = self.filtered_sectors.filter(sector => sector.id != obj.id);
                }

                childs.forEach(child => {
                    recall(child);
                })
            }
            diffs.forEach(element => {
                recall(element);
            })
            const orgElementIds = newVal.map(element => element.id).sort((a, b) => a > b);
            const curElementIds =  self.sectorIds.sort((a, b) => a > b);
            if (orgElementIds.toString() !== curElementIds.toString()) {
                this.selection = this.filtered_sectors;
            }
            var sectors = this.filtered_sectors.length ? this.filtered_sectors : {is_sector: true};
            this.params.filterChangedCallback(sectors);
        },
        canFilter(val) {
            if (val) {
                if (this.params.context.componentParent.filters.filter) {
                    let filter = this.params.context.componentParent.filters.filter;
                    filter = typeof filter === "object" ? filter : JSON.parse(filter);
                    let model = filter.sector_name;
                    if (model && model.length > 0) {
                        this.selection = model;
                        this.params.filterChangedCallback(this.selection);
                    } else {
                        this.selection = [];
                        this.params.filterChangedCallback(this.selection);
                    }
                } else {
                    this.selection = [];
                    this.params.filterChangedCallback({is_sector: true});
                }

                this.is_filter = false;
            }
        }
    }
});
</script>

<style>
    .custom-menu-button.reset-button{
        right:10px;
        border: 1px solid #ABA5A5;
        background-color: #DADADA;
        color: black;
    }
</style>

<style scoped>
    .sector{
        
    }

    ::v-deep .accent--text {
        color: #325D85 !important;
    }
</style>

<template lang="pug">
    div(class="p-3" style="height:900px;width:800px;")
        span(class="custom-menu-button reset-button" @click="resetSectors()") Reset
        h3 Sectors
        v-divider
        v-layout
            section(class="left")
                v-treeview(
                    v-model="selection"
                    :items="sectors"
                    selectable
                    selection-type="independent"
                    return-object
                    item-disabled="locked"
                )
                    template( v-slot:append="{ item, open }")
                        SPAN( v-if="!item.ticker && item.children[0].ticker") ({{item.children.length}})
            section
                template(v-if="!filtered_sectors.length")
                    div No sectors selected.
                template(v-else)
                    div(v-for="(node, index) in filtered_sectors" :key="node.id")
                        v-chip(
                            class="ma-2"
                            close
                            color="amber darken-1"
                            text-color="brown darken-2"
                            @click:close="removeItem(node, index)"
                        ) {{node.name}}
</template>


<script>
import Vue from 'vue';
import { mapGetters } from "vuex";


export default Vue.extend({
    components: {
    },
    data : function() {
        return {
            selection: [],
            filtered_sectors: []
        };
    },
    created: function () {
    },
    computed: {
        ...mapGetters({
            sectors: 'getSectorsTree',
        }),
        sectorIds() {
            return this.filtered_sectors.map(sector => sector.id);
        }
    },
    beforeMount() {
    },
    methods: {
        removeItem (item, index) {
            this.selection = this.selection.filter(sector => sector.id != item.id);
        },
        resetSectors() {
            this.selection = []
        },
        init (params) {            
            this.eGui = document.createElement('div');
            this.eGui.innerHTML =
                '<div>' +
                '  <span /> Sector' +
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
                    if (this.filtered_sectors[i].name == params.data.sector_name)
                        return true
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
            if (model && model.length > 0) {
                this.selection = model
                this.params.filterChangedCallback(this.selection)
            } else {
                this.selection = []
            }
        },
    },
    watch: {
        selection: function(newVal, oldVal) {
            let diffs, isAdd;
            if (newVal.length > oldVal.length) {
                isAdd = true;
                diffs = newVal.filter((n) => oldVal.findIndex(o => o.id == n.id) == -1)
            } else {
                isAdd = false;
                diffs = oldVal.filter((o) => newVal.findIndex(n => n.id == o.id) == -1)
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
                    self.filtered_sectors = self.filtered_sectors.filter(sector => sector.id != obj.id)
                }

                childs.forEach(child => {
                    recall(child)
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
            this.params.filterChangedCallback(this.filtered_sectors);
        },
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

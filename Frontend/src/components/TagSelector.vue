<template lang="pug">
    div(class="pt-3")
        v-combobox(
                v-model="model"
                :filter="filter"
                :items="items"
                :search-input.sync="search"
                hide-selected
                label="Tags"
                multiple
                small-chips
                outlined dense
                style="z-index:800")
            template( v-slot:no-data)
                v-list-item
                    span( class="subheading") Create
                    v-chip(
                            :color="`${colors[nonce - 1]} lighten-4`"
                            label
                            small
                            :text-color="`${colors[nonce - 1]} darken-1`"
                            outlined) {{ search }}

            template( v-slot:selection="{ attrs, item, parent, selected }")
                v-chip( v-if="item === Object(item)"
                        v-bind="attrs"
                        :color="`${item.color} lighten-4`"
                        :text-color="`${item.color} darken-1`"
                        :input-value="selected"
                        label
                        small)
                      span( class="pr-2") {{ item.text }}
                      v-icon( small @click="parent.selectItem(item)") close

            template( v-slot:item="{ index, item }")
                v-text-field(
                        v-if="editing === item"
                        v-model="editing.text"
                        autofocus
                        text
                        background-color="transparent"
                        hide-details
                        solo
                        @keyup.enter="edit(index, item)")
                v-chip( v-else
                        :color="`${item.color} lighten-4`"
                        :text-color="`${item.color} darken-1`"
                        label
                        small) {{ item.text }}
                v-spacer
                v-list-item-action( @click.stop)
                    v-btn(icon @click.stop.prevent="edit(index, item)")
                        v-icon( x-small) {{ editing !== item ? 'mdi-pencil' : 'mdi-check' }}
</template>

<script>
    import ApiService from '@/Services/ApiService.js';

    // TODO: Which to use TagSelector.vue or TagDropDown.vue ????????
    export default {
        name: "TagSelector",
        props: {
            value: Number,
            stock_id: Number,
            tagsString: String
        },
        data: () => ({
            activator: null,
            attach: null,
            colors: ['light-green', 'purple', 'indigo', 'cyan','lime','pink', 'teal', 'orange','amber','deep-orange','brown','blue-grey'],
            editing: null,
            index: -1,
            items: [
                { header: 'Select a Tag or write a new one' },
                {
                    text: 'Bullish',
                    color: 'blue',
                },
                {
                    text: 'Bearish',
                    color: 'red',
                },
                {
                    text: 'Short',
                    color: 'indigo',
                },
                {
                    text: 'Value',
                    color: 'cyan',
                },
                {
                    text: 'Growth',
                    color: 'red',
                },
                {
                    text: 'Story Stock',
                    color: 'teal',
                },
                {
                    text: 'Event Trade',
                    color: 'orange',
                },
            ],
            nonce: 1,
            menu: false,
            models: [
                {
                    text: 'Bullish',
                    color: 'blue',
                },
            ],
            x: 0,
            search: null,
            y: 0,
        }),
        computed: {
            model:   {
                get() {
                    if (this.$store.getters["getWatchlistItem"](this.stock_id)) {
                        let tags = typeof this.$store.getters["getWatchlistItem"](this.stock_id) == 'object' ? this.$store.getters["getWatchlistItem"](this.stock_id).tags : JSON.parse(this.$store.getters["getWatchlistItem"](this.stock_id).tags);
                        if (tags) {
                            return tags;
                        } else {
                            return this.models;
                        }
                    } else {
                        return this.models;
                    }
                },
                set(val) {
                    console.log('%%%%%%%%%%%%%', val);
                    this.models = val.map(v => {
                        if (typeof v === 'string') {
                            v = {
                                text: v,
                                color: this.colors[this.nonce - 1],
                            }
                            this.items.push(v);
                            this.nonce++;
                        }
                        return v;
                    })
                    ApiService.addTags({
                        user_id: JSON.parse(localStorage.user).user_id,
                        stock_id: this.stock_id,
                        tags : JSON.stringify(this.models)
                    })
                        .then((response) => {
                            console.log('saved tags', response.data);
                            var item = {
                                stock_id: this.stock_id,
                                tags : JSON.stringify(this.models)
                            }
                            this.$store.commit("updateWatchlistItemTags", item);
                        })


                }

            }
        },
        methods: {
            edit (index, item) {
                if (!this.editing) {
                    this.editing = item
                    this.index = index
                } else {
                    this.editing = null
                    this.index = -1
                }
            },
            filter (item, queryText, itemText) {
                if (item.header) return false

                const hasValue = val => val != null ? val : ''

                const text = hasValue(itemText)
                const query = hasValue(queryText)

                return text.toString()
                    .toLowerCase()
                    .indexOf(query.toString().toLowerCase()) > -1
            },
        },
    }
</script>

<style scoped>
    >>> .v-input__slot fieldset {
        border-color: #4077AB;
    }
</style>

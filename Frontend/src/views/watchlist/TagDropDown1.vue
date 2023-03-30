<template lang="pug">
    div(style="max-width: 300px;width:100%;cursor:pointer; min-height:20px; border: 1px solid #ccc; padding: 5px; border-radius: 8px;" @click="showDropDown = true")
        div(v-if="assignedTag.length==0" class="")
            v-chip(
                    label small
                    class="ma-1 grey2"
                    id="openTagPopup"
                   ) {{this.$t('Your_tags_here')}}

        div(v-for="tag in JSON.parse(tagsString)"

            style="display:inline-block"
            @keyup.enter.prevent="select(selectedIndex)" )
            v-chip( class="ml-1 my-1"
                small
                strong
                close
                label
                @click:close="removeTag(tag.text)"
                :text-color="`${tag.color} darken-1`"
                :color="`${tag.color} lighten-4`" )
                    span {{tag.text}}

        //- TO DO...   props as String or Object or Array ?
        //-  Strange: this component is not rendered if item.tags is 'empty'
        //-    div(v-if="item.hasOwnProperty('tags')"
        //- div(v-if="typeof item.tags === 'undefined' "
        //-        @click="showDropDown = true"
        //-        style="display:inline-block")
        //-            v-chip( class="ml-1" small strong label text-color="grey lighten-1" color="grey lighten-4" ) tags...
        div(v-show="showDropDown"
            class="tagsDropDown")
            div(style="text-align:left;")
                v-chip(v-for="(item, index) in items"
                    label small
                    :color="`${item.color} lighten-4`"
                    :text-color="`${item.color} darken-1`"
                    class="ma-1"
                    :id="'tab' + index"
                    @click.prevent="select(item.text)" ) {{item.text}}
            input(type="text"
                class="mx-3 my-2 px-2 input"
                style="border:1px solid silver; width:90%; text-align: left;"
                name="newTag"
                v-model="newTag"
                @keyup.enter="createTag"
                placeholder="Create your own tag...")
</template>

<script>
    import ApiService from '@/Services/ApiService.js';
    import Vue from 'vue';

    export default Vue.extend({
        name: 'TagSelector3',
        props: {
            stock: Object,
            tagsString: String,
            from: String
        },
        data: function() {
            return {
                // stock_id:32589,
                // tagsString: '[{"text":"Bullish","color":"blue"},{"text":"Story Stock","color":"teal"}]',

                stock_id: this.stock.stock_id,
                tagForTest: "",
                newTag: "",
                placeholder: "foo",
                time: "",
                showDropDown: false,
                starttime: "",
                selectedIndex: 0,
                colors: ['light-green', 'purple', 'indigo', 'cyan','lime','pink', 'teal', 'orange','amber','deep-orange','brown','blue-grey'],
                items: [
                    {text: 'Bullish', color: 'blue',},
                    {text: 'Bearish', color: 'red',},
                    {text: 'Short', color: 'indigo',},
                    {text: 'Value', color: 'cyan',},
                    {text: 'Growth', color: 'red', },
                    {text: 'Story Stock', color: 'teal',},
                    {text: 'Event Trade', color: 'orange',},
                    {text: 'Earnings', color: 'blue-grey',},
                    {text: 'SaaS', color: 'deep-orange',},
                    {text: 'Top_10', color: 'purple',},
                ],
                models: [
                    {text: 'Bullish', color: 'blue',},
                ],
            }
        },
        methods: {
            async removeTag(tag) {
                let tags = this.assignedTag;

                tags = tags.filter(item=> item.text !== tag);

                try {
                    const response = await ApiService.addTags({
                        user_id: JSON.parse(localStorage.getItem('user')).user_id,
                        stock_id: this.stock_id,
                        tags : JSON.stringify(tags)
                    });

                    console.log('saved tags', response.data);

                    const item = {
                        stock_id: this.stock_id,
                        tags : JSON.stringify(tags)
                    };

                    this.$store.commit("updateWatchlistItemTags", item);

                } catch(error) {
                    console.log(error.message);
                }

                this.showDropDown = true;
            },
            //----------------------------Eka code ----------------------------

            close(e) {
                if (! this.$el.contains(e.target)) {
                    this.showDropDown = false
                }
            },
            async assignTag(newTag=false) {
                if (!newTag) {
                    return;
                }

                const tags = this.assignedTag;

                tags.push(newTag);

                try {
                    const response = await ApiService.addTags({
                        user_id: JSON.parse(localStorage.getItem('user')).user_id,
                        stock_id: this.stock_id,
                        tags : JSON.stringify(tags)
                    });

                    console.log('saved tags', response.data);

                    const item = {
                        stock_id: this.stock_id,
                        tags : JSON.stringify(tags)
                    };

                    this.$store.commit("updateWatchlistItemTags", item);
                } catch(error) {
                    console.log(error.message);
                }
            },
            createTag() {
                if (!!this.newTag && !this.items.find(item=>item.text.toLowerCase() === this.newTag.toLowerCase())) {
                    var newItem = {
                        text: this.newTag,
                        color: this.colors[this.colors.length * Math.random() | 0]
                    }
                    this.items.push(newItem)
                    this.assignTag(newItem)
                }

                this.newTag = ""
            },

            select(tag) {
                let iTag = JSON.parse(JSON.stringify(this.items.find(item=>item.text === tag)));
                this.tagForTest = JSON.parse(JSON.stringify(iTag));

                if (!this.assignedTag.find(item=> item.text === tag)) {
                    this.assignTag(iTag);
                }
            }

            //-------------------------------End------------------------------


            //----------------------------Andrew code --------------------------
            // select: function(index) {
            //     this.starttime = this.filteredTimes[index]
            // },
            // edit (index, item) {
            //     if (!this.editing) {
            //         this.editing = item
            //         this.index = index
            //     } else {
            //         this.editing = null
            //         this.index = -1
            //     }
            // },
            // filter (item, queryText, itemText) {
            //     if (item.header) return false

            //     const hasValue = val => val != null ? val : ''

            //     const text = hasValue(itemText)
            //     const query = hasValue(queryText)

            //     return text.toString()
            //         .toLowerCase()
            //         .indexOf(query.toString().toLowerCase()) > -1
            // },
            //----------------------------------------------------------------------------------

        },
        computed: {
            assignedTag() {
                if (!this.tagsString) return [];
                return JSON.parse(this.tagsString);
            },
            filteredTimes: function() {
                let filter = Vue.filter('filterBy');
                return filter(this.times, this.starttime);
            },
            model:   {
                get() {
                    if (this.$store.getters["getWatchlistItem"](this.stock_id)) {
                        if (JSON.parse(this.$store.getters["getWatchlistItem"](this.stock_id).tags)) {
                            return JSON.parse(this.$store.getters["getWatchlistItem"](this.stock_id).tags)
                        } else {
                            return this.models;
                        }
                    } else {
                        return this.models;
                    }
                },
                async set(val) {
                    this.models = val.map(v => {
                        if (typeof v === 'string') {
                            v = {text: v, color: this.colors[this.nonce - 1] };
                            this.items.push(v);
                            this.nonce++;
                        }
                        return v;
                    });

                    try {
                        const response = await ApiService.addTags({
                            user_id: JSON.parse(localStorage.getItem('user')).user_id,
                            stock_id: this.stock_id,
                            tags : JSON.stringify(this.models)
                        });

                        console.log('saved tags', response.data);

                        const item = {
                            stock_id: this.stock_id,
                            tags : JSON.stringify(this.models)
                        };

                        this.$store.commit("updateWatchlistItemTags", item);

                    } catch(error) {
                        console.log(error.message);
                    }
                }
            }
        },

        created() {
            window.addEventListener('click', this.close);
        },

        beforeDestroy() {
            window.removeEventListener('click', this.close);
        },
    })
</script>
<style >

</style>
<style scoped>
    * {
        margin: 0;
        box-sizing: border-box;
    }

    body {
        font-family: "Helvetica Neue";
        background: #fafafa;
        padding: 10rem;
    }

    @media (max-width: 480px) {
        body {
            padding: 0;
        }
    }

    .tagsDropDown {
        z-index: 10;
        position: absolute;
        right:10px;
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 5px 0 0 0 ;
        width:360px;box-shadow: 10px 13px 48px -4px rgba(0,0,0,0.49);
        overflow-y: visible;
        -webkit-overflow-scrolling: touch;  /* what is this ? */
    }
    .emptyTag{
        opacity: 0;
    }
     .emptyTag:hover{
        opacity: 1;
     }
</style>

<template lang="pug">
    div(style="max-width: 43px;width:100%;cursor:pointer; min-height:20px; float: right; padding: 10px 0px;" @click="showDropDown = true")
        v-chip(
                v-if="screenername!==''"
                label small
                class="ma-1"
                style="background:#2196f3!important;color:white"
                ) ...
        div(v-show="showDropDown"
            class="tagsDropDown"
            style="border:1px solid"
            )
            div(v-if="screenername!==''")
                div(style="display:flex; border-bottom: 1px solid; margin-left:5px;")
                    label(v-if="!screenername" style="color:#dddddd") Rename Screener
                        input(type="text"
                            :disabled="true"
                            class="mx-3 my-2 px-2 rename-screener"
                            style="border:1px solid silver; width:50%;"
                            @keyup.enter="renameScreener(final_name)"
                            v-model="screener_name")
                    label(v-else) Rename Screener
                        input(type="text"
                            class="mx-3 my-2 px-2 rename-screener"
                            style="border:1px solid silver; width:50%;"
                            @keyup.enter="renameScreener(final_name)"
                            v-model="screener_name")
                div(style="margin:5px")
                    span(v-if="!screenername" style="color:#dddddd") Delete Screener
                    span(v-else @click="deleteScreener(screenername)" class="delete-screener") Delete Screener {{screenername}}
</template>

<script>
    import ApiStocks from '@/Services/ApiStocks.js';
    import ApiService from '@/Services/ApiService.js';

    export default {
        name: 'TagSelector3',
        props: {
            screenername: String
        },
        data: function() {
            return {
                showDropDown: false,
                name: '',
                final_name: ''
            }
        },
        methods: {
            renameScreener(name) {
                let screen_id = this.$store.getters['screenerFilters'].find(item=> item.name === this.screenername).screen_id;
                let screen_index = this.$store.getters['screenerFilters'].findIndex((s) => s.name === this.screenername);
                ApiService.updateScreenFilters({
                        name: name,
                        screen_id: screen_id,
                    }).then((res) => {
                        let data = {
                            name: name,
                            index : screen_index
                        }
                        this.$store.commit('renameScreenerFilters' , data );
                        this.showDropDown = false;
                    });
            },
            deleteScreener(name) {
                let screen_id = this.$store.getters['screenerFilters'].find(item=> item.name === name).screen_id;
                let screen_index = this.$store.getters['screenerFilters'].findIndex((s) => s.name === name);
                ApiService.deleteScreen(screen_id)
                    .then(() => {
                        this.$store.commit('removeScreenerFilters' , screen_index );
                        this.showDropDown = false;
                        this.$emit('navigateScreener', screen_index);
                    })
                    .catch((error) => {
                        console.log("--- --------" + error.message);
                    });
            },
            removeTag(tag) {
                let tags = this.assignedTag;

                tags = tags.filter(item=> item.text !== tag);

                ApiService.addTags({
                    user_id: JSON.parse(localStorage.user).user_id,
                    stock_id: this.stock_id,
                    tags : JSON.stringify(tags)
                })
                    .then((response) => {
                        console.log('saved tags', response.data);
                        let item = {
                            stock_id: this.stock_id,
                            tags : JSON.stringify(tags)
                        };
                        this.$store.commit("updateWatchlistItemTags", item);
                    })

                this.showDropDown = true;
            },
            close(e) {
                if (! this.$el.contains(e.target)) {
                    this.showDropDown = false;
                }
            },
        },
        computed: {
            screener_name: {
                get() {
                    return this.screenername
                },
                set(val) {
                    this.name = val;
                }
            }
        },
        watch: {
            name() {
                this.final_name = this.name;
            }
        },
        created() {
            window.addEventListener('click', this.close);
        },

        beforeDestroy() {
            window.removeEventListener('click', this.close);
        },
    }
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
        right: 45px;
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

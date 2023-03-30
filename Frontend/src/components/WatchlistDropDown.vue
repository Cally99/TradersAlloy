<template lang="pug">
    div(style="max-width: 300px;width:100%;cursor:pointer; min-height:20px;" @click="showDropDown = true" )
        div
            v-chip(
                    label
                    color="blue4"
                    class="ma-1 blue1--text"
                    style="width:30px;color:white"
                   )
                        v-icon(style="font-size:25px;width:100%;") mdi-dots-vertical

        div(v-show="showDropDown"
            class="tagsDropDown grey3"
            style="border:1px solid"
            )
            //- <div class="pt-1 pb-1 pl-1" style="border-bottom: 1px solid #A3B3C2; margin-left:10px; margin-right:10px;">
            //-     span(v-if="watchlistname === 'all watchlists'" class="d-flex pb-2 ml-1" style="color:#dddddd;") {{this.$t('configure_watchlist_columns')}}
            //-     span(v-else @click="configureWatchlist" class="d-flex pb-2 ml-1") {{this.$t('configure_watchlist_columns')}}
            //- </div> 
            <div style="display:flex; margin-left:10px; margin-right:10px; border-bottom: 1px solid #A3B3C2;">
                label(v-if="watchlistname === 'all watchlists'" class="ml-2" style="color:#dddddd;") {{this.$t('rename_watchlist')}}
                    input(type="text"
                        :disabled="true"
                        class="mx-3 my-2 px-2"
                        style="border:1px solid #859AAD !important; width:50%;"
                        v-model="watchlist_name")
                label(v-else class="ml-2") {{this.$t('rename_watchlist')}}
                    input(type="text"
                        class="mx-3 my-2 px-2 white"
                        style="border:1px solid #859AAD !important; width:50%;"
                        @keyup.enter="renameWatchlist(final_name)"
                        v-model="watchlist_name")
            </div>

            <div style="margin:10px;">
                span(v-if="watchlist_name === 'all watchlists'" style="color:#dddddd; margin-left:10px;") {{this.$t('delete_watchlist')}}
                span(v-else @click="deleteWatchlist" style="margin-left:10px;") {{this.$t('delete_watchlist')}}
            </div>
            
</template>

<script>
    import ApiStocks from '@/Services/ApiStocks.js';
    import ApiUserFun from '@/Services/ApiUserFun.js';

    export default {
        name: 'TagSelector3',
        props: {
            watchlistname: String
        },
        data: function() {
            return {
                showDropDown: false,
                name: '',
                final_name: ''
            }
        },
        methods: {
            renameWatchlist(name) {
                let id = this.$store.getters['getWatchlists'].find(item=> item.name == this.watchlistname).watchlist_id
                ApiStocks.changeWatchlistName({
                        name: name,
                        watchlist_id: id,
                    }).then((res) => {
                        let data = {
                            name: name,
                            watchlist_id : id
                        }
                        this.$store.commit('renameWatchlist' , data )
                        this.showDropDown = false
                    });
            },  
            deleteWatchlist() {
                let watchlist_id = this.$store.getters['getWatchlists'].find(item=> item.name == this.watchlistname).watchlist_id
                let watchlist_index = this.$store.getters['getWatchlists'].findIndex(item=> item.name == this.watchlistname)
                ApiUserFun.deleteWatchlist(watchlist_id)
                    .then(() => {
                        this.$store.commit('removeWatchlist' , watchlist_id )
                        this.showDropDown = false
                        this.$emit('navigateWatchlist', watchlist_index)
                    })
                    .catch((error) => {
                        console.log("--- --------" + error.message);
                    });
            },
            removeTag(tag) {
                var tags = this.assignedTag

                tags = tags.filter(item=> item.text != tag)

                ApiService.addTags({
                    user_id: JSON.parse(localStorage.user).user_id,
                    insref: this.insref,
                    tags : JSON.stringify(tags)
                })
                    .then((response) => {
                        console.log('saved tags', response.data)
                        var item = {
                            insref: this.insref,
                            tags : JSON.stringify(tags)
                        }
                        this.$store.commit("updateWatchlistItemTags", item);
                    })
                
                this.showDropDown = true
            },
            close(e) {
                if (! this.$el.contains(e.target) || e.target.id == "close-drop-down") {
                    this.showDropDown = false
                }
            },
        },
        computed: {
            watchlist_name: {
                get() {
                    return this.watchlistname
                },
                set(val) {
                    this.name = val
                }
            }
        },
        watch: {
            name() {
                this.final_name = this.name
            }
        },
        created() {
            window.addEventListener('click', this.close)
        },

        beforeDestroy() {
            window.removeEventListener('click', this.close)
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
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 5px 0 0 0 ;
        width:360px;
        border-radius: 3px;
        box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.25);
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

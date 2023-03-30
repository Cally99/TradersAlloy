<template lang="pug">
    div(style="max-width:43px; width:100%; cursor:pointer; min-height:20px; float:right;" @click="showDropDown=true")
        div
            v-chip( v-if="screenername!==''"
                    label
                    color="blue4"
                    class="ma-1 blue1--text"
                    style="width:30px;color:white"
                    )
                        v-icon(style="font-size:25px;width:100%;") mdi-dots-vertical

        div(v-show="showDropDown"
            class="grey7 tagsDropDown pl-1 pr-2"
            style="width:390px;"
            )
            div(v-if="screenername!==''")
                div(style="display:flex; border-bottom:1px solid #859AAD;")
                    label(v-if="!screenername" class="ml-1" style="color:#dddddd") {{this.$t('rename_screener')}}
                        input(type="text"
                            :disabled="true"
                            class="mx-3 my-2 px-2 rename-screener"
                            style="background-color:white; border:1px solid silver; width:195px;"
                            @keyup.enter="renameScreener(final_name)"
                            v-model="screener_name")
                    label(v-else class="ml-1") {{this.$t('rename_screener')}}
                        input(type="text"
                            class="ml-3 mb-2 px-2 rename-screener"
                            style="background-color:white; border:1px solid silver; width:195px;"
                            @keyup.enter="renameScreener(final_name)"
                            v-model="screener_name")
                div(class="mt-1 mb-1")
                    span(v-if="!screenername" class="ml-1" style="color:#dddddd") {{this.$t('delete_screener')}}
                    span(v-else @click="deleteScreener(screenername)" class="delete-screener ml-1") {{this.$t('delete_screener')}}
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
                var screen_id = this.$store.getters['screenerFilters'].find(item=> item.name === this.screenername).screen_id;
                var screen_index = this.$store.getters['screenerFilters'].findIndex((s) => s.name === this.screenername);
                ApiService.updateScreenFilters({
                        name: name,
                        screen_id: screen_id,
                    }).then((res) => {
                        var data = {
                            name: name,
                            index : screen_index
                        }
                        this.$store.commit('renameScreenerFilters' , data );
                        this.showDropDown = false;
                    });
            },
            deleteScreener(name) {
                var screen_id = this.$store.getters['screenerFilters'].find(item=> item.name === name).screen_id;
                var screen_index = this.$store.getters['screenerFilters'].findIndex((s) => s.name === name);
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
                var tags = this.assignedTag;

                tags = tags.filter(item=> item.text !== tag);

                ApiService.addTags({
                    user_id: JSON.parse(localStorage.user).user_id,
                    stock_id: this.stock_id,
                    tags : JSON.stringify(tags)
                })
                    .then((response) => {
                        console.log('saved tags', response.data);
                        var item = {
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
        width:360px;box-shadow: 2px 2px 6px rgba(0,0,0,0.3);
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

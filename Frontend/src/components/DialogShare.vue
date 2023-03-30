<template lang="pug">
    v-dialog( width="500"  v-model="show")
        v-sheet(style="height:400px;")
            v-card-title(class="headline grey lighten-2" primary-title) {{ $t('share')}}

            v-card-text

            div
                div(v-if="userFriends.length==0")
                    h3(class="mx-10") You have no friends!
                    div(class="ma-8") Invite friends who are already using Rapportkollen or trusted friends new to the service to review your research and knowledge.

                table(v-else)
                    tr( v-for="(friend, k) in userFriends" :key="k")
                        td {{friend.friend_email}}
                        td {{friend.status}}

                div(style="display:flex;")
                    v-text-field(class=" mb-0 mx-2 py-0" outlined dense style="flex:4;" type="text" v-model="friendEmail")

                    v-btn(color="#64b5f6" small type='button' style="text-transform:none;flex:1;" class="mx-2" @click="addFriend")
                        v-icon mdi-plus-circle-outline
                        span(class="mx-4") Add
                v-divider

            v-card-actions
                v-spacer
                v-btn(color="amber"
                    v-bind:disabled="this.userFriends.length<1"
                    class="px-12 mx-12 my-4"
                    style="text-transform:none;"  @click="UserResearchShare" ) {{$t('share')}}
</template>

<script>
    // input(class="form-control mb-0 pb-0"  style="height:24px;" type="text" v-model="friend.friend_email")
    // input( readonly class="form-control  mb-0 pb-0 text-right" style="height:24px;" type="number" min="0" step=".01" v-model="friend.status")
    import ApiUserFun from "../Services/ApiUserFun.js";

    export default {
        name: "DialogShare",
        props: {
            value: Boolean,
            stock_id: Number,
        },

        methods: {
            UserResearchShare() {
                var data = {
                    user_id : this.userId,
                    stock_id : this.stock_id,
                    email : JSON.parse(localStorage.user).email,
                    content : this.$store.getters['getFroalaContent'](this.stock_id).content
                }
                ApiUserFun.userResearchShare(data)
                    .then(result => {
                        console.log('@@@@@ userResearchShare @@@@@@@@@@', result)
                    });

                this.show = false
            },
            addFriend() {
                if (this.friendEmail != '') {
                    for (var i=0; i<this.userFriends.length; i++) {
                        if (this.userFriends[i].friend_email == this.friendEmail) return
                    }
                    const uf = {
                        user_id: this.userId,
                        status: 'created',
                        friend_email: this.friendEmail,
                        last_update_date: new Date()
                    };

                    ApiUserFun.addFriend(uf)
                        .then(f => {
                            this.userFriends.push(uf);
                        })

                    this.friendEmail = '';
                }
            },
        },
        computed: {
            show: {
                get () {
                    return this.value
                },
                set (value) {
                    this.$emit('input', value)
                }
            }
        },
        created: function() {
            console.log('----------DialogShare---------------');
            ApiUserFun.getFriends(this.userId)
                .then((response) => {
                   console.log('@@@@@ user friends @@@', response.data)
                    this.userFriends = response.data;
                });

        },
        data() {
            return {
                userId: JSON.parse(localStorage.user).user_id,
                friendEmail: '',
                userFriends: []
            }}
    }
</script>

<style scoped>
    td {
        text-align: left;
        padding: 0 20px;
    }
</style>




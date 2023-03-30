<template lang="pug">
    div
        v-btn( id="informAccountButton" class="blue3 white--text" small)
            v-icon( class="mr-2") mdi-currency-usd
            span( v-if="getUserAccountsShown.length === 1" class="ellipsis") {{ getUserAccountsShown[0].account_name }}
            span( v-else-if="getUserAccountsShown.length > 1" class="ellipsis") {{ getUserAccountsShown[0].account_name }} +{{ getUserAccountsShown.length - 1 }}
            span( v-else class="ellipsis") {{ $t('no_account_selected_yet') }}

        v-menu( @input="onMenuToggle" offset-y bottom left origin="top right" open-on-hover
            :close-on-content-click="false"
            transition="scroll-y-transition"
        )
            template( v-slot:activator="{ on, attrs }")
                v-btn( blue
                        v-bind="attrs"
                        v-on="on"
                        class="blue1 white--text negative-margin"
                        small
                )
                    v-icon mdi-chevron-down

            v-list( id="userAccountsContainer" ref="userAccountsListContainer" dense)
                v-list-item( v-for="account in selectedAccounts" class="cursor-pointer v-list-item--link v-list-sub-item v-list-item-height")
                    v-list-item-title {{ account.account_name }}
                    v-checkbox( v-model="account.is_selected" :disabled="getNumberOfSelectedAccounts < 2 && account.is_selected" @change="showAccount(account.user_account_id)" color="#244360")
</template>

<script>
import { mapActions } from "vuex";
import _ from 'lodash';

export default {
    name: 'UserAccountDropdownMenu',
    data() {
        return {
            user_id: JSON.parse(localStorage.getItem('user')).user_id,
            selectedAccounts: [],
            checkIfMenuOpen: 0
        };
    },

    props: {
        competition: Object
    },

    async mounted() {
        await this.onNoAccountsSelected();

        this.selectedAccounts = this.getUserAccounts.filter((a) => a.competition_id === null && a.is_ignored === false);
    },
    computed: {

        userCompetitionAccount()  {
            return this.$store.getters.getUserAccounts.find(a => a.competition_id === this.competition.competition_id);
        },
        getUserAccounts() {
            let accounts = this.$store.getters.getUserAccounts.filter((a) => a.competition_id === null && a.is_ignored === false);
            return _.orderBy(accounts, ['last_import_date'], ['desc']);
        },
        getNumberOfSelectedAccounts() {
            let counter = 0;

            for(const account of this.getUserAccounts) {
                if(account.is_selected) {
                    counter += 1;
                }
            }

            return counter;
        },
        getUserAccountsShown() {
            let userAccountsShown = this.$store.getters.getUserAccounts.filter((a) => a.is_ignored === false && a.is_selected === true && a.competition_id === null);

            userAccountsShown =  _.orderBy(userAccountsShown, ['last_import_date'], ['desc']);

            return userAccountsShown;
        }
    },
    methods: {
        ...mapActions([
            'updateUserAccount',
            'insertUserAccount'
        ]),
        async onMenuToggle() {
            this.checkIfMenuOpen += 1;
            this.$store.commit('setShowSelectedAccounts', false);

            if(this.checkIfMenuOpen === 4) {
                this.checkIfMenuOpen = 0;

                this.$store.commit('setShowSelectedAccounts', true);
            }
        },
        async onNoAccountsSelected() {
            if(this.getUserAccounts.filter((a) => a.is_selected === true).length === 0) {
                const account = this.getUserAccounts[0];

                account.is_ignored = false;
                account.is_selected = true;

                this.$store.commit('setUserAccounts', [account]);
                await this.updateUserAccount(account.user_account_id);

                this.selectedAccounts = JSON.parse(JSON.stringify(this.getUserAccounts));
            }
        },
        async showAccount(user_account_id) {
            this.$store.commit('setUserAccounts', this.selectedAccounts);
            await this.updateUserAccount(user_account_id);
        }
    }
}
</script>

<style scoped>
#informAccountButton {
    text-transform: none;
    width: 180px;
}

>>> #informAccountButton span.v-btn__content {
    display: inline-block;
    text-align: left;
}

#userAccountsContainer {
    width: 230px;
}


.v-list-item-height {
    height: 16px;
}

.negative-margin {
    margin: -3px;
}
</style>

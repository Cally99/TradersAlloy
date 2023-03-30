<template lang="pug">
v-container(style="background:black;"  :justify="center")
    v-row
        v-col
            // COMPETITIONS WITH INVITATION CODE
            v-card(style="max-width:300px; margin:30px; height:400px;" )
                div(v-if="!this.joining_private")
                    v-card-title {{$t('competition_by_invitation')}}
                        v-card-text
                            v-text-field(type="text" dense :label="$t('invitation_code')" :placeholder="$t('invitation_code')" outlined style="text-align:right;" v-model="short_code" id="invitationCode")

                        v-card-actions
                            v-btn( @click.stop="findCompetitionByShortCode()"  class="blue3 white--text") {{$t('register')}}

                div(v-else)
                    v-card-title {{$t('competition_by_invitation')}}
                        v-icon(style="position:absolute; top:13px; right:13px;" @click.prevent="close()") mdi-arrow-left

                    v-card-title
                        div {{competition.title}}

                        v-card-text
                            v-form
                                v-text-field(type="text" dense :label="$t('screen_name')" :placeholder="$t('screen_name')" outlined  v-model="screen_name")
                                v-btn( @click.prevent="addUserAccountToCompetition()" class="blue3 white--text") {{$t('start_now')}}
                div(style="position:absolute;bottom:0px;")
                    v-divider( class="mx-4")
                    div(class="pa-4")
                        div {{$t('host_a_competition')}}

    // PUBLIC COMPETITIONS
    //- v-card(v-for="competition of competitionsPublic" style="flex:1; margin:30px;" width="300")
        div(style="height:200px;")
            span(v-html="competition.html_thumbnail")

        v-card-title
            span(v-html="competition.svg_icon" style="margin-right:20px;")
            span {{competition.title}}

        v-card-subtitle
            span {{competition.date_from}} - {{competition.date_to}}
            span(class="ml-6") {{competition_status(competition)}}
        v-card-text

            div( v-if="joining_id === competition.competition_id")
                v-form
                    v-text-field(type="text" dense label="Screen Name" placeholder="Screen Name" outlined  v-model="screen_name")
                    v-text-field(type="text" dense label="Telephone" placeholder="Telephone" outlined  v-model="telephone")
                    v-btn( @click.prevent="addUserAccountToCompetition()" class="blue3 white--text") Start Now
            div( v-else)
                div Public Competition
                template(v-if="userCompetitions.find( c => competition.competition_id === c.competition_id)")
                    v-btn( disabled  class="blue3 white--text") Register
                    span(class="ml-5") Joined
                template(v-else)
                    v-btn( @click.stop="registerForPublicCompetition(competition.competition_id)"  class="blue3 white--text") Register

    //- v-card( style="flex:1; margin:30px;" width="300")
        v-card-text
            div(v-for="x of competitions") {{x.title}}
            v-divider
            div(v-for="x of userCompetitions") {{x.title}}

</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import moment from 'moment';


export default {
    name: "DialogCompetitions",
    props: {
        value: Boolean,
        checkShortCode: String
    },
    data () {
        return {
            user_id: JSON.parse(localStorage.user).user_id,
            joining_private: false,
            joining_id: null,
            short_code: '',
            screen_name: '',
            telephone: '',
            competition: null,
        }
    },
    mounted: function() {
        if(this.checkShortCode !== '') {
            this.short_code = this.checkShortCode;
            this.findCompetitionByShortCode();
        }

    },
    computed: {
        ...mapGetters(["getCompetitions"]),
        userCompetitions() {
            return this.$store.getters.getUserCompetitions;
        },
        competitions() {
            return this.$store.getters.getCompetitions;
        },
        competitionsPublic() {
            return this.getCompetitions.filter( c => c.is_public===true);
        },
    },
    methods: {
        ...mapActions(['insertUserAccount', 'loadUserAccounts', 'loadUserCompetitions']),
        ...mapMutations(['setUserCompetitionAddOne']),
        close() {
            this.joining_private=false;
        },
        competition_status(competition) {
            const today = new Date().toISOString().substring(0, 10);

            if ( today < competition.date_from) {
                const start = moment(today, "YYYY-MM-DD");
                const end = moment(competition.date_from, "YYYY-MM-DD");
                const daysToGo = moment.duration(end.diff(start)).asDays();
                return `Starts in ${daysToGo} days`;
            } else if ( today > competition.date_to ) {
                return "Completed"
            } else {
                return "Live"
            }
        },

        registerForPublicCompetition(id) {
            this.joining_id = id;
            this.competition = this.competitions.find( c => c.competition_id === id);
        },

        findCompetitionByShortCode(){
            this.competition = this.competitions.find( c => c.short_code.toUpperCase() === this.short_code.toUpperCase());

            if ( this.competition === undefined) {
                this.$store.commit('setMessage', { text: "Invitation Code not found", type: 'error' });
                return null;
            }

            if (this.userCompetitions.find( c => c.competition_id === this.competition.competition_id)) {
                this.$store.commit('setMessage', { text: "You are already registered for this competition.", type: 'error' });
                return null;
            } else {
                this.joining_private = true;
            }
        },

        async addUserAccountToCompetition() {
            if(localStorage.getItem(`${this.short_code}`) !== null) {
                localStorage.removeItem(`${this.short_code}`);
            }

            this.$emit("closeDialog", false);

            const competitionAccount = {
                user_id: this.user_id,
                user_account_id: null,  // if null a suitable ID will be generated for this user.
                account_name: this.screen_name,
                account_type: 'competition',
                competition_id: this.competition.competition_id,
                cash: 100000,
                nominal_position_size: 10,
                title: this.competition.title,
                svg_icon: this.competition.svg_icon,
                status: this.competition.status,
                currency: 'SEK',
                broker: null,
                order_preference: null,
                secret_key: null,
                last_import_date: null,
                hide:true,
                scale:0,
            };

            await this.insertUserAccount(competitionAccount);
            await this.loadUserAccounts(this.user_id);
            await this.loadUserCompetitions(this.user_id);

            this.joining_private = false;
            this.joining_id = undefined;
            this.competition = undefined;
            this.short_code = null;
            this.screen_name = null;
            this.dialog.value = false;
            this.dialog = false;
        }
    }
}
</script>

<style scoped>
.accountContainer{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    max-height: 680px;
}
.boxContainer{
    display: flex;
    flex-direction: column;
    background-color:#F8FAFC;
    min-height: 500px;
    border-radius: 5px;
    padding: 15px;
    box-shadow: 2px 3px 8px 0px rgba(0,0,0,0.2);
}
.accountBoxTittle{
    width: 150px;
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 20px;
    margin-left: 10px;
}
.accountBoxContent{
    width: 100%;
}
.passwordBoxContent{
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    width: 100%;
    height: 350px;
}
.subscriptionBox{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
}
.subscriptionBoxButtons{
    display: flex;
    padding: 15px;
    width: 100%;
}
.cancelPremiumBox{
    display:flex;
    align-items: end;
    justify-content: space-between;
}
.my-header-style {
  color: #6f8fb9;
}
</style>

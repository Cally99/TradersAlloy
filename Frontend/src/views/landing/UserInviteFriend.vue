<template lang="pug">
    v-dialog( v-model="show" max-width="900px")
        v-card
            v-card-title(style="font-size:30px; color: #325D85;")  {{ $t('Invite_a_friend') }}
            v-divider(class="mt-0")
            v-card-text(class="InviteFriendContainer")
                div(class="boxContainer")
                    div(class="emailBoxContent")
                        div(class="emailField" style="font-size:25px;") {{ $t('Email') }}
                        v-text-field(
                            v-model="friendEmail"
                            outlined dense flat
                            style="margin-top:30px;"
                            label="Friend's email"
                        )
                    div(class="buttonsBox")
                        v-btn(color="#325D85" @click="sendEmail" style="color:white;") {{ $t('Invite') }}

                    //- Popup to inform error to send email
                    v-dialog(v-model="emailError" max-width="600px")
                        v-card(class="errorAndsendedPopup")
                            div(class="errorAndsendedText")
                                span {{ $t('write_valid_email') }}

                    //- Popup to inform email sended
                    v-dialog(v-model="emailSended" max-width="600px")
                        v-card(class="errorAndsendedPopup")
                            div(class="errorAndsendedText")
                                span {{ $t('email_has_been_sent') }}
</template>

<script>
import ApiService from "../../Services/ApiService";

    export default {
        name: "UserInviteFriend",
        props: {
            value: Boolean
        },
        data () {
            return {
                emailError: false,
                emailSended: false,
                friendEmail: "",
                user: null,
            }
        },
        computed: {
            show: {
                get () {
                    return this.value;
                },
                set (value) {
                    this.$emit('input', value);
                }
            },
        },
        methods: {
            validateEmail (emailAdress) {
                let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (emailAdress.match(regexEmail)) {
                    return true; 
                } else {
                    return false; 
                }
            },

            // let emailAdress = "test@gmail.com";
            // console.log(validateEmail(emailAdress));
            async sendEmail(){
                const user = await ApiService.findUser(JSON.parse(localStorage.user).user_id);
                this.user = user;

                const requestBody = {
                    userEmail: this.user.email,
                    friendEmail: this.friendEmail
                };

                const validate = this.validateEmail(this.friendEmail);

                if(validate){
                    this.emailSended = true;
                    await ApiService.sendInvitationToFriend(requestBody);
                } else {
                    this.emailError = true;
                }
            },
        }
    }
</script>

<style scoped>
.InviteFriendContainer{
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 200px;
}
.boxContainer{
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 340px;
    border-radius: 5px;
    padding: 15px;
}
.InviteFriendBoxTittle{
    width: 150px;
}
.emailBoxContent{
    display: flex;
    padding: 15px;
    width: 70%;
}
.emailField{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20%;
}
.buttonsBox{
    display: flex;
    width: 70%;
    justify-content: end;
}

.errorAndsendedPopup {
    display: flex;
    flex-direction: column;
    padding: 25px;
}
.errorAndsendedText {
    display: flex;
    justify-content: space-around;
    align-items: center;
}

</style>
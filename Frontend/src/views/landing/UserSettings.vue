<template lang="pug">
    v-dialog(v-model="showDialog" max-width="500px")
        v-card
            v-card-title 
                span(class="settingsTittle") {{ $t('User_settings') }}
            v-card-subtitle(class="py-0" style="color: #767373") {{this.user.email}}
            div(class="mt-0" style="height: 5px; width:100%; border-bottom: 1px solid #000000;")
            v-card-text
                div(class="settingsContainer")

                    //- Choose language
                    div(class="languageContainer")
                        div(class="languageBoxTittle") {{ $t('Language') }}
                        div(class="languageBoxContent")
                            v-btn-toggle(mandatory id="language" :value="language" color="white" style="border:1px solid #4d80b1; border-radius:0px;")
                                //- v-btn(@click="" x-small tile depressed value="da" disabled) Danish
                                //- v-btn(@click="" x-small tile depressed value="no" disabled) Norwegian
                                v-btn(v-if="toggledEN" @click="change_english('en')" color="#4077AB" small tile depressed value="en" style="text-transform: capitalize;") {{ $t('English') }}
                                v-btn(v-if="!toggledEN" @click="change_english('en')" color="white" small tile depressed value="en" style="text-transform: capitalize;") {{ $t('English') }}

                                v-btn(v-if="toggledSV" @click="change_swedish('sv')" color="#4077AB" small tile depressed value="sv" style="text-transform: capitalize;") {{ $t('Swedish') }}
                                v-btn(v-if="!toggledSV" @click="change_swedish('sv')" color="white" small tile depressed value="sv" style="text-transform: capitalize;") {{ $t('Swedish') }}

                    //- Reset Password
                    div(class="passwordContainer")
                        div(class="passwordBoxTittle") {{ $t('Reset_Password') }}
                        div(class="passwordBoxContent")
                            div(class="passwordField")
                                div {{ $t('Current_Password') }}
                                div(class="field")
                                    v-text-field(
                                        hide-details="true"
                                        v-model="password"
                                        :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                                        :type="showPass ? 'text' : 'password'"
                                        :rules="[rules.required, rules.min]"
                                        name="password"
                                        hint="At least 8 characters"
                                        @click:append="showPass = !showPass"
                                        outlined dense flat
                                        )
                            div(class="passwordField")
                                div {{ $t('New_Password') }}
                                div(class="field" style="margin-top: 8px;")
                                    v-text-field(
                                        hide-details="true"
                                        v-model="newPassword"
                                        :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                                        :type="showPass ? 'text' : 'password'"
                                        :rules="[rules.required, rules.min]"
                                        name="password"
                                        hint="At least 8 characters"
                                        @click:append="showPass = !showPass"
                                        outlined dense flat)
                            div(class="passwordField")
                                div {{ $t('Confirm_New_Password') }}
                                div(class="field" style="margin-top: 8px;")
                                    v-text-field(
                                        hide-details="true"
                                        v-model="confirmedNewPassword"
                                        :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                                        :type="showPass ? 'text' : 'password'"
                                        :rules="[rules.required, rules.min]"
                                        name="password"
                                        hint="At least 8 characters"
                                        @click:append="showPass = !showPass"
                                        outlined dense flat)
                            div(class="resetButtonContainer")
                                v-btn(class="resetButton" small color="#325D85" @click.prevent='resetPassword' style="text-transform: capitalize;") {{ $t('Reset') }}

                    //- Notifications
                    div(class="notificationsContainer")
                        div(class="notificationSwitchBox")
                            div() {{this.$t('Weekly_Reports')}}
                            v-switch(style="margin-left: 38px;" color="light-green darken-1" @change="updateNotifications()" v-model="userNotifications.weeklyReports")
                        div(class="notificationSwitchBox" style="margin-top: -20px;")
                            div {{this.$t('Newsletters')}}
                            v-switch(style="margin-left: 50px;" color="light-green darken-1" @change="updateNotifications()" v-model="userNotifications.newsletters")

                    //- Delete account
                    div(class="deleteAccContainer")
                        div(class="deleteBoxTittle") {{ $t('Privacy_and_Delete_Account') }}
                        div(style="margin: 5px 0 0 25px;")
                            div() {{ $t('Remove_all_data_for_this_account_and_forget_me_forever') }}
                            v-btn(v-if="!deleteDialog" style="text-transform: capitalize; margin-top:10px; color: #6A6A6A;" color="#E3EDF5" @click="showDialogDelete" x-small depressed ) {{ $t('Delete_Registration') }}

                            div(v-if="deleteDialog" style="margin-top:5px; display: flex; align-items: center; justify-content:space-between;")
                                span(style="margin-top: -40px;") {{ $t('confirm_with_password') }}
                                div(style="width:215px;")
                                    v-text-field(
                                        hide-details="true"
                                        v-model="passwordToDeleteAcc"
                                        name="password"
                                        hint="At least 8 characters"
                                        :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                                        :type="showPass ? 'text' : 'password'"
                                        :rules="[rules.required, rules.min]"
                                        @click:append="showPass = !showPass"
                                        outlined dense flat
                                        )
                                    div(style="display:flex; justify-content:end; margin-top: 10px;")
                                        v-btn(style="color:white; margin-right:10px; text-transform: capitalize;" small color="#325D85" @click.prevent="cancelDelete") {{ $t('Cancel') }}
                                        v-btn(style="color:red; text-transform: capitalize;" small color="#325D85" @click.prevent="deleteRegistration" ) {{ $t('Confirm_Delete') }}

                    //- Popup to inform account deleted
                    v-dialog(v-model="accountDeletedPopup" max-width="400px")
                        v-card(class="confirmDeletePopup")
                            div(class="deletePopupText")
                                span Your data will be deleted tonight

                    //- Save and Close Button
                    div(class="saveAndCloseButton")
                        v-btn(style="text-transform: capitalize; color:white;" small color="#325D85" @click.prevent='saveAndClose') {{ $t('Save_and_Close') }}

                    //- tr
                    //-     td(class="left px-4") {{ $t('Theme') }}
                    //-     td(class="left")
                    //-         v-btn-toggle(mandatory id="theme" :value="isDark" color="primary")
                    //-             v-btn(@click="change_theme('false')" x-small tile depressed value="false") Bright
                    //-             v-btn(@click="change_theme('true')" x-small tile depressed value="true") Dark


</template>


<script>
    import apiService from "@/Services/ApiService";
    import ApiService from "../../Services/ApiService";
    import i18n from "@/plugins/i18n";
	import Cookies from 'js-cookie'

    export default {
        name: "UserSettings",
        components: {apiService},
        props: {
            value: Boolean
        },
        data() {
            return {
                toggledEN: false,
                toggledSV: false,
                accountDeletedPopup: false,
                passwordToDeleteAcc: "",
                deleteDialog: false,
                userNotifications: {
                    weeklyReports: true,
                    newsletters: true
                },
                user: {email: "pending"},
                showPass: false,
                password: "",
                newPassword: "",
                confirmedNewPassword: "",
                rules: {
                    required: value => !!value || "Required.",
                    min: v => v.length >= 8 || "Min 8 characters",
                },
                language: "sv",
                darkMode: false
            };
        },
        methods: {
            async deleteRegistration() {
                const email = JSON.parse(localStorage.user).email;
                const password = this.passwordToDeleteAcc;
                const verifyPass = await this.verifyUserPassword(email, password);

                if(verifyPass){
                    this.accountDeletedPopup = true;
                    setTimeout(async function() {
                        await ApiService.deleteUser(this.user.user_id);
                        localStorage.removeItem('user');
						Cookies.remove('user');
                        window.location.href = "/";
                    }, 1500);
                };
            },
            cancelDelete() {
                this.deleteDialog = false;
                this.passwordToDeleteAcc = "";
            },
            showDialogDelete() {
                this.deleteDialog = true;
            },
            async updateNotifications() {
                const requestBody = {
                    user_id : this.user.user_id,
                    weekly: this.userNotifications.weeklyReports,
                    newsletter: this.userNotifications.newsletters
                };
                await ApiService.userNotifications(requestBody);
                const user = await ApiService.findUser(JSON.parse(localStorage.user).user_id);
                this.user = user;
            },
            // change_theme(theme) {
            //     if (theme == 'true') {
            //         this.$vuetify.theme.dark = true;
            //         this.darkMode = true;
            //     } else {
            //         this.$vuetify.theme.dark = false;
            //         this.darkMode = false;
            //     }

            //     let temp = {};
            //     temp.language = this.language;
            //     temp.is_dark = this.darkMode;
            //     temp.settings = this.$store.getters.getUserSettings;

            //     ApiService.addUserSettings({
            //         id: JSON.parse(localStorage.user).user_id,
            //         settings: temp
            //     }).then(response => {
            //         console.log("saved dark mode");
            //         this.updateLocalstorageUserData(temp);
            //     });
            //     // this.isDark = theme;
            // },
            async change_swedish(local) {
                i18n.locale = local;
                this.language = local;

                let temp = {};
                temp.is_dark = this.darkMode;
                temp.language = local;
                temp.settings = this.$store.getters.getUserSettings;

                const userSettings = {
                    id: JSON.parse(localStorage.user).user_id,
                    settings: temp
                }
                await ApiService.addUserSettings(userSettings)
                this.updateLocalstorageUserData(temp);
                this.toggledEN = false;
                this.toggledSV = true;
            },
            async change_english(local) {
                i18n.locale = local;
                this.language = local;

                let temp = {};
                temp.is_dark = this.darkMode;
                temp.language = local;
                temp.settings = this.$store.getters.getUserSettings;

                const userSettings = {
                    id: JSON.parse(localStorage.user).user_id,
                    settings: temp
                }
                await ApiService.addUserSettings(userSettings);
                this.updateLocalstorageUserData(temp);
                this.toggledEN = true;
                this.toggledSV = false;
            },
            getTodaysDate() {
                return new Date().toISOString().slice(0, 10);
            },
            saveAndClose() {
                this.user.settings = {
                    language: this.language,
                    // currency: this.currency,
                    // dateFormat: "YYYY-MM-DD",
                    // theme: this.theme
                };
                this.passwordToDeleteAcc = "";
                this.password = "";
                this.confirmedNewPassword = "";
                this.newPassword = "";
                this.deleteDialog = false;

                this.showDialog = false;
                // this.screen = {
                //     tabs: ["dashboard", "ERIC_B", "watchlist", "portfolio", "ESENSE"]
                // };
                // this.account = {}; //?

                // ApiService.updateUser(this.user).then(user => {
                //   localStorage.user = user;
                // });
            },
            async verifyUserPassword(email, password) {
                const userRequestData = {
                    email: email,
                    password: password
                }
                const passwordBoolean = (await ApiService.verifyUserPassword(userRequestData)).data.passwordVerify;
                if(passwordBoolean){
                    return true;
                } else {
                    this.$store.commit('setMessage', { text: 'Incorrect password', type: 'error' });
                    return false;
                }
            },

            async resetPassword() {
                const email = JSON.parse(localStorage.user).email;
                const password = this.password;

                const userRequestData = {
                    id: JSON.parse(localStorage.user).user_id,
                    password: this.newPassword
                }
                const verifyPass = await this.verifyUserPassword(email, password);

                if(verifyPass) {
                    if (this.password.length >= 8 && this.confirmedNewPassword.length >= 8 && this.newPassword.length >= 8 && this.confirmedNewPassword === this.newPassword) {
                        await ApiService.resetPassword(userRequestData);
                        this.$store.commit('setMessage', { text: 'Password changed successfully', type: 'success' });
                    } else {
                        this.$store.commit('setMessage', { text: 'Incorrect password', type: 'error' });
                    }
                } else {
                    console.log("password is not correct");
                }
                
            },
            updateLocalstorageUserData(settings) {
                let temp = JSON.parse(localStorage.user);
                temp.settings = JSON.stringify(settings);
                localStorage.user = JSON.stringify(temp);
            }
        },
        computed: {
            isDark: {
                get() {
                    return this.$vuetify.theme.isDark;
                },
                set() {
                    this.$vuetify.theme.isDark = !this.$vuetify.theme.isDark;
                }
            },
            showDialog: {
                get() {
                    return this.value;
                },
                set(value) {
                    this.$emit("input", value);
                }
            }
        },

        mounted() {
            if (localStorage.user) {
                var temp_user_data = JSON.parse(localStorage.user);
                if (JSON.parse(localStorage.user).subscription_id != null) {
                    temp_user_data.type = "premium";
                }
                this.user = temp_user_data;
            }
            let is_obj = typeof JSON.parse(localStorage.user).settings === "object" ? JSON.parse(localStorage.user).settings : JSON.parse(JSON.parse(localStorage.user).settings);
            if (is_obj.language) {
                this.language = is_obj.language;
            } else {
                this.language = "sv";
            }

            if(this.language === "sv") {
                this.toggledEN = false;
                this.toggledSV = true;
            } else {
                this.toggledEN = true;
                this.toggledSV = false;
            }

            if (is_obj.is_dark) {
                this.darkMode = is_obj.is_dark;
            } else {
                this.darkMode = false;
            }
        },

        created: async function () {
            const user = await ApiService.findUser(JSON.parse(localStorage.user).user_id);
            this.userNotifications.weeklyReports = user.email_weekly;
            this.userNotifications.newsletters = user.email_newsletter;
            if (user.subscription_id != null) {
                user.type = "premium";
            }
            this.user = user;
        }
    };
</script>

<style scoped>
.settingsContainer{
    display: flex;
    flex-direction: column;
    color:#000000;
    font-weight: 400;
    font-family: verdana;
    height: 620px;
    font-size: 12px;
}
.languageContainer{
    width: 300px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 10px 15px;
    height: 80px;
}
.languageBoxContent{
    margin-left: 30px;
}
.passwordContainer{
    display: flex;
    flex-direction: column;
    height: 230px;
    padding: 10px;
    border: 1px solid #cacaca;
}
.passwordBoxContent{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 180px;
    margin: 10px 0 0 55px;
}
.passwordField{
    display: flex;
    align-items: center;
    width: 305px;
    justify-content: space-between;
}
.field{
    width: 170px;
}
.resetButtonContainer{
    display: flex;
    width: 100%;
    margin: 20px 0 0 0;
    justify-content: end;
}
.resetButton{
    margin-top: -10px;
    color: white;
}
.notificationsContainer{
    display: flex;
    flex-direction: column;
}
.notificationSwitchBox{
    display: flex;
    padding: 0 0 0 15px;
    align-items: center;
    justify-content: space-between;
    width: 195px;
}
.deleteAccContainer{
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100px;
    padding: 15px;
    border-radius: 5px;
    border: 1px solid #cacaca;
}
.saveAndCloseButton{
    display: flex;
    justify-content: end;
    margin-top: 25px;
}
.settingsTittle{
    margin-bottom: 5px;
    font-size: 24px;
    font-weight: 400;
    color: #325D85;
}
.confirmDeletePopup{
    display: flex;
    flex-direction: column;
    padding: 25px;
}
.deletePopupText{
    display: flex;
    justify-content: space-around;
    align-items: center;
}
</style>

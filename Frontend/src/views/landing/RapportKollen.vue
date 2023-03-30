<template lang="pug">
    v-app
        div(:style="(this.getShortCode !== undefined) ? 'background-image:url(\"./images/landing_page_background.png\")' : ''" class="pt-15" style="height:100%; background-size: 2157px 1564px;")
            div(v-if="this.getShortCode !== undefined" class="d-flex justify-content-center")
                div(style="width:600px; max-height:300px;")
                    div(style="float:left; width:30%; height:100%;")
                        v-img(
                            src="/images/logo.png"
                            style="max-width:120px;"
                        )
                    div(style="float:left; width:70%; height:100%;")
                        v-img(
                            :src="`/images/${getCompetitionFromRoute.logo_image_url}`"
                            style="float:right; min-width:120px; max-height:120px;"
                        )
            div(v-else-if="this.getShortCode === undefined" style="display:flex; justify-content: space-around; margin: 0 auto; text-align:center;")
                v-img(
                    src="/images/traders-alloy-logo_icon-color-transprent SMALL.png"
                    style="flex:1; margin:30px 30px 0 0; max-width:110px; float:left;"
                )
            div(v-if="this.getShortCode !== undefined" class="text-center mt-3")
                h3( class="font-weight-bold" style="color: white; margin: 30px") Aktietävling
            div(v-if="this.getShortCode !== undefined" class="text-center mt-3")
                h3( style="color: white;") {{ getCompetitionFromRoute.title }}
            div(style="display:block; width:100%; text-align:center;")
                div(:style="(this.getShortCode !== undefined) ? '' : 'background-image:url(\"./images/constellation.png\")'" style="background-size: 1020px 720px;")

                    //-Login
                    div(v-if="page==='login'" style="width: 600px; display: block; margin: 100px auto;")
                        div(style="display:flex; min-width:500px;")
                            div(class="card account-card" style="flex:1;")
                                div(class="card-body")
                                    div(class="text-center mt-3")
                                        h3(class="font-weight-bold") {{$t('Login_account')}}

                                    div(class="p-3")
                                        form
                                            div(class="form-group")
                                                label( for="email" style="color:black") {{$t('Your_eMail')}}
                                                input( name="email" class="form-control" :placeholder="$t('Email')" @keydown.enter="login()" required type="text" v-model="email")

                                            div(class="form-group")
                                                label( for="userpassword" style="color:black") {{$t('Your_password')}}
                                                input( name="userpassword" class="form-control" :placeholder="$t('Password')" @keydown.enter="login()" required type="password" v-model="password")

                                            div(class="custom-control custom-checkbox" style="")
                                                input( id="customControlInline" class=" custom-control-input" type="checkbox" v-model="rememberMe")
                                                label( for="customControlInline" class="custom-control-label" style="float:left;") {{$t('Remember_me')}}

                                                span(style="float:right;")
                                                    i(class="mdi mdi-lock")
                                                    span(style="cursor:pointer;" @click="page='forgotten'") {{$t('Forgotten_password')}}?

                                            v-btn(class="ta-blue" id="logginBtn" @click.prevent="login") {{$t('Log_in')}}

                                        v-divider
                                        div(style="display:block; justify-content:space-around;gap:20px;")
                                            button(v-google-signin-button="clientId" class="google-signin-button outlined ta-white" style="padding:8px 8px;")
                                                img(src="/images/sso_google.png"  height='40' width='40')
                                                span( style="margin-left:20px;") {{$t('Continue_withGoogle')}}
                                            
                                            //- button(@click="logInWithFacebook" class="outlined ta-white")
                                            //-     img(src="/images/sso_facebook.png" height='40' width='40')
                                            //-     span( style="margin-left:20px;") {{$t('Continue_withFacebook')}}


                                        div(class="mt-4 mb-0 text-center")
                                            span {{$t('No_account')}}
                                            v-btn(style="cursor:pointer; padding: 0 20px; text-decoration:underline; color:#325D85;" id="registerBtn" @click="page='register'") {{$t('Register')}}


                    //- Register
                    div(v-else-if="page==='register'" style="width: 600px; display: block; margin: 100px auto;")
                        div(style="display:flex; min-width:500px;")
                            div( class="card account-card" style="flex:1;")
                                div( class="card-body")
                                    div( class="text-center mt-3")
                                        h3( class="font-weight-bold") {{$t('CREATE_ACCOUNT_Upper')}}

                                    div( class="p-3")
                                        form
                                            div(class="form-group")
                                                label( for="email"  style="color:black") {{$t('Your_eMail')}}
                                                input( v-model='email' type="email" class="form-control" id="email" :placeholder="$t('Email')")

                                            div( class="form-group")
                                                label( for="userpassword"  style="color:black") {{$t('Choose_your_password')}}
                                                //- :rules="[rules.required, rules.min]"
                                                v-text-field( v-model="password"
                                                    name="password"
                                                    hint="Minst 8 tecken"
                                                    counter
                                                    outlined dense
                                                    :type="showPass ? 'text' : 'password'"
                                                    class="toggle"
                                                    height=45
                                                    :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                                                    @click:append="showPass = !showPass"
                                                    :dark="false"
                                                    :placeholder="$t('Password')"
                                                    id="input-27")

                                            div( class="custom-control custom-checkbox" style="float:left;")
                                                input( type="checkbox" class="custom-control-input" id="customControlInline" v-model="rememberMe")
                                                label( class="custom-control-label" for="customControlInline"  style="color:black") {{$t('Remember_me')}}


                                            v-btn(@click.prevent='addUser' class="ta-blue" id="submitRegistrationBtn") {{$t('CREATE_ACCOUNT_Upper')}}

                                        v-divider
                                        div(style="display:block; justify-content:space-around;gap:20px;")
                                            button(v-google-signin-button="clientId" class="google-signin-button outlined ta-white" style="padding:8px 8px;")
                                                img(src="/images/sso_google.png"  height='40' width='40')
                                                span( style="margin-left:20px;") {{$t('Continue_withGoogle')}}

                                            //- button(@click="logInWithFacebook" class="outlined ta-white")
                                            //-     img(src="/images/sso_facebook.png" height='40' width='40')
                                            //-     span( style="margin-left:20px;") {{$t('Continue_withFacebook')}}
                                        div(class="mt-4 mb-0 text-center")
                                            span {{$t('Have_account')}}
                                            span(style="cursor:pointer; padding: 0 20px; text-decoration:underline; color:#325D85;" @click="page='login'") {{$t('Log_in')}}


                    // - Forgotten
                    div(v-else-if="page==='forgotten'" style="width: 600px; display: block; margin: 100px auto;")
                        div(style="display:flex; min-width:500px;")
                            div( class="card account-card" style="flex:1;")
                                div( class="card-body")
                                    div( class="text-center mt-3")
                                        h3( class="font-weight-bold")
                                            a( class="text-dark text-uppercase account-pages-logo" href="/") {{$t('Reset_Password')}}
                                        p( class="text-muted") {{$t('enter_user_account')}}

                                        div( class="p-3")
                                            form
                                                div( class="form-group")
                                                    <!-- <input class="form-control" id="email" :placeholder="$t('Enter_email')" required type="text" v-model='email'> -->
                                                    v-text-field(
                                                        v-model="email"
                                                        placeholder="Email"
                                                        :disabled="is_submitted"
                                                        :label="$t('Email')"
                                                        required
                                                        outlined)
                                                    v-text-field(
                                                        v-show="is_submitted"
                                                        v-model="confirmCodeEntered"
                                                        placeholder="Confirm code via email"
                                                        :disabled="is_confirmed"
                                                        label="Confirm code"
                                                        required
                                                        outlined)
                                                    v-text-field(
                                                        v-show="is_confirmed"
                                                        v-model="password"
                                                        placeholder="Password"
                                                        :type="showPass ? 'text' : 'password'"
                                                        label="Password"
                                                        hint="At least 8 characters"
                                                        counter
                                                        outlined)
                                                div( class="mt-3")
                                                    v-btn(v-show="is_submitted == false && is_confirmed == false"
                                                        @click.prevent='getCode'
                                                        class="ta-blue") {{$t('email_secret_code')}}

                                                    v-btn( v-show="is_submitted && is_confirmed == false"
                                                        @click.prevent='confirm'
                                                        class="ta-blue"
                                                        ) {{$t('confirm_code')}}

                                                    v-btn( v-show="is_confirmed"
                                                        @click.prevent='newPassword'
                                                        class="ta-blue"
                                                        ) Submit

            //- SignupByInvitation(email="andrew@andrewboddy.com")

            v-snackbar(
                v-model="submit_info.show"
                top
                :timeout="3000"
                :color="submit_info.color") {{submit_info.message}}

</template>

<script>
    "use strict";
    import apiService from "@/Services/ApiService";

    import Login from "./UserLogin.vue";
    import Signup from "./UserSignup.vue";
    import SignupByInvitation from "./UserSignupByInvitation.vue";
    import facebookLogin from 'facebook-login-vuejs';
    import GoogleSignInButton from 'vue-google-signin-button-directive';
    import axios from 'axios';
    import VFacebookLogin from 'vue-facebook-login-component';
	import Cookies from 'js-cookie';

    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "RapportKollen",
        components: {
            Login,
            Signup,
            SignupByInvitation,
            facebookLogin,
            VFacebookLogin
        },
        directives: {
            GoogleSignInButton
        },

        data() {
            return {
                getParam: null,
                email: "",
                password: "",
				rememberMe: false,
                user: {},
                page: 'login',
                message: 'testing',
                is_submitted: false,
                is_confirmed: false,
                response: null,
                confirmCode: null,
                confirmCodeEntered: null,
                showPass: false,
                submit_info: {
                    show: false,
                    message: "",
                    timeout: 1000,
                    color: "rgba(255, 100, 100, 0.8)",
                },
                clientId: "476711244910-nfam7ujhhqcc5jnel8pjsdcjfmkld6ms.apps.googleusercontent.com",
                FB: undefined
            };
        },
        created() {
			if(Cookies.get('user') != null) {
				window.location.href = '/rapportkollen';
			}
			else {
				if (window.location.href.indexOf("/register") > 0) {
					this.page = 'register';
				} else  if (window.location.href.indexOf("/forgotten") > 0) {
					this.page = 'forgotten';
				} else if (this.getShortCode !== undefined) {
					this.page = 'register';
				}
				else  {
					this.page = 'login';
				}
			}
            
//        if (window.location.href.indexOf("/invitation") > 0) {
//            this.showDialogSignupByInvitation = true;
        },
        computed: {
            ...mapGetters(['getCompetitions']),
            loggedIn: {
                get: () => {
                    return Boolean(localStorage.getItem("user"));
                },
            },
            getShortCode() {
                return this.$route.params.short_code;
            },
            getCompetitionFromRoute() {
                if(this.getShortCode !== undefined) {
                    return this.getCompetitions.find((c) => c.short_code === this.getShortCode);
                }

                return null;
            }
        },
        async mounted() {
            await this.loadCompetitions();

            if (localStorage.user && localStorage.user != "undefined") {
                let data = JSON.parse(localStorage.user);
                this.user.email = data.email;
            }

            const urlParams = new URLSearchParams(window.location.search);

            if(urlParams.get('stockOverview') !== null) {
                this.getParam = urlParams.get('stockOverview');
            } else if(urlParams.get('unsubscribe_email_newsletter')) {
                this.getParam = urlParams.get('unsubscribe_email_newsletter');
            } else if(urlParams.get('show_premium')) {
                this.getParam = urlParams.get('show_premium');
            }

            await this.loadFacebookSDK(document, "script", "facebook-jssdk");
            await this.initFacebook();
        },
        methods: {
            ...mapActions(['loadCompetitions']),
            async OnGoogleAuthSuccess (idToken) {
                let url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
                let user_data = await axios.get(url);
                this.email = user_data.data.email;
                this.password = "asdfasdf";
                this.GoogleFacebooksignin();
            },
            OnGoogleAuthFail (error) {
                console.log(error);
            },

            logInWithFacebook() {
                let self = this;
                window.FB.login(async function(response) {
                    console.log('*****************', response);
                    if (response.authResponse) {
                        // let url = "https://graph.facebook.com/" + response.authResponse.userID + "?fields=email&access_token=" + response.authResponse.accessToken;
                        // let user_data = await axios.get(url);
                        
                        window.FB.api('/me', {fields: 'email'}, function(response) {
                            console.log('facebook api response ======', response);
                            self.email = response.email;
                            self.password = 'asdfasdf';
                            self.GoogleFacebooksignin();
                        });
                        
                    } else {
                        alert("User cancelled login or did not fully authorize.");
                    }
                }, {scope: 'email'});
                return false;
            },
            async initFacebook() {
                window.fbAsyncInit = function() {
                    window.FB.init({
                        appId: "873511180038385",
                        autoLogAppEvents : true,
                        xfbml: true,
                        cookie: true,
                        version: "v12.0"
                    });
                };
            },
            async loadFacebookSDK(d, s, id) {
                var js,
                    fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            },


            async getCode() {
                if (this.email == '') {
                    this.submit_info.message = 'Required email';
                    this.submit_info.show = true;
                    return;
                }

                try {
                    const userEmailObject = {
                        email: this.email
                    };

                    const response = await apiService.forgotPassword(userEmailObject);
                    if (response.flag !== undefined) {
                        throw new Error(response.data);
                    }
                    this.confirmCode = response;
                    this.is_submitted = true;
                } catch(error) {
                    this.submitFailed(error);
                }
            },
            confirm() {
                if (this.confirm_code == this.confirm_code_entered) {
                    this.is_confirmed = true
                } else {
                    this.submit_info.message = 'Wrong code'
                    this.submit_info.show = true
                }
            },
            async newPassword () {
                if (this.password.length < 8) {
                    this.submit_info.message = 'Password should be 8 letters at least';
                    this.submit_info.show = true;
                } else {
                    const response = await apiService.newPassword({
                        email: this.email,
                        password: this.password
                    });
					if(this.rememberMe) {
						Cookies.set('user', JSON.stringify(response.data));
					}
					localStorage.setItem('user', JSON.stringify(response.data));
					if(this.getShortCode !== undefined) {
                        localStorage.setItem(`${this.getShortCode}`, true);
                    }
                    window.location.href = '/rapportkollen';
                }
            },
            submitFailed(error) {
                this.submit_info.message = error.message || 'Error Submit';
                this.submit_info.show = true;
                localStorage.removeItem('user');
				Cookies.remove('user');
            },

            async login()  {
                if (this.email == "" || this.password == "") {
                    this.submit_info.message = "e-post och lösenord krävs";
                    this.submit_info.show = true;
                } else {
                    try {
                        for(const competition of this.getCompetitions) {
                            localStorage.removeItem(`${competition.short_code}`);
                        }

                        const response = await apiService.userLogin({
                            email: this.email,
                            password: this.password,
                        });

                        this.$store.commit("setMessage", {
                            text: "logged in",
                            type: "success",
                        });

						if(this.rememberMe) {
							Cookies.set('user', JSON.stringify(response.data));
						}
						localStorage.setItem('user', JSON.stringify(response.data));
						if(this.getShortCode !== undefined) {
                            localStorage.setItem(`${this.getShortCode}`, true);
                        }

                        const urlParams = new URLSearchParams(window.location.search);

                        if(urlParams.get('stockOverview') !== null) {
                            let fullUrlWithQueries = '';

                            if (/tab/i.test(urlParams.get('stockOverview'))) {
                                fullUrlWithQueries = urlParams.get('stockOverview');
                            } else {
                                fullUrlWithQueries = `${urlParams.get('stockOverview')}&tab=2`;
                            }

                            window.location.href = fullUrlWithQueries;
                        } else if(urlParams.get('unsubscribe_email_newsletter') !== null) {
                            window.location.href = "/rapportkollen/watchlist/?unsubscribe_email_newsletter=true";
                        } else if(urlParams.get('show_premium') !== null) {
                            window.location.href = "/rapportkollen/watchlist/?show_premium=true";
                        } else if(urlParams.get('verify_user') !== null) {
                            const user_id = urlParams.get('verify_user');
                            await apiService.verifyAndLogin(user_id);

							if(localStorage.getItem('user') != null) {
								let localUser = JSON.parse(localStorage.getItem('user'));
								localUser.type = 'freemium';

								localStorage.setItem('user', JSON.stringify(localUser));
								if(this.getShortCode !== undefined) {
                                    localStorage.setItem(`${this.getShortCode}`, true);
                                }
							}
                            
                            window.location.href = `/rapportkollen/watchlist/?verify_user=true`;
                        } else {
                            window.location.href = "/rapportkollen";
                        }
                    } catch(error) {
                        this.loginFailed(error);
                    }

                }
            },
            loginFailed(error) {
                this.submit_info.message = error.message || ": inloggningen misslyckades";
                this.submit_info.show = true;
                localStorage.removeItem('user');
				Cookies.remove('user');
            },
            async addUser() {
                if (this.email === "" || this.password === "") {
                    this.submit_info.message = "e-post och lösenord krävs";
                    this.submit_info.show = true;
                } else if (this.password.length < 8) {
                    this.submit_info.message = "Minst 8 tecken";
                    this.submit_info.show = true;
                } else {
                    try {
                        const response  = await apiService.addUser({
                            email: this.email,
                            password: this.password,
                        });
                        this.$store.commit("setMessage", {
                            text: "logged in",
                            type: "success",
                        });
						if(this.rememberMe) {
							Cookies.set('user', JSON.stringify(response.data));
						}
						localStorage.setItem('user', JSON.stringify(response.data));
						if(this.getShortCode !== undefined) {
                            localStorage.setItem(`${this.getShortCode}`, true);
                        }

                        window.location.href = "/rapportkollen";

                    } catch (error) {
                        this.loginFailed(error);
                    }
                }
            },
            async GoogleFacebooksignin() {
                try {
                    const response  = await apiService.continue_GF({
                        email: this.email,
                        password: this.password,
                    });
                    this.$store.commit("setMessage", {
                        text: "logged in",
                        type: "success",
                    });
                    if(this.rememberMe) {
						Cookies.set('user', JSON.stringify(response.data));
					}
					localStorage.setItem('user', JSON.stringify(response.data));
					if(this.getShortCode !== undefined) {
                        localStorage.setItem(`${this.getShortCode}`, true);
                    }

                    window.location.href = "/rapportkollen";

                } catch (error) {
                    this.loginFailed(error);
                }
            }
        },
    };
</script>


<style scoped>
    .p-3 button.ta-blue {
        display: block;
        margin: 40px auto 30px auto;
        padding:0 40px;
        color: #ffffff;
        background-color: #325D85;
    }

    button.ta-white {
        flex:1;
        padding:4px 0;
        border:1px solid #325D85;
        border-radius: 4px;
        color: #325D85;
        background-color: #ffffff;
    }

    .container {
        display:flex;
        justify-content: space-around;
        justify-items: center;
        align-items: center;
    }
    .child {
        background: #FF605C;
        flex: 1;
    }

    .box {
        padding: 10px;
        margin: 0px;
        width: 100%;
    }
    .header {
        width:100%;
        grid-area: head;
    }
    .menu {
        grid-area: menu;
    }
    .main {
        grid-area: main;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 200px;
    }

    .main span {
        background-color: #6ab086;
    }
    .footer {
        grid-area: foot;
        background-color: #76869c;
    }
</style>

<style>

    .body {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .body span {
        flex: 1 0 0;
    }

    .footer {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #272a33;
    }

    .footer span {
        vertical-align: text-top;
        flex: 1 0 0;
    }
    .footer h4 {
        color: #ffffff;
    }

    .footer li {
        list-style-type: none;
    }

    .footer li a {
        color: #98a0aa;
        padding-top: 8px;
        display: inline-block;
        font-size: 14px;
        transition: all 0.3s ease-in-out;
    }

    .footer li a:hover {
        color: #dce6f3;
    }

    .footer p {
        color: #eeeeee;
    }
</style>

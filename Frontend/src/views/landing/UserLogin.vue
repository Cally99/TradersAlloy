<template lang="pug">
    div(style="display:flex; min-width:500px;")
        div(class="card account-card" style="flex:1;")
            div(class="card-body")
                div(class="text-center mt-3")
                    h3(class="font-weight-bold")
                        a(class="text-dark text-uppercase account-pages-logo" href="/") LOGGA IN PÅ DITT KONTO

                div(class="p-3")
                    form
                        div(class="form-group")
                            label( for="email" style="color:black") Ange din e-post
                            input( name="email" class="form-control" placeholder="e-post" required type="text" v-model="email")

                        div(class="form-group")
                            label( for="userpassword" style="color:black") Ange ditt lösenord
                            input( name="userpassword" class="form-control" placeholder="lösenord" required type="password" v-model="password")

                        div(class="custom-control custom-checkbox")
                            input( name="customControlInline" class=" custom-control-input" type="checkbox")
                            label( for="customControlInline" class="custom-control-label" style="color:black") Kom ihåg mig

                        div(class="mt-3")
                            button(class="btn white--text btn-block" @click.prevent="login" style="background-color:#316bd2; ") LOGGA IN

                        div(class="mt-4 mb-0 text-center")
                            a(class="text-dark" href="/forgot-password")
                                i(class="mdi mdi-lock")
                                span Har du glömt ditt lösenord?
                        br

        v-snackbar(
            v-model="signup_info.show"
            top
            :timeout="signup_info.timeout"
            :color="signup_info.color"
        )
            v-spacer
            span {{ signup_info.message }}
            v-spacer

        v-snackbar(
            :color="login_info.color"
            :timeout="login_info.timeout"
            top
            v-model="login_info.show"
        )
            v-spacer
            span {{ login_info.message }}
            v-spacer
</template>

<script>
    "use strict";
    import apiService from "@/Services/ApiService";

    export default {
        name: "Login",
        data() {
            return {
                getParam: null,
                email: "",
                password: "",
                login_info: {
                    show: false,
                    message: "",
                    timeout: 1000,
                    color: "rgba(255, 100, 100, 0.8)",
                },
                signup_info: {
                    show: false,
                    message: "",
                    timeout: 1000,
                    color: "rgba(255, 100, 100, 0.8)",
                },
            };
        },
        mounted() {
            const urlParams = new URLSearchParams(window.location.search);

            if(urlParams.get('stockOverview') !== null) {
                this.getParam = urlParams.get('stockOverview');
            }
        },
        methods: {
            login() {
                if (this.email == "" || this.password == "") {
                    this.login_info.message = "e-post och lösenord krävs";
                    this.login_info.show = true;
                } else {
                    apiService
                        .userLogin({
                            email: this.email,
                            password: this.password,
                        })
                        .then((response) => {
                            this.$store.commit("setMessage", {
                                text: "logged in",
                                type: "success",
                            });
                            localStorage.setItem('user', JSON.stringify(response.data))
                            // localStorage.user = JSON.stringify(response.data);

                            if(this.getParam === null) {
                                window.location.href = "/rapportkollen";
                            } else {
                                window.location.href = this.getParam;
                            }
                        })
                        .catch((error) => this.loginFailed(error));
                }
            },
            loginFailed(error) {
                this.login_info.message = error.message || ": inloggningen misslyckades";
                this.login_info.show = true;
                delete localStorage.token;
            },
            addUser() {
                if (this.name == "" || this.email == "" || this.password == "") {
                    this.signup_info.message = "e-post och lösenord krävs";
                    this.signup_info.show = true;
                } else if (this.password.length < 8) {
                    this.signup_info.message = "Minst 8 tecken";
                    this.signup_info.show = true;
                } else {
                    apiService
                        .addUser({
                            email: this.email,
                            password: this.password,
                        })
                        .then((response) => {
                            this.$store.commit("setMessage", {
                                text: "logged in",
                                type: "success",
                            });
                            localStorage.user = JSON.stringify(response.data);
                            window.location.href = "/rapportkollen";
                        })
                        .catch((response) => this.loginFailed(response));
                }
            },
        },
    };
</script>

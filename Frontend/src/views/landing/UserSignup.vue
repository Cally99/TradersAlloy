<template lang="pug">
    div(style="min-width:500px;")
        v-dialog(v-model="dialog" width="500")
            template( v-slot:activator="{ on }")
                v-btn(class="amber pa-8 elevation-12"
                    x-large
                    style="color:#ffffff; font-weight: 600; border-radius:8px; width:300px; font-size: 1.7rem;"
                    v-on="on"
                ) Skapa Konto

            div( class="card account-card")
                div( class="card-body")
                    div( class="text-center mt-3")
                        h3( class="font-weight-bold")
                            a( href="/" class="text-dark text-uppercase account-pages-logo") SKAPA NYTT KONTO

                    div( class="p-3")
                        form
                            div(class="form-group")
                                label( for="email"  style="color:black") Ange din e-post
                                input( v-model='email' type="email" class="form-control" id="email" placeholder="e-post" required)

                            div( class="form-group")
                                label( for="userpassword"  style="color:black") Skapa ett lösenord
                                <!-- <input v-model='password' type="password" class="form-control" id="userpassword" placeholder="Enter password" required :rules="[rules.required, rules.min]" hint="At least 8 characters"> -->
                                v-text-field( v-model="password"
                                    :rules="[rules.required, rules.min]"
                                    name="password"
                                    hint="Minst 8 tecken"
                                    counter
                                    outlined dense
                                    :type="showPass ? 'text' : 'password'"
                                    class="toggle"
                                    height=45
                                    :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                                    @click:append="showPass = !showPass"
                                    :dark="false")

                            div( class="custom-control custom-checkbox")
                                input( type="checkbox" class="custom-control-input" id="customControlInline")
                                label( class="custom-control-label" for="customControlInline"  style="color:black") Kom ihåg mig

                            div( class="mt-3")
                                button( @click.prevent='addUser' style="background-color: #316bd2;" class="btn white--text btn-block") SKAPA NYTT KONTO
                            br


        v-snackbar( v-model="signup_info.show" top :timeout='signup_info.timeout' :color='signup_info.color')
            v-spacer
                span {{ signup_info.message }}
            v-spacer

</template>

<script>
    "use strict";
    import apiService from '@/Services/ApiService'

    export default {
        name: 'Signup',
        data () {
            return {
                email: '',
                password: '',
                signup_info: {
                    show: false,
                    message: '',
                    timeout: 1000,
                    color:'rgba(255, 100, 100, 0.8)'
                },
                rules: {
                    required: value => !!value || 'Krävs.',
                    min: v => v.length >= 8 || 'Min 8 characters',
                    emailMatch: () => ('The email and password you entered don\'t match'),
                },
                showPass: false,
                dialog: false,
            }
        },
        mounted: function () {
            this.$vuetify.theme.dark = false
        },
        methods: {
            addUser () {
                if (this.name=='' || this.email=='' || this.password =='') {
                    this.signup_info.message = 'e-post och lösenord krävs'
                    this.signup_info.show = true
                } else if (this.password.length < 8) {
                    this.signup_info.message = 'Minst 8 tecken'
                    this.signup_info.show = true
                } else {
                    apiService.addUser({
                        email: this.email,
                        password: this.password
                    })
                        .then(response => {
                            // this.$store.commit('setMessage', {text:'logged in', type: 'success'} );
                            this.successMessage();
                            localStorage.user = JSON.stringify(response.data)
                            this.changePageToRapportkollen();
                            // window.location.href = '/rapportkollen'

                        })
                        .catch(response => this.loginFailed(response))
                }
            },
            loginFailed (response) {
                console.log('failed', response)
                this.signup_info.message = response.response.data.message || 'misslyckades'
                this.signup_info.show = true
                delete localStorage.token
            },
            changePageToRapportkollen() {
                window.location.href = '/rapportkollen';
            },
            successMessage() {
                this.$store.commit('setMessage', {text:'logged in', type: 'success'} );
            }
        }
    }
</script>

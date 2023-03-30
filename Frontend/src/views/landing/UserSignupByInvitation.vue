<template lang="pug">
    div
        div(class="card account-card")
            div( class="card-body")
                div( class="text-center mt-3")
                    h3( class="font-weight-bold")
                        a( href="/" class="text-dark text-uppercase account-pages-logo") by Invitation
                    p( class="text-muted") ...documents are waiting for you
                div( class="p-3")
                    form
                        div( class="form-group")
                            label( for="email") Email
                            input( v-model='email' type="email" class="form-control" id="email" placeholder="your Email is your user identity" required)

                        div
                            label(for="password") {{this.passwordText}}
                            v-text-field( v-model='this.password' type="text" outlined dense id="password" append-icon="mdi-eye" v-on:change="this.passwordText='Password'")

                        div( class="mt-3")
                            button( @click.prevent='addUser'
                                v-bind:disabled="this.password.length<8"
                                style="background-color: #316bd2;"
                                class="btn white--text btn-block") Sign up
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
        name: 'SignupByInvitation',
        props: {
            email: String,
        },
        computed: {
            password: {
                get() {
                    let CharacterSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!*$';
                    let p = '';
                    for(let i=0; i < 8; i++) {
                        p += CharacterSet.charAt(Math.floor(Math.random() * CharacterSet.length));
                    }
                    return p;
                }
            }
        },
        methods: {
            addUser () {
                if (this.email!='' || this.password !='') {
                    apiService.addUser({
                        email: this.email,
                        password: this.password
                    }).then(response => {
                        this.$store.commit('setMessage', {text: 'logged in', type: 'success'});
                        localStorage.user = JSON.stringify(response.data)
                        window.location.href = '/rapportkollen'
                    }).catch(response => {
                        console.log('failed', response)
                        this.signup_info.message = response.response.data.message || 'Error Signup'
                        this.signup_info.show = true
                        delete localStorage.token
                    })
                } else {
                    this.signup_info.message = 'Required email or password'
                    this.signup_info.show = true }
            },
            generatePassword: function() {
                let CharacterSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789![]{}()%&*$#^<>~@|';
                let p = '';
                for(let i=0; i < 8; i++) {
                    p += CharacterSet.charAt(Math.floor(Math.random() * CharacterSet.length));
                }
                this.password = p;
            },
        },
        data() {
            return {
                passwordText: 'Password suggestion',
                signup_info: {
                    show: false,
                    message: '',
                    timeout: 1000,
                    color:'rgba(255, 100, 100, 0.8)'
                }
            }
        }
    }
</script>

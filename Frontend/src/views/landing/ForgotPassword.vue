<template>
    <div>

        <div class="card account-card">
            <div class="card-body">
                <div class="text-center mt-3">
                    <h3 class="font-weight-bold"><a class="text-dark text-uppercase account-pages-logo"
                                                    href="/">{{this.$t('Reset_Password')}}</a></h3>
                    <p class="text-muted">Enter your user account's verified email address and we will send you a verification code.</p>
                </div>
                <div class="p-3">
                    <form>
                        <div class="form-group">
                            <!-- <input class="form-control" id="email" :placeholder="$t('Enter_email')" required
                                   type="text" v-model='email'> -->
                            <v-text-field
                                v-model="email"
                                placeholder="Email"
                                :disabled="is_submitted"
                                label="Email"
                                required
                                outlined
                                ></v-text-field>
                            <v-text-field
                                v-if="is_submitted"
                                v-model="confirm_code_entered"
                                placeholder="Confirm code"
                                :disabled="is_confirmed"
                                label="Confirm code"
                                required
                                outlined
                                ></v-text-field>
                            <v-text-field
                                v-if="is_confirmed"
                                v-model="password"
                                placeholder="Password"
                                :rules="[rules.required, rules.min]"
                                :type="showPass ? 'text' : 'password'"
                                label="Password"
                                hint="At least 8 characters"
                                counter
                                outlined
                              >
                            </v-text-field>
                        </div>

                        <div class="mt-3">
                            <button v-if="!is_submitted" @click.prevent='Submit' class="btn white--text btn-block" style="background-color: #316bd2;">Submit
                            </button>
                            <button v-if="is_submitted && is_confirmed == false" @click.prevent='confirm' class="btn white--text btn-block" style="background-color: #316bd2;">Confirm Code
                            </button>
                            <button v-if="is_confirmed" @click.prevent='newPassword' class="btn white--text btn-block" style="background-color: #316bd2;">Submit
                            </button>
                        </div>
                        <br/>
                    </form>
                </div>
            </div>
        </div>

        <v-snackbar :color='submit_info.color' :timeout='submit_info.timeout' top v-model="submit_info.show">
            <v-spacer></v-spacer>
            {{ submit_info.message }}
            <v-spacer></v-spacer>
        </v-snackbar>
    </div>
</template>

<script>
    "use strict";
    import apiService from '@/Services/ApiService'

    export default {
        name: 'ForgotPassword',
        data() {
            return {
                showPass: true,
                email: '',
                submit_info: {
                    show: false,
                    message: '',
                    timeout: 1000,
                    color: 'rgba(255, 100, 100, 0.8)'
                },
                is_submitted: false,
                is_confirmed: false,
                confirm_code : '',
                confirm_code_entered: '',
                rules: {
                    required: value => !!value || 'Required.',
                    min: v => v.length >= 8 || 'Min 8 characters',
                    emailMatch: () => ('The email and password you entered don\'t match'),
                },
                password: '',
            }
        },
        methods: {
            async Submit() {
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

                    if(response.flag !== undefined) {
                        throw new Error(response.data);
                    }

                    this.confirm_code = response;
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
            newPassword() {
                if (this.password.length < 8) {
                    this.submit_info.message = 'Password should be 8 letters at least'
                    this.submit_info.show = true
                } else {
                    apiService.newPassword({
                        email: this.email,
                        password: this.password
                    })
                        .then(response => {
                            this.$store.commit('setMessage', {text:'logged in', type: 'success'} );
                            localStorage.user = JSON.stringify(response.data)
                            window.location.href = '/rapportkollen'
                        })
                        .catch(response => this.submitFailed(response))
                }
            },
            submitFailed(error) {
                this.submit_info.message = error.message || 'Error Submit';
                this.submit_info.show = true;
                delete localStorage.token;
            }
        }
    }
</script>

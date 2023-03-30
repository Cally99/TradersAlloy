<template lang="pug">
    v-dialog(v-model="showDialogSignup" scrollable width="500px")
        h2 Reset Password
        p Enter your email address and we'll send you an email with instructions to reset your password.
        form(action="")
            div( class="form-group")
                span Email
                v-input( type="email" class="form-control" id="email" placeholder="Enter Email" required)
            v-btn(type="submit" class="btn btn-custom btn-block") Reset your Password
</template>

<script>
export default {
  name: "UserForgotPassword",
  data() {
    return {
      showDialogSignup: false
    };
  },
  methods: {
    forgot() {}
  }
};
</script>

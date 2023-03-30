<template lang="pug">
    div
        v-container(class="container-style")
            v-row(v-for="account in numberOfAccounts" :key="account" style="border: 0px solid black;")
                v-col(md="2" style="border: 0px solid black;") {{$t('account')}}
                v-col(md="3" style="font-size: 24px;border: 0px solid black;")
                    b {{ account }}
                v-col(md="4" style="border: 0px solid black;") short descriptive name
                v-col(md="3" style="color: gray;border: 0px solid black;") (optional)
</template>

<script>
export default {
    name: "DetectAccountsUsedAtAvanza",
    props: ['numberOfAccounts'],
}
</script>

<style scoped>

    .container-style {
        font-size: 20px;
        height: 550px;
        width: 800px;
    }
</style>

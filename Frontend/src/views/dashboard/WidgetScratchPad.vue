<template lang="pug">
    div
        ////// HEADER
        div(class="card__title")

            span(style="" class="white--text px-3") Scratch Pad
            v-icon(style="float:right; cursor:pointer;" class="white--text" @click="closeWidget(1)") close

        ////// BODY
        v-textarea(
            name="scratchpad"
            value=""
            outlined
            rows="12"
            hint="Write anything you want here")
</template>

<script>
    export default {
        name: "WidgetScratchPad"
    }
</script>

<style scoped>
</style>

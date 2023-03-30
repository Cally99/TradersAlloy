<template lang="pug">
    div(style="height:70px;" :style="{background: competition.banner_background  }" )
        span( class="px-5 headline-text" :style="{color: competition.banner_color}") {{title}}
        span( style="float:right;")
            template(v-if="competition")
                img(:src="competition.banner_image" height="70px")
            template(v-else)
                UserAccountDropdownMenu(:competition="competition")


</template>

<script>
import UserAccountDropdownMenu from "../../components/UserAccountDropdownMenu";

export default {
    name: "PortfolioHeader",
    components: {
        UserAccountDropdownMenu,
    },
    props: {
        title: String,
        competition: Object
    },

}
</script>

<style scoped>
.headline-text {
    font-size: 36px;
    font-weight: bold;
}
</style>

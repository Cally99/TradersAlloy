<template lang="pug">
    v-container
        v-row
            v-col(align-self="center")
                h2(class="blue3--text") {{ $t('news') }}
            v-col(align="end" align-self="center")
                button(@click="viewMode = 'all', deselectBlocks()" class="button-group-left-design link-hover" :class="viewMode === 'all' ? 'button-active' : ''")
                    v-icon(class="blue2--text" :class="viewMode === 'all' ? 'button-active' : ''") mdi-format-list-bulleted
                    span {{ $t('news_all') }}

                button(@click="viewMode = 'watched', deselectBlocks()" class="button-group-right-design link-hover" :class="viewMode === 'watched' ? 'button-active' : ''")
                    v-icon(class="blue2--text" :class="viewMode === 'watched' ? 'button-active' : ''") mdi-eye-outline
                    span {{ $t('news_watched') }}
        v-row(no-gutters)
            v-col
                div(style="overflow-y:scroll;" :style="`height:${windowHeight - 140}px;`")
                    NewsInformation(:viewMode="viewMode" ref="newsInformationElement")
            //- Uncomment for fist the start implementation of the wordCloud 
            //- v-col
            //-     WordCloud(:words="words")
</template>

<script>
import { mapGetters } from "vuex";
import ApiService from './../../Services/ApiService';
// import WordCloud from "./WordCloud"
import NewsCard from "./NewsCard";
import NewsInformation from './NewsInformation.vue';

export default {
    name: "News",
    components: {
        // WordCloud,
        NewsCard,
        NewsInformation
        },
    data() {
        return {
            viewMode: 'all',
            windowHeight: 0,
        }
    },
    mounted() {
        this.setWindowHeight();
        window.addEventListener('resize', this.setWindowHeight);
    },
    async created() {
        const newsWatched = (await ApiService.getNewsWatched(JSON.parse(localStorage.getItem('user')).user_id)).data;
        this.$store.commit('setNewsWatched', newsWatched);

        const news = (await ApiService.getNews50()).data;
        this.$store.commit("setNews", news);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.setWindowHeight);
    },
    computed: {
        ...mapGetters(["getNews", "getNewsWatched"]),
        newsItems() {
            let news;
            if (this.viewMode==='all') {
                news = this.getNews;
            } else if  (this.viewMode==='watched') {
                news = this.getNewsWatched
            }
            return news;
        },
        windowHeight() {
            return window.innerHeight;
        },
    },
    methods: {
        deselectBlocks() {
            this.$refs.newsInformationElement.expanderId = null;
        },
        setWindowHeight() {
            this.windowHeight = window.innerHeight;
        },
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat');
.scrollView {
    position: relative;
    font-family: Montserrat;
    height: 80vh;
    overflow-y: scroll;
}
.link {
    color: #4d71b8;
    margin: 0 8px;
}
.link:hover{
    cursor: pointer;
    text-decoration: underline;
}
.newsItem {
    min-height: 150px;
}
.textContent {
    width: 60%
}
.tagsMargin {
    margin-top: 1rem;
    font-size: 14px;
}
.textContainer {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
div.newsItem {
    margin-bottom: 10px;
    padding:2px;
    border-radius: 3px;
    background: #eeeeee;
    display: grid;
    grid-template-columns: 1fr 5fr;
    grid-template-rows: 1fr;
    gap: 1em;
}
.button-group-left-design {
    min-width: 125px;
    background-color: #ffffff;
    border: 2px solid #4077AB;
    color: #4077AB;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    padding: 3px;
}
.button-group-right-design {
    min-width: 125px;
    background-color: #ffffff;
    border: 2px solid #4077AB;
    color: #4077AB;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    padding: 3px;
}
.button-active {
    background-color: #4077AB;
    color: #ffffff !important;
}
</style>

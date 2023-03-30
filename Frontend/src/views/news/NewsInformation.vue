<template lang="pug">
    div(ref="newsContainer")
        template(v-for="(news, id) in newsItems")
            div(v-if="news.type !== 2" class="grid-container ml-3" @click="expanderToggle(id)" :class="(expanderId !== id) ? 'minimize-block' : ''" :style="(expanderId === id) ? `height:${getElementsHeight(id)+5}px; transition:height .5s;` : ''" style="position:relative;")
                div(:id="`element${id}`")
                    div
                        template(v-for="n in news.tickers")
                            div(class="ticker blue1" style="margin:3px; 0 3px 8px;") {{ n.ticker }}
                            br
                        div(class="pl-1")
                            div(v-if="dateAndTimeFormatting(news).date !== null") {{ dateAndTimeFormatting(news).date }}
                            div(v-if="dateAndTimeFormatting(news).time !== null") {{ dateAndTimeFormatting(news).time }}
                div(class="main-news-container p-2")
                    div
                        div(class="title-design mb-1") {{ news.title }}
                        div(class="news-text-design mb-2" v-html="news.newstext")
                        div(class="news-tabs-design mb-2 mt-4")
                            span(v-for="(tag, index) in news.tags")
                                span(class="tag-container red2 pl-2 pr-2 mr-6") {{ getTagName(tag) }}

                div(style="position:absolute; top:0; right:5px;")
                    v-icon(v-if="expanderId !== id") mdi-chevron-down
                    v-icon(v-else) mdi-chevron-up

            div(v-else class="grid-container-yellow ml-3" @click="expanderToggle(id)" :class="(expanderId !== id) ? 'minimize-block' : ''" :style="(expanderId === id) ? `height:${getElementsHeight(id)+5}px; transition:height .5s;` : ''" style="position:relative;")
                div(:id="`element${id}`")
                    div
                        template(v-for="n in news.tickers")
                            div(class="ticker blue1" style="margin:3px; 0 3px 8px;") {{ n.ticker }}
                            br
                        div(class="pl-1")
                            div(v-if="dateAndTimeFormatting(news).date !== undefined") {{ dateAndTimeFormatting(news).date }}
                            div(v-if="dateAndTimeFormatting(news).time !== undefined") {{ dateAndTimeFormatting(news).time }}
                div(class="main-news-container p-2")
                    div
                        div(class="title-design mb-1") {{ news.title }}
                        div(class="news-text-design mb-2" v-html="news.newstext")
                        div(class="news-tabs-design mb-2 mt-4")
                            span(v-for="(tag, index) in news.tags")
                                span(class="tag-container red2 pl-2 pr-2 mr-6") {{ getTagName(tag) }}

                div(style="position:absolute; top:0; right:5px;")
                    v-icon(v-if="expanderId !== id") mdi-chevron-down
                    v-icon(v-else) mdi-chevron-up
</template>

<script>
import {mapGetters, mapActions} from "vuex";
import moment from "moment";

export default {
    name: 'NewsInformation',
    props: {
        viewMode: {
            type: String,
            default: null
        },
        company_id: {
            type: Number,
            default: null
        },
        stock_id: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            expanderId: null
        };
    },
    async mounted() {
        if(this.company_id !== null) {
            await this.loadCompanyNews(this.company_id);
        }

        this.generateTableFormating();
    },
    watch: {
        newsItems() {
            this.generateTableFormating();
        }
    },
    computed: {
        ...mapGetters(["getCompanyNews", "getNews", "getNewsWatched"]),
        newsItems() {
            let news;

            if (this.viewMode==='all') {
                news = this.getNews;
            } else if  (this.viewMode==='watched') {
                news = this.getNewsWatched
            } else if (this.company_id !== null && this.stock_id !== null) {
                news = this.getCompanyNews;
            }

            return news;
        },
        getNewsContainer() {
            return this.$refs.newsContainer;
        }
    },
    methods: {
        ...mapActions(["loadCompanyNews"]),
        getElementsHeight(id) {
            return document.getElementById(`element${id}`).offsetHeight;
        },
        expanderToggle(id) {
            if(this.expanderId !== id) {
                this.expanderId = id;
            } else if(this.expanderId === id) {
                this.expanderId = null;
            }
        },
        getTagName(tag) {
            let tagName = '';
            const checkIfStartWithFWN = tag.substring(0, 4);
            const checkIfStartWithTA = tag.substring(0, 3);

            tagName = `tag_${tag}`;

            if(checkIfStartWithFWN === 'FWN:') {
                tagName = `tag_fwn_${tag.substring(4, tag.length)}`;
            } else if(checkIfStartWithTA === 'TA:') {
                tagName = `tag_ta_${tag.substring(3, tag.length)}`;
            }

            return this.$t(`${tagName}`);
        },
        generateTableFormating() {
            const myInterval = setInterval(() => {
                const tds = this.getNewsContainer.querySelectorAll('td');

                if(tds !== null) {
                    for(const td of tds) {
                        const checkNaN = parseInt(td.innerText.replace('-', '').replace('−', '').replace('%', ''));

                        if(!Number.isNaN(checkNaN)) {
                            td.classList.add('align-right');
                        }

                        if(td.innerText.substring(0, 1) === '-' || td.innerText.substring(0, 1) === '−') {
                            td.classList.add('red-text');
                        }
                    }

                    clearInterval(myInterval);
                }
            }, 50);
        },
        dateAndTimeFormatting(news) {
            const dateToday = moment().format('YYYY-MM-DD');
            const dateInserted = moment(news.date).format('YYYY-MM-DD');
            const daysDiff = moment(dateToday).diff(moment(dateInserted), 'days');
            const timeInserted = moment(`${dateInserted} ${news.time}`).format('hh:mm');

            const formattedDateObject = {};

            if(daysDiff === 0) {
                formattedDateObject.date = null;
                formattedDateObject.time = (timeInserted !== 'Invalid date') ? timeInserted : null;
            } else if(daysDiff === 1) {
                formattedDateObject.date = this.$t('yesterday_first_capital');
                formattedDateObject.time = null;
            } else if(daysDiff >= 2) {
                formattedDateObject.date = dateInserted;
                formattedDateObject.time = null;
            }

            return formattedDateObject;
        }
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat');

.grid-container {
    display: grid;
    grid-template-columns: 150px auto;
    font-family: Montserrat;
    margin-right: 80px;
    margin-bottom: 20px;
    border-radius: 5px;
    overflow: hidden;
}

.grid-container > div {
    display: flex;
    background-color: #F4F4F4;
}

.grid-container-yellow {
    display: grid;
    grid-template-columns: 150px auto;
    font-family: Montserrat;
    margin-right: 80px;
    margin-bottom: 20px;
    border: 2px solid #f0ecc2;
    border-radius: 5px;
    overflow: hidden;
}

.grid-container-yellow > div {
    display: flex;
    background-color: #FFFDE9;
}

.minimize-block {
    height: 100px;
    transition: height .5s;
}

.side-news-price {
    font-size: 11px;
}

.side-news-percent {
    font-size: 20px;
    font-weight: bold;
    color: #4F8519;
}

.side-news-since {
    font-size: 11px;
}

.main-news-container {
    align-items: start !important;
    justify-content: left !important;
}

.main-news-container > div {
    text-align: left;
}

.title-design {
    font-size: 12px;
    font-weight: bold;
}

.news-text-design {
    font-size: 11px;
}

.links-design {
    font-size: 14px;
}

.news-tabs-design {
    font-size: 14px;
}

.tag-container {
    display: inline-block;
    border-radius: 5px;
    border: 1px solid #FFABAB !important;
}

>>> .red-text {
    color: red !important;
}

>>> .align-right {
    text-align: right !important;
}

>>> tbody {
    font-family: monospace;
    background-color: #ffffff;
    border: 1px solid #999999 !important;
}

>>> tbody td {
    min-width: 120px;
    max-width:400px;
    padding: 8px;
    border: 1px solid #999999 !important;
}

>>> tbody tr:first-child {
    font-weight: bold;
}

>>> tbody tr:first-child td:first-child {
    font-size: 16px;
}

>>> tbody tr td:first-child {
    padding-right: 10px;
}
</style>

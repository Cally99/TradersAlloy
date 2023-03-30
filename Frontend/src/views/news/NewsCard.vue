<template lang="pug">
    div(class="newsItem p-3" )
        div
            div {{displayDate(newsItem.date)}}
            div {{displayTime(newsItem.time, displayDate(newsItem.date))}}
            v-chip-group(v-for="c in newsItem.tickers")
                TickerComponent(:tickerLabel="c.ticker" :stockId="c.stock_id" :isClickable="true")
            span {{newsItem.links}}
            div {{this.agencies.find(x => x.agency === newsItem.agency).name }}
            div {{newsItem.language}}
            span {{newsItem.version}}
            span {{newsItem.countries}}
            span {{newsItem.signature}}
        div(class="textContainer")
            h4 {{newsItem.title}}
            div(class="textContent" v-html="newsItem.newstext")
            div(class="tagsMargin")
                span(v-for="(tab, index) in newsItem.tags")
                    span(v-if="index === 0") {{ tab }}
                    span(v-else) , {{ tab }}
</template>

<script>
    import TickerComponent from "../../components/TickerComponent.vue"

    export default {
        name: "news",
        props: ['newsItem'],
        components: {
            TickerComponent
        },
        data() { return {
            agencies: [
                {agency: "8212", name: "FinWire News"},
                {agency: "8213", name: "FinWire News"},
                {agency: "8195", name: "Cision"},
                {agency: "8196", name: "Globe Newswire"},
                {agency: "8197", name: "Globe Newswire"},
                {agency: "8199", name: "Merkur Market / Oslo Børs / Oslo Axess"},
                {agency: "8201", name: "beQuoted"},
                {agency: "8224", name: "EQS Newswire"},
                {agency: "8225", name: "Modular Finance News"},
                {agency: "8226", name: "Nordic IR"},
            ]
            }
        },
        methods: {
            displayTime(time, dateString) {
                if (time && dateString === 'Today') {
                    return `${time.split(':')[0]}:${time.split(':')[1]}`
                } else {
                    return ""
                }
            },
            displayDate(date) {
                const todayDate = new Date()
                const newsDate = new Date(date)
                const newsDateComparator = newsDate.toLocaleString('SWE').split(' ')[0]
                // if the news is released today
                if (todayDate.toLocaleString('SWE').split(' ')[0] === newsDateComparator) {
                    return "Today"
                }
                // if the news is one day old
                todayDate.setDate(todayDate.getDate() - 1)
                if (todayDate.toLocaleString('SWE').split(' ')[0] === newsDateComparator) {
                    return "Yesterday"
                }
                // if the news is two days old
                todayDate.setDate(todayDate.getDate() - 2)
                if (todayDate.toLocaleString('SWE').split(' ')[0] === newsDateComparator) {
                    const weekDay = new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(newsDate)
                    return weekDay
                }
                // else
                else {
                    return date
                }
            }
        }
    }
</script>

<style scoped>
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
        padding: 2px;
        border-radius: 3px;
        background: #eeeeee;
        display: grid;
        grid-template-columns: 1fr 5fr;
        grid-template-rows: 1fr;
        gap: 1em;
    }
</style>

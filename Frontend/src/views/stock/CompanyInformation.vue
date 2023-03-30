<template lang="pug">
    div
        table(style="width:100%")
            tr
                td(class="headline-text") {{$t('Market Cap')}}
                td
                    span(class="euroMillions") {{format(company.market_cap)}}
            tr
                td(class="headline-text") {{$t('pe')}}
                td(class="format-text") {{company.last_pe}}
            tr
                td(class="headline-text") {{$t('last_earnings')}}
                td(class="format-text")
                    div {{formatMillions( company.last_sales) }} ({{company.last_report_date}})
            tr
                td(class="headline-text") {{$t('next_earnings')}}
                td(class="format-text")
                    span(:style="`color:${earningsDateColor(company.next_report_date)};`") {{company.next_report_date}}
            tr
                td(class="headline-text") {{$t('eps')}}
                td(class="format-text")
                    div {{company.last_eps_ttm}}
            tr
                td(class="headline-text") {{$t('profit')}}
                td(class="format-text")
                    span {{formatMillions( company.last_np )}}
                        span(style="font-size:1rem;margin: 0 8px;") {{stock.currency_trade}}
            tr
                td(class="headline-text") {{$t('price_last_close')}}
                td(class="format-text")
                    span(class="mr-2") {{stock.price_today}}
                    span {{stock.currency_trade}}
            tr
                td(class="headline-text") {{$t('Exchange')}}
                td(class="format-text") {{stock.exchange}}, {{stock.country}}
            tr
                td(class="headline-text") {{$t('Sector')}}
                td(class="format-text") {{$t(stock.sector_name)}}
</template>

<script>
    export default {
        name: "CompanyInformation",
        props: {
            company_id: Number,
            stock_id: Number
        },
        data() {
            return {}
        },
        computed: {
            stock() {
                return this.$store.getters["getMapStocks"].find(s => s.stock_id == this.stock_id);
            },
            company() {
                return this.$store.getters["getMapCompanies"].get(this.company_id);
            },
        },
        methods: {
            formatMillionsNoM(x) {
                return new Intl.NumberFormat('sv-SE').format((x/1000000).toFixed(0) );
            },
            formatMillions(x) {
                return (new Intl.NumberFormat('sv-SE').format((x/1000000).toFixed(0) )) + " M";
            },
            format(x) {
                return new Intl.NumberFormat('sv-SE').format(x);
            },
            earningsDateWarning(date) {
                const d = Date.now(); // new Date().toISOString().slice(0, 10);
                if (Date.parse(date) < d) return "silver";
                else if (d + 1000 * 60 * 60 * 24 > Date.parse(date)) return "red";
                else if (d + 1000 * 60 * 60 * 24 * 7 > Date.parse(date)) return "orange";
                else return "black";
            },
            earningsDateColor(date) {
                let days = Math.round((Date.parse(date) - Date.now()) / (1000 * 60 * 60 * 24), 0);
                let color = (days < 0 ? 'grey' : days < 2 ? 'red' : days < 3 ? 'orange' : 'black');
                return color
            },

        }
    }
</script>

<style scoped>
    span.bigText {
        font-size: 1.3em;
    }

    .euroMillions {
        font-weight: 400;
        font-size: 1.1em;
        margin: 0 5px;
        color: #1c1c1c;
    }
    .euroMillions::before {
        content: "€";
        margin-right: 5px;
        font-weight: 400;
        font-size: 0.95em;
    }
    .euroMillions::after {
        content: "M";
        margin: 0 5px;
        font-weight: 400;
        font-size: 0.95em;
    }

    a.tool-tip[data-tool-tip]::after {
        content: attr(data-tool-tip);
        display: block;
        position: absolute;
        background-color: #dad88c;
        padding: 1em 3em;
        color: #4c5667;
        border-radius: 5px;
        font-size: 1em;

        left: 0;
        white-space: nowrap;
        transform: scale(0);
        transition: transform ease-out 150ms;
    }
    a.tool-tip[data-tool-tip]:hover::after {
        transform: scale(1);
    }

    table>tr>td.text-left{
    }

    table>tr>td{
        padding:4px 0;
    }

    table{
        font-size: 1.2em;
    }

    .headline-text {
        font-size: 1.1em;
        font-weight: 600;
        padding-left: 5px;
    }

    .format-text {
        padding-left: 7px;
    }
</style>

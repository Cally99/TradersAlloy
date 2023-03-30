<template lang="pug">
    div(class="main-container")
        template(v-if="resultsCheck !== null")
            template(v-if="resultsCheck.length > 0")
                div(class="text-area-scroll")
                    div(v-for="result in results" class="sub-container")
                        div(v-if="result.header" class="mb-4")
                            div
                                span(@click="loadPdfFile(result.pdf_uuid)" class="title-block cursor-hover") {{ result.name }}

                            div(class="block-min-height")
                                div(class="block-position")
                                    v-icon(@click="loadPdfFile(result.pdf_uuid)" class="cursor-hover mt-1") $pdfFile
                                    div(@click="loadPdfFile(result.pdf_uuid)" class="period-block cursor-hover") {{ result.period }}

                                div(class="information-text-margin")
                                    span(class="grey-page-text") Page {{ result.page }} 
                                    img(:src="`/images/logos/senofidk/${result.company_id}.png`" class="image-block")
                                    span(v-html="displayText(result.text)")

                        div(v-else class="mb-4")
                            div(class="block-min-height")
                                div(class="block-position")
                                    div(@click="loadPdfFile(result.pdf_uuid)" class="period-block-no-margin cursor-hover") {{ result.period }}

                                div(class="information-text-margin")
                                    span(class="grey-page-text") Page {{ result.page }} 
                                    span(v-html="displayText(result.text)")

                div(v-if="showPdf" class="pdf-container")
                    v-card
                        div
                            object(v-if="pdfUuid !== ''" :data="`https://documents.millistream.com/${pdfUuid}#view=fitH`" class="object-pdf-block")
                            object(v-else :data="`https://documents.millistream.com/${results[0].pdf_uuid}#view=fitH`" class="object-pdf-block")
            template(v-else)
                div No records to show from the search criteria...
        template(v-else)
            div Searching...
</template>

<script>
    import PremiumButton from "@/components/PremiumButton.vue";
    import Ticker from "@/components/Ticker.vue";
    import WatchlistAddTo from "@/components/WatchlistAddTo.vue";
    import ApiService from "@/Services/ApiService";

    export default {
        name: "TextSearch",
        components: {
            Ticker, WatchlistAddTo, PremiumButton
        },
        data() {
            return {
                results: [],
                resultsCheck: null,
                searchString: null,
                showPdf: false,
                pdfUuid: ''
            }
        },
        methods: {
            loadPdfFile(uuid) {
                this.pdfUuid = uuid;
            },
            displayText(result) {
                const querystr = this.searchString;
                const reg = new RegExp(querystr, 'gi');

                const final_str = result.replace(reg, (str) => {
                    return `<span style="background: #feffa6">${str}</span>`;
                });

                return final_str;
            },
            async search(searchText) {
                this.searchString = searchText;
                this.pdfUuid = '';
                this.showPdf = false;
                this.results = [];
                this.resultsCheck = null;

                this.resultsCheck = (await ApiService.getCompaniesBySearch(this.searchString)).data.hits.hits;

                if(this.resultsCheck.length === 0) {
                     this.$store.commit('setMessage', { text: 'No records to show from the search criteria...', type: 'error' });
                     return;
                }

                this.results = this.resultsCheck.map((t) => t._source);

                let company_id = '';

                for(const t of this.results) {
                    const tempCompanyId = t.company_id;

                    t.name = this.$store.getters.getMapCompanies.get(parseInt(tempCompanyId)).name;

                    if(company_id === tempCompanyId) {
                        t.header = false;
                    } else {
                        company_id = tempCompanyId;
                        t.header = true;
                    }
                }

                this.showPdf = true;
            }
        }
    }
</script>

<style scoped>
    .main-container {
        position: relative;
        margin-top: 20px;
        margin-left: 20px;
    }

    .sub-container {
        width:500px;
    }

    .title-block {
        font-size: 1.3em;
        color: #1E42FF;
    }

    .block-min-height {
        min-height: 80px;
    }

    .information-text-margin {
        margin-left: 85px;
    }

    .block-position {
        float: left;
        width: 70px;
        text-align: right;
    }

    .period-block {
        margin-top: 3px;
        color: #747272;
    }

    .period-block-no-margin {
        color: #747272;
    }

    .grey-page-text {
        color: #a1a1a1;
    }

    .image-block {
        height: 35px;
        float: right;
    }

    .pdf-container {
        position: absolute;
        top: 0;
        left: 520px;
        width: 100%;
    }

    .object-pdf-block {
        width: 100%;
        height: calc(100vh - 8rem);
        padding-right: 535px;
    }

    .text-area-scroll {
        overflow-y: scroll;
        height: calc(100vh - 8rem);
    }

    >>> .set-pdf-file-container {
        width: 35px;
        height: 45px;
    }

    >>> .set-pdf-file-color {
        fill: #E72929;
    }

    .cursor-hover:hover {
        cursor: pointer;
    }
</style>

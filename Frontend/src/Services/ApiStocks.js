import Api from '@/Services/Api'

/*  Useful ways to handle response (and ERRORS)
response.data
response.status
response.statusText
response.headers
response.config

error.name
error.message
error instanceof EvalError  TODO : map these to database syntax or grammar or other errors
error instanceof InternalError
error instanceof RangeError
error instanceof ReferenceError
error instanceof SyntaxError
error instanceof TypeError
error instanceof URIError

*/

export default {
    async fetchStocks() {
        return await Api().get('/stocks');
    },
    async fetchMapStocks(payload) {
        return await Api().post('/mapStocks/', payload);
    },
    async fetchAllStocks() {
        return await Api().get('/fetchAllStocks');
    },
    async fetchOnePageStocks() {
        return await Api().get('/fetchOnePageStocks',);
    },
    async loadAllStocksForAutocompleteOnStartup() {
        return await Api().get('/loadAllStocksForAutocompleteOnStartup');
    },

    async fetchStockReports_EPS(company_id) {
        return await Api().get('/companyReport_eps/' + company_id);
    },

    async fetchStockReportPDF(company_id) {
        return await Api().get('/companyReportPDF/' + company_id);
    },

    async updateWatchlist(payload) {
        return await Api().post("/updateWatchlist", payload);
    },

    async fetchStock(stock_id) {
        return await Api().get('/stock/' + stock_id);
    },

    async fetchCompany(company_id) {
        return await Api().get('/company/' + company_id);
    },

    async insertWatchlist(payload) {
        return await Api().post('/watchlist', payload);
    },

    async insertWatchlistItem(payload) {
        return await Api().post('/watchlistitem', payload);
    },

    async getWatchlists(user_id) {
        return await Api().get('/watchlists/' + user_id);
    },

    async changeWatchlistName(payload) {
        return await Api().post("/updateWatchlist", payload);
    },

    async screenResults(payload) {
        return await Api().post('/screenResults/', payload);
    },

}

function handleAllErrors(error) {
    if (error.response) {
        console.log("*** RESPONSE ERROR status: " + error.response.status +
            " data: " + error.response.data +
            " headers: " + error.response.headers);
    } else if (error.request) {
        console.log("*** REQUEST ERROR request: " + error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log("*** error.message: " + error.message);
    }
    console.log("*** error.config: " + error.config);
}
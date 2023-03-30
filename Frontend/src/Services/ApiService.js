/* eslint-disable no-console */
import Api from '@/Services/Api';
import { store } from './../stores';

const marshalResponse = async(axiosEndpointCall) => {
    try {
        const response = await axiosEndpointCall;

        if (response.status === 200 || response.status === 201 || response.status === 204 || response.status === 304) {
            return response.data;
        } else {
            console.log('something went wrong');
            store.commit('setMessage', { text: 'oops... something went wrong', type: 'error' });
            return { message: 'oops... something went wrong' };
        }
    } catch (error) {
        console.log(error.message);
        store.commit('setMessage', { text: error.message, type: 'error' });
        return { message: error.message };
    }
};

const marshalTransactionResponse = async(axiosEndpointCall) => {
    try {
        const response = await axiosEndpointCall;

        if (response.status === 200 || response.status === 201 || response.status === 204 || response.status === 304) {
            store.commit('setMessage', { text: response.data.message, type: 'success' });
            return response.data;
        } else {
            console.log('something went wrong');
            store.commit('setMessage', { text: 'oops... something went wrong', type: 'error' });
        }
    } catch (error) {
        console.log(error.message);
        store.commit('setMessage', { text: error.message, type: 'error' });
    }
};

export default {

    async getPlan(user_id) {
        return await Api().get('/plan/' + user_id)
    },

    async setPlan(plan) {
        return await Api().post('/plan', plan)
    },

    async deletePlan(user_id) {
        return await Api().delete('/plan/' + user_id)
    },


    async selectDiaryItems(user_id) {
        const response = await Api().get('/diaryItems/' + user_id);
        if (response.status === 200) {
            //commit("setMessage", {text: 'Your diary: loaded', type: 'info'});
            return response.data
        } else {
            console.log(` ${response.status} : `);
        }
    },

    async insertDiaryItem(diaryItem) {
        return await Api().post('/diaryItem', diaryItem)
    },

    async updateDiaryItem(diaryItem) {
        return await Api().put('/diaryItem', diaryItem)
    },

    async deleteDiaryItem(diary_item_id) {
        return await Api().delete('/diaryItem/' + diary_item_id);
    },

    async userLogin(requestBody) {
        return await Api().post('/user/login', requestBody);
    },
    async addUser(requestBody) {
        return await Api().post('/user', requestBody);
    },
    async continue_GF(requestBody) {
        return await Api().post('/continue_GF', requestBody);
    },
    async deleteUser(id) {
        return await Api().delete('/user/' + id);
    },
    async selectUser(email) {
        return await Api().get('/user/' + email);
    },
    async findUser(id) {
        return (await Api().get('/findUser/' + id)).data;
    },
    async verifyAndLogin(user_id) {
        return (await Api().get('/verify/' + user_id)).data;
    },
    async unsubscribeIntercomNewsletterFromUser(user_id) {
        return ((await Api().get('/unsubscribeIntercomNewsletterFromUser/' + user_id)).data.data)[0];
    },
    async unsubscribeEmailNewsletter(user_id) {
        return (await Api().put(`/unsubscribeEmailNewsletter/${user_id}`)).data;
    },
    async unsubscribeEmailNewsletterFromUserTable(user_id) {
        return (await Api().put(`/unsubscribeEmailNewsletterFromUserTable/${user_id}`)).data;
    },

    async userNotifications(requestBody) {
        return await Api().post('/notifications/', requestBody);
    },

    async sendInvitationToFriend(requestBody) {
        return await Api().post('/sendInvitationToFriend/', requestBody);
    },

    async verifyUserPassword(requestBody) {
        return await Api().post('/verifyUserPassword/', requestBody);
    },

    async updateUser(user) {
        return await Api().put('/user', user);
    },
    async userList() {
        return await Api().get('/users');
    },
    // Commented away because it is not used anywere in the project
    // updateUserPassword(email, password) {
    //     return Api().put('/user/password', {
    //         user: email,
    //         password: password
    //     });
    // },
    async forgotPassword(requestBody) {
        return await marshalResponse(Api().post('/user/forgotPassword', requestBody));
    },
    async newPassword(requestBody) {
        return await Api().post('/user/newPassword', requestBody);
    },
    async addUserSettings(requestBody) { // add to the settings of user for example: language
        return await Api().post('/addUserTabs/', requestBody)
    },
    async addNavigationTabs(requestBody) { // add to the user navigation tabs
        return await Api().post('/addTabs/', requestBody)
    },
    async resetPassword(requestBody) {
        return await Api().post('/user/resetPassword', requestBody);
    },
    // saveLanguage(requestBody) {
    //     return Api().post('/saveLanguage', requestBody)
    // },
    async stripe(requestBody) {
        return await Api().post('/stripe/', requestBody);
    },
    async cancelStripe(requestBody) {
        return await Api().post('/cancelStripe/', requestBody);
    },
    async upgradeSubscription(payload) {
        return await Api().post('/upgradeSubscription/', payload);
    },
    async getTransactionHistoryStripe(payload) {
        return await Api().post('/getTransactionHistoryStripe/', payload);
    },
    async getPromoCodes() {
        return await Api().get('/getPromoCodes');
    },
    async getUserAccounts(user_id) {
        return await Api().get(`/getUserAccounts/${user_id}`);
    },
    async getAllUserAccounts() {
        return await Api().get('/getAllUserAccounts');
    },
    async getUserAccount(user_account_id) {
        return await Api().get(`/getUserAccount/${user_account_id}`);
    },
    async createUserAccount(account) {
        return await Api().post(`/createUserAccount`, account);
    },
    async updateUserAccount(account) {
        return await Api().put('/updateUserAccount', account);
    },
    async avanzaGenerate2FA(secret_key) {
        return await Api().get(`/avanzaGenerate2FA/${secret_key}`);
    },
    async avanzaGetTransactions(user) {
        return await Api().post('/avanzaGetTransactions/', user);
    },
    async deleteUserAccountsOnUserId(user_id) {
        return await Api().delete(`/deleteUserAccountsOnUserId/${user_id}`);
    },
    async deleteUserAccount(user_account_id) {
        return await Api().delete(`/deleteUserAccount/${user_account_id}`);
    },

    async getPrices(stock_id) {
        return await Api().get('/prices/' + stock_id)
    },
    async writeContent(requestBody) {
        return await Api().post('/writeContent/', requestBody)
    },
    async fetchContent(requestBody) {
        return await Api().post('/fetchContent/', requestBody)
    },
    async deleteContent(requestBody) {
        return await Api().post('/deleteContent/', requestBody);
    },
    async getNews() {
        return await Api().get('/getNews');
    },
    async getNews50() {
        return await Api().get('/getNews50/')
    },
    async getNewsWatched(user_id) {
        return await Api().get(`/getNewsWatched/${user_id}`);
    },
    async getNewsOnCompanyId(company_id) {
        return await Api().get('/getNewsOnCompanyId/' + company_id);
    },
    async getNewsOnNewsId(news_id) {
        return await Api().get('/getNewsOnNewsId/' + news_id);
    },
    async getCompaniesAndReports(payload) {
        return await Api().post('/companiesAndReports/', payload);
    },
    async getCompaniesAndReportONE(payload) {
        return await Api().post('/companiesAndReportONE/', payload);
    },
    async getCompanyAnalysts() {
        return await Api().get('/companyAnalysts');
    },
    async getOneCompanyAnalysis(company_id) {
        return await Api().get('/companyAnalysisOne/' + company_id);
    },
    async getCompanyWebcasts() {
        return await Api().get('/getCompanyWebcasts');
    },
    async getOneCompanyWebcast(company_id) {
        return await Api().get('/getOneCompanyWebcast/' + company_id);
    },
    async getCompanyReports(company_id) {
        return await Api().get('/companyReports/' + company_id);
    },
    async fetchMapFinancials() {
        return await Api().get('/fetchMapFinancials')
    },
    async fetchMapFinancialsYear() {
        return await Api().get('/fetchMapFinancialsYear')
    },
    async fetchFinancialData(company_id) {
        return await Api().get('/fetchFinancialData/' + company_id)
    },
    async fetchFinancialsQuarterly(company_id) {
        return await Api().get('/company/financials/q/' + company_id)
    },
    async fetchFinancialsAnnual(company_id) {
        return await Api().get('/company/financials/a/' + company_id)
    },
    async fetchInsiderData(company_id) {
        return await Api().get('/fetchInsiderData/' + company_id)
    },
    async fetchCompanies() {
        return await Api().get('/fetchCompanies')
    },
    async fetchMinimizedCompanies() {
        return await Api().get('/fetchMinimizedCompanies')
    },
    async fetchResearchData(user_id) {
        return await Api().get('/fetchResearchData/' + user_id)
    },
    async updateConviction(requestBody) {
        return await Api().post('/updateConviction/', requestBody);
    },
    async fetchConviction(user_id) {
        return await Api().get('/fetchConviction/' + user_id)
    },
    async fetchConviction_withINSREF(requestBody) {
        return await Api().post('/fetchConviction_withINSREF/', requestBody)
    },
    async fetchSector_name(sector_id) {
        return await Api().get('/fetchSector_name/' + sector_id)
    },
    async getAllSectors() {
        return await Api().get('/getAllSectors');
    },
    async addTags(requestBody) {
        return await Api().post('/addTags/', requestBody)
    },
    async fetchTags(requestBody) {
        return await Api().post('/fetchTags/', requestBody)
    },
    async fetchChartInsiderData(stock_id) {
        return await Api().get('/chartInsiders/' + stock_id)
    },
    async save_UserLines(requestBody) {
        return await Api().post('/save_UserLines/', requestBody);
    },
    async deleteUserChartLinesOnUserId(user_id) {
        return await Api().delete('/deleteUserChartLinesOnUserId/' + user_id);
    },
    async fetchUserLinesData(requestBody) {
        return await Api().post('/fetchUserLinesData/', requestBody);
    },
    async fetchEarningDates(stock_id) {
        return await Api().get('/chartEarningsDates/' + stock_id)
    },

    async fetchSectorsTree() {
        return await Api().get('/fetchSectorsTree');
    },

    async fetchWatchlists(user_id) {
        return await Api().get('/watchlists/' + user_id);
    },
    async fetchWatchlistJoins(user_id) {
        return await Api().get('/watchlistJoins/' + user_id);
    },

    async insertWatchlist(requestBody) {
        return await Api().post('/watchlist/', requestBody);
    },

    async deleteWatchlist(watchlist_id) {
        return await Api().delete('/watchlist/' + watchlist_id);
    },

    async WLIdelete(payload) {
        const response = await Api().post('/removeWatchlistitem/', payload);
        return response;
        /*  HOW TO HANDLE SUCH ERRORS
        This looks like an early attempt...
                this.$store.commit("setMessage", {
                            text: 'Failed to delete User Watchlist item.' + error,
                            type: 'error'
                        });
                    });*/
    },

    async deleteAllWatchlistJoinsOnUserId(user_id) {
        return await Api().delete(`/deleteAllWatchlistJoinsOnUserId/${user_id}`);
    },

    async deleteWatchlistItemsOnUserId(user_id) {
        return await Api().delete(`/deleteWatchlistItemsOnUserId/${user_id}`);
    },

    async WLIsave(requestBody) {
        return await Api().post('/watchlistitem/', requestBody);
        //                this.$store.commit("setMessage", {text: 'APiUserFun:' + error, type: 'error'});
    },

    async WLIUpdate(requestBody) {
        return await Api().put('/watchlistitem/', requestBody);
        //                this.$store.commit("setMessage", {text: 'APiUserFun:' + error, type: 'error'});

    },
    async fetchEarningsDateNext() {
        return await Api().get('/fetchEarningsDateNext');
    },
    async fetchSectors() {
        return await Api().get('/fetchSectorsTree');
    },
    async fetchExchanges() {
        return await Api().get('/stockExchanges');
    },


    async selectUserTrades(user_id) {
        return await marshalResponse(Api().get('/selectUserTrades/' + user_id));
    },
    async insertUserTrade(requestBody) {
        return await Api().post('/insertUserTrade/', requestBody);
    },
    async insertArrayOfUserTrades(data) {
        return await marshalResponse(Api().post('/insertArrayOfUserTrades', data));
    },
    // Function 'updateUserTrade' need requestBody as parameter
    async updateUserTrade(requestBody) {
        return await Api().put('/updateUserTrade', requestBody);
    },
    // Function 'updateArrayOfUserTrades' endpoint is commented away
    async updateArrayOfUserTrades(data) {
        return await marshalTransactionResponse(Api().put('/updateArrayOfUserTrades', data));
    },
    async deleteUserTrade(trade_id) {
        return await Api().delete('/deleteUserTrade/' + trade_id);
    },
    async deleteUserTradeOnUserIdAndStockId(data) {
        return await marshalResponse(Api().post('/deleteUserTradeOnUserIdAndStockId', data));
    },
    async deleteUserTradesOnUserId(user_id) {
        return await marshalResponse(Api().delete(`/deleteUserTradeOnUserId/${user_id}`));
    },
    async actionUserTrade(data) {
        return await Api().post('/actionUserTrade/', data);
    },

    //////////////////////////=================== Get Trade Plan (by Drawing Tool) ================////////////////////////
    async getTradePlan(requestBody) {
        return await Api().get(`/selectUserTradePlan/${requestBody.user_id}/${requestBody.stock_id}`)
    },

    async getTradePlans(user_id) {
        const response = await Api().get(`/selectUserTradePlans/${user_id}`);
        if (response.status === 200) {
            return response.data
        } else {
            //            console.log(` ${response.status} : problems...`);
        }
    },

    async updateTradePlan(requestBody) {
        return await Api().put("/updateUserTradePlan", requestBody)
    },
    async insertUserTradePlan(requestBody) {
        return await Api().post("/insertUserTradePlan", requestBody)
    },
    async deleteUserTradePlan(requestBody) {
        // console.log('^^^^^^', requestBody)
        return await Api().delete("/deleteUserTradePlan/" + requestBody.trade_plan_id)
    },

    // Rename to: userTradeByStock
    async getUserTradeByStock(user_id, stock_id) {
        return await Api().get(`/getUserTradeByStock/${user_id}/${stock_id}`)
    },
    // Rename to: userTrades
    async getUserTrades(user_id) {
        return await marshalResponse(Api().get(`/getUserTrades/${user_id}`));
    },
    async updateTradeHistory(requestBody) {
        return await Api().put("/updateTradeHistory", requestBody)
    },
    async insertTradeHistory(requestBody) {
        return await Api().post("/insertTradeHistory", requestBody)
    },


    async saveWatchlistHeaders(requestBody) {
        return await Api().post("/saveWatchlistHeaders", requestBody)
    },
    async fetchWatchlistHeaders(user_id) {
        return await Api().get('/fetchWatchlistHeaders/' + user_id);
    },
    async getUserScreenerFilters(user_id) {
        return await Api().get('/screens/' + user_id)
    },
    async saveUserScreenerFilters(requestBody) {
        return await Api().post('/screen', requestBody)
    },
    async deleteScreen(screen_id) {
        return await Api().delete('/screen/' + screen_id)
    },
    async updateScreenFilters(requestBody) {
        return await Api().post('/updateScreen', requestBody)
    },
    async updateUserScreenerFilters(requestBody) {
        return await Api().post('/updateScreenFilter', requestBody)
    },
    async uploadAvanza(data) {
        return await marshalResponse(Api().post('/uploadAvanza', data));
    },
    async saveAvanza(data) {
        return await marshalTransactionResponse(Api().post('/saveAvanza', data));
    },
    async insertOneTx(data) {
        return await marshalResponse(Api().post('/insertOneTx', data));
    },
    async fetchTx(user_id) {
        return await marshalResponse(Api().get('/fetchTx/' + user_id));
    },
    async updateTxOnId(requestBody) {
        return await marshalTransactionResponse(Api().post('/updateTx', requestBody));
    },
    async deleteTxOnId(requestBody) {
        return await marshalTransactionResponse(Api().post('/deleteTx', requestBody));
    },
    async loadWLColumns(user_id) {
        return await Api().get('/loadWLColumns/' + user_id);
    },
    async loadChartOverlays(user_id) {
        return await Api().get('/loadChartOverlays/' + user_id);
    },
    async saveWLColumns(data) {
        return await Api().post('/saveWLColumns', data);
    },
    async saveChartOverlays(data) {
        return await Api().post('/saveChartOverlays', data);
    },

    async getBackofficeUserData() {
        return await Api().get('/backoffice-user-data');
    },
    async getBackofficeCompanyData() {
        return await Api().get('/backoffice-company-data');
    },
    async getCompanyCalendars() {
        return await Api().get('/backoffice-company-calendars');
    },
    async getReportFromMillistream(company_id, period) {
        return await Api().get('/report-from-millistream/' + company_id + '/' + period);
    },
    async getMissingReports() {
        return await Api().get('/missing-reports');
    },
    async getHealthCheck() {
        return (await Api().get('/healthCheck')).data;
    },
    async getDataIntegrity() {
        return (await Api().get('/data-integrity')).data;
    },
    async getCalendarExceptions() {
        return await Api().get('/check-millistream-calendars');
    },
    async getCompaniesBySearch(searchString) {
        return await Api().get('/text-search/' + searchString);
    },

    async getCompetitions() {
        return await Api().get('/competitions');
    },
    async getUserCompetitions (user_id) {
        return await Api().get('/userCompetitions/'+user_id);
    },
    async getNotifications (user_id) {
        return await Api().get('/notifications/'+user_id);
    },

    async getExchangeRates () {
        return await Api().get('/exchange_rates');
    },




}

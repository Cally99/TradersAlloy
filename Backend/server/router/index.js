 const errorHandler = require('../middleware/async');
 // const errorHandler = require('../controllers/ErrorHandler');

 const UserScreenController = require('../controllers').UserScreenController;
 const UserController = require('../controllers').UserController;
 const UserSettingsController = require('../controllers').UserSettingsController;
 const UserFunController = require('../controllers').UserFunController;
 const UserTradeController = require('../controllers').UserTradeController;
 const UserTradePlanController = require('../controllers').UserTradePlanController;
 const UserResearchController = require('../controllers').UserResearchController;
 const UserChartLinesController = require('../controllers').UserChartLinesController;
 const UserDiaryController = require('../controllers').UserDiaryController;
 const UserTxController = require('../controllers').UserTxController;
 const WatchlistController = require('../controllers').UserWatchlistController;
 const FroalaController = require('../controllers').FroalaController;
 const UserPortfolioPlanController = require('../controllers').UserPortfolioPlanController;

 const CompanyController = require('../controllers').CompanyController;
 const CompanyReportController = require('../controllers').CompanyReportController;
 const CompanyReportFinancialsController = require('../controllers').CompanyReportFinancialsController;
 const CompanyAnalystsController = require('../controllers').CompanyAnalystsController;
 const CompanyWebcastController = require('../controllers').CompanyWebcastController;

 const StockController = require('../controllers').StockController;
 const CompanyNewsController = require('../controllers').CompanyNewsController;
 const StockInsiderController = require('../controllers').StockInsiderController;
 const SectorController = require('../controllers').SectorController;
 const StockExchangeController = require('../controllers').StockExchangeController;
 const StockChartController = require('../controllers').StockChartController;

 const StripeController = require('../controllers').StripeController;
 const BackofficeController = require('../controllers').BackofficeController;
 const TextractController = require('../controllers').TextractController;
 const SearchController = require('../controllers').SearchController;

 const CompetitionController = require('../controllers').CompetitionController;
 const UserAccountController = require('../controllers').UserAccountController;
 const NotificationController = require('../controllers').NotificationController;
 const SysExchangeRateController = require('../controllers').SysExchangeRateController;

 /**
  * Middleware wrapper for all Controller error handling to the API.
  *
  * Every API call is wrapped with this function and all errors are
  * handled consistently HERE.
  *
  const fnx = (err, req, res, next) => {
 	console.log('-----------------');
 	console.log(JSON.stringify(err));  // maybe parse the error message
 	//res.status(400).send({text: err.message, type: 'error'});

 	res.status(501).send({text: err.message, type: 'error'});
 };
  app.use(fnx);
  */

 const backofficeUserService = require("../services/BackofficeUserService");

 module.exports = (app) => {
     // Currently the business logic must handle errors (in the controller layer)
     app.get('/api/backoffice-user-data', BackofficeController.getUserDataDump);
     app.get('/api/data-integrity', BackofficeController.getDataIntegrity);





     ///////////             Basic User ACCOUNT stuff
     app.post('/api/user', errorHandler(UserController.create));
     app.post('/api/continue_GF', errorHandler(UserController.continue_GF));
     app.delete('/api/user/:user_id', errorHandler(UserController.deleteUser));
     app.post('/api/user/login', errorHandler(UserController.userLogin));
     app.post('/api/user/forgotPassword', errorHandler(UserController.forgotPassword));
     app.post('/api/user/newPassword', errorHandler(UserController.newPassword));
     app.post('/api/user/resetPassword', errorHandler(UserController.resetPassword));

     app.post('/api/sendInvitationToFriend', errorHandler(UserController.sendInvitationToFriend));

     app.post('/api/notifications', errorHandler(UserController.userNotifications));
     app.post('/api/verifyUserPassword', errorHandler(UserController.verifyUserPassword));
     app.get('/api/unsubscribeIntercomNewsletterFromUser/:user_id', errorHandler(UserController.unsubscribeIntercomNewsletterFromUser));
     app.put('/api/unsubscribeEmailNewsletter/:user_id', errorHandler(UserController.unsubscribeEmailNewsletter));
     app.put('/api/unsubscribeEmailNewsletterFromUserTable/:user_id', errorHandler(UserController.unsubscribeEmailNewsletterFromUserTable));


     app.get('/api/user/:email', errorHandler(UserController.select));
     app.get('/api/findUser/:id', errorHandler(UserController.findUser));
     app.get('/api/users', errorHandler(UserController.list));
     app.put('/api/user', errorHandler(UserController.update));
     app.get('/api/verify/:user_id', errorHandler(UserController.verifyAndLogin));
     app.get('/api/gotoPdf/:user_id/:company_id/:pdf_link', errorHandler(UserController.gotoPdf));
     app.get('/api/create_account_by_invitation/:email', errorHandler(UserController.createAccountByInvitation));
     app.post('/api/addUserTabs/', errorHandler(UserController.addUserSettings)); // add the user settings
     app.post('/api/addTabs/', errorHandler(UserController.addNavigationTabs)); // add the navigationTabs for user
     app.get('/api/fetchWatchlistHeaders/:user_id', errorHandler(UserController.fetchWatchlistHeaders));
     app.post('/api/saveWatchlistHeaders/', errorHandler(UserController.saveWatchlistHeaders));

     // Waiting on doing errorHandler on the Stripe Controller
     // until we have reviewed together on how to apply it
     app.post('/api/stripe/', StripeController.payment_stripe);
     app.post('/api/cancelStripe/', StripeController.cancelStripe);
     app.post('/api/upgradeSubscription/', StripeController.upgradeSubscription);
     app.post('/api/getTransactionHistoryStripe/', StripeController.getTransactionHistoryStripe);
     app.get('/api/getPromoCodes', StripeController.getPromoCodes);


     ///////////           User Functionality - not account stuff
     // app.get('/api/getFriends/:user_id', UserFunController.listFriends);             // not affected by ISIN --> INSREF
     // app.post('/api/addFriend/', UserFunController.addFriend);                       // not affected by ISIN --> INSREF
     // app.get('/api/user_history', UserFunController.history);                        // not implemented yet
     // app.get('/api/pdf/:data', UserFunController.pdf);                               // ?
     // app.post('/api/saveLanguage/', UserController.saveLanguage);

     // Will have to wait with applying errorHandler on this controller
     // function until we have reviewed how to structure the function
     app.post('/api/user_research_share/', UserFunController.userResearchShare); // CHANGE ISIN --> INSREF

     app.post('/api/writeContent/', errorHandler(UserResearchController.writeContent));
     app.post('/api/fetchContent/', errorHandler(UserResearchController.fetchContent));
     app.post('/api/deleteContent/', errorHandler(UserResearchController.deleteContent));
     app.get('/api/fetchResearchData/:user_id', errorHandler(UserResearchController.fetchResearchData));

     app.post('/api/save_UserLines/', errorHandler(UserChartLinesController.save_UserLines));
     app.delete('/api/deleteUserChartLinesOnUserId/:user_id', errorHandler(UserChartLinesController.deleteUserChartLinesOnUserId));
     app.post('/api/fetchUserLinesData/', errorHandler(UserChartLinesController.fetchUserLinesData));

     app.get('/api/selectUserTradePlans/:user_id', errorHandler(UserTradePlanController.selectUserTradePlans));
     app.get('/api/selectUserTradePlan/:user_id/:stock_id', errorHandler(UserTradePlanController.selectUserTradePlan));
     app.post('/api/insertUserTradePlan', errorHandler(UserTradePlanController.insertUserTradePlan));
     app.put('/api/updateUserTradePlan', errorHandler(UserTradePlanController.updateUserTradePlan));
     app.delete('/api/deleteUserTradePlan/:trade_plan_id', errorHandler(UserTradePlanController.deleteUserTradePlan));


     // UserTrade and TradeHistory are the same thing ( with one DB table)... these have been corrected
     // and trying to merge this code to remove duplicate methods.
     app.get('/api/selectUserTrades/:user_id', errorHandler(UserTradeController.selectUserTrades));
     app.post('/api/insertUserTrade/', errorHandler(UserTradeController.insertUserTrade));
     app.post('/api/insertArrayOfUserTrades/', errorHandler(UserTradeController.insertArrayOfUserTrades));
     app.put('/api/updateUserTrade/', errorHandler(UserTradeController.updateUserTrade));
     app.delete('/api/deleteUserTrade/:trade_id', errorHandler(UserTradeController.deleteUserTrade));
     app.post('/api/deleteUserTradeOnUserIdAndStockId', errorHandler(UserTradeController.deleteUserTradeOnUserIdAndStockId));
     app.delete('/api/deleteUserTradeOnUserId/:user_id', errorHandler(UserTradeController.deleteUserTradeOnUserId));
     app.put('/api/updateArrayOfUserTrades/', errorHandler(UserTradeController.updateArrayOfUserTrades));
     app.get('/api/getUserTrades/:user_id', errorHandler(UserTradeController.getUserTrades));
     app.get('/api/getUserTradeByStock/:user_id/:stock_id', errorHandler(UserTradeController.getUserTradeByStock));
     app.post('/api/insertTradeHistory', errorHandler(UserTradeController.insertTradeHistory));
     app.put('/api/updateTradeHistory', errorHandler(UserTradeController.updateTradeHistory));
     app.post('/api/actionUserTrade', errorHandler(UserTradeController.actionUserTrade));

     app.get('/api/getUserAccounts/:user_id', errorHandler(UserAccountController.getUserAccounts));
     app.get('/api/getAllUserAccounts', errorHandler(UserAccountController.getAllUserAccounts));
     app.get('/api/getUserAccount/:user_account_id', errorHandler(UserAccountController.getUserAccount));
     app.post('/api/createUserAccount', errorHandler(UserAccountController.createUserAccount));
     app.put('/api/updateUserAccount', errorHandler(UserAccountController.updateUserAccount));
     app.delete('/api/deleteUserAccountsOnUserId/:user_id', errorHandler(UserAccountController.deleteUserAccountsOnUserId));
     app.delete('/api/deleteUserAccount/:user_account_id', errorHandler(UserAccountController.deleteUserAccount));

     // WATCHLIST
     app.get("/api/watchlistitems/:user_id", errorHandler(WatchlistController.selectItems));


     app.get("/api/watchlists/:user_id", errorHandler(WatchlistController.selectWatchlists));
     app.get("/api/watchlistJoins/:user_id", errorHandler(WatchlistController.selectWatchlistJoins));
     app.get("/api/watchlist_objects/:user_id", errorHandler(WatchlistController.selectWatchlistObjects));
     app.post("/api/watchlist", errorHandler(WatchlistController.insertWatchlist));
     app.post("/api/updateWatchlist", errorHandler(WatchlistController.updateWatchlist)); // Why is update a POST ?
     app.delete("/api/watchlist/:watchlist_id", errorHandler(WatchlistController.deleteWatchlist));
     // WATCHLIST ITEMS
     app.post("/api/watchlistitem", errorHandler(WatchlistController.insertItem));
     app.put("/api/watchlistitem", errorHandler(WatchlistController.updateItem));
     app.post('/api/updateConviction/', errorHandler(WatchlistController.updateConviction));
     app.post('/api/fetchConviction_withINSREF/', errorHandler(WatchlistController.fetchConviction_withINSREF)); // ACTUALLY should use stock_id
     app.post('/api/addTags/', errorHandler(WatchlistController.addTags));
     app.post('/api/fetchTags/', errorHandler(WatchlistController.fetchTags));
     app.post('/api/removeWatchlistitem/', errorHandler(WatchlistController.deleteItem));
     app.delete('/api/deleteAllWatchlistJoinsOnUserId/:user_id', errorHandler(WatchlistController.deleteAllWatchlistJoinsOnUserId));
     app.delete('/api/deleteWatchlistItemsOnUserId/:user_id', errorHandler(WatchlistController.deleteWatchlistItemsOnUserId));

     app.post('/api/addStocksToWLs/', errorHandler(WatchlistController.addStocksToWLs));
     app.post('/api/removeStocksFromWLs/', errorHandler(WatchlistController.removeStocksFromWLs));
     app.post('/api/removeStocksFromWLI/', errorHandler(WatchlistController.removeStocksFromWLI));

     // User Transactions
     // Need to review with other members on the UserTxController functions
     // on how to use the errorHandler for these functions and how to
     // structure them from "then/catch" to "try/cats and async/await"  //Ulf
     app.get('/api/fetchTx/:user_id', UserTxController.fetchTx);
     app.post('/api/saveAvanza/', errorHandler(UserTxController.save_json_UserTx)); // TODO: rename: I do not think this is specific to Avanza //AB
     app.post('/api/insertOneTx/', errorHandler(UserTxController.insertOneTx));
     app.post('/api/updateTx/', errorHandler(UserTxController.updateSpecUserTx));
     app.post('/api/deleteTx/', errorHandler(UserTxController.deleteSpecUserTx));


     //   Avanza
     app.post('/api/uploadAvanza/', UserTxController.save_UserTx); // TODO: rename to /api/avanzaGetTransactionsCSV
     app.get('/api/avanzaGenerate2FA/:secret_key', UserTxController.avanzaGenerate2FA) // this will 1. update user_account.secret_key 2. return a short key for the user eg. "441 150"
     app.post('/api/avanzaGetTransactions/', UserTxController.avanzaGetTransactions) // do not log this anywhere on the server or logs (very secret... we do not want to know it)

     app.post('/api/avanzaTest', errorHandler(UserController.avanzaTest));

     // USER DIARY
     app.get('/api/diaryItems/:user_id', errorHandler(UserDiaryController.selectDiaryItems));
     app.get('/api/diaryItems', errorHandler(UserDiaryController.selectDiaryItems)); // Here is a duplicate, should it be removed?
     app.post('/api/diaryItem', errorHandler(UserDiaryController.insertDiaryItem));
     app.put('/api/diaryItem', errorHandler(UserDiaryController.updateDiaryItem));
     app.delete('/api/diaryItem/:diary_item_id', errorHandler(UserDiaryController.deleteDiaryItem));

     // USER SCREEN
     app.get('/api/screens/:user_id', errorHandler(UserScreenController.selectScreens));
     app.post('/api/updateScreen', errorHandler(UserScreenController.updateScreen));
     app.post('/api/screen', errorHandler(UserScreenController.insertScreen));
     app.post('/api/updateScreenFilter', errorHandler(UserScreenController.updateScreenFilter));
     app.delete('/api/screen/:screen_id', errorHandler(UserScreenController.deleteScreen));

     ////////// User Settings
     app.get('/api/loadWLColumns/:user_id', errorHandler(UserSettingsController.loadWLColumns));
     app.post('/api/saveWLColumns/', errorHandler(UserSettingsController.saveWLColumns));
     app.get('/api/loadChartOverlays/:user_id', errorHandler(UserSettingsController.loadChartOverlays));
     app.post('/api/saveChartOverlays/', errorHandler(UserSettingsController.saveChartOverlays));
     // Need to review with other members on the
     // FroalaController on how to structure the
     // function uploadImage to work with the errorHandler
     app.post('/api/froala/image/', FroalaController.uploadImage);

     // USER PORTFOLIO PLAN
     app.get('/api/plan/:user_id', errorHandler(UserPortfolioPlanController.getPlan));
     app.post('/api/plan/', errorHandler(UserPortfolioPlanController.setPlan));
     app.delete('/api/plan/', errorHandler(UserPortfolioPlanController.deletePlan));

     //////////  COMPANY
     app.get('/api/company/:company_id', errorHandler(CompanyController.get));
     app.get('/api/fetchCompanies', errorHandler(CompanyController.list));
     app.get('/api/fetchMinimizedCompanies', errorHandler(CompanyController.minlist));
     app.post('/api/companiesAndReports/', errorHandler(CompanyController.getCompaniesAndReports));
     app.post('/api/companiesAndReportONE/', errorHandler(CompanyController.companiesAndReportONE));

     app.get('/api/text-search/:searchString', SearchController.getSearchResults);

     // ceo_comments
     app.put('/api/ceo-comments/:company_id', errorHandler(CompanyController.updateCEOComments));



     app.get('/api/companyReports/:company_id', errorHandler(CompanyReportController.fetchCompanyReports));

     app.get('/api/companyReport_eps/:company_id', errorHandler(CompanyReportController.companyReport_eps));
     app.get('/api/companyReportPDF/:company_id', errorHandler(CompanyReportController.companyReportPDF));
     app.get('/api/fetchFinancials/:company_id', errorHandler(CompanyReportController.fetchFinancials)); // Used by the chart -- rework needed
     app.get('/api/company/financials/q/:company_id', errorHandler(CompanyReportController.fetchFinancialsQuarterly));
     app.get('/api/company/financials/a/:company_id', errorHandler(CompanyReportController.fetchFinancialsAnnual));
     app.get('/api/fetchEarningsDateNext', errorHandler(CompanyReportController.fetchEarningsDateNext)); // We get the earnings_date array first, and save to vuex... so that we can display earning_date in Rapportkollen/Watchist pages with isin using earningsDateNextArray.

     // CompanyReportFinancialsController on how to structure the
     // functions fetchMapFinancials and fetchFinancialData to
     // work with the errorHandler
     app.get('/api/fetchMapFinancials', CompanyReportFinancialsController.fetchMapFinancials); // mapFinancialsData... initial data (used by StockOverview
     app.get('/api/fetchMapFinancialsYear', CompanyReportFinancialsController.fetchMapFinancialsYear);
     app.get('/api/fetchFinancialData/:company_id', CompanyReportFinancialsController.fetchFinancialData);

     // company analysts
     app.get('/api/companyAnalysts', CompanyAnalystsController.list);
     app.get('/api/companyAnalysisOne/:company_id', CompanyAnalystsController.getOneCompanyAnalysis);

     app.get('/api/getCompanyWebcasts', CompanyWebcastController.list);
     app.get('/api/getOneCompanyWebcast/:company_id', CompanyWebcastController.getOneCompanyWebcast);

     // Special case: company/stock
     app.get('/api/getNews', errorHandler(CompanyNewsController.getNews));
     app.get('/api/getNews50', errorHandler(CompanyNewsController.getNews50));
     app.get('/api/getNewsWatched/:user_id', errorHandler(CompanyNewsController.getNewsWatched));

     app.get('/api/getNewsOnCompanyId/:company_id', errorHandler(CompanyNewsController.getNewsOnCompanyId));
     app.get('/api/getNewsOnNewsId/:news_id', errorHandler(CompanyNewsController.getNewsOnNewsId));
     // Special case: company/stock
     app.get('/api/fetchInsiderData/:company_id', errorHandler(StockInsiderController.fetchInsiderTrades));


     ///////////  STOCK
     app.get('/api/stocks', errorHandler(StockController.list));
     app.post('/api/mapStocks/', errorHandler(StockController.mapStocksAndFinancials));
     app.get('/api/fetchAllStocks', errorHandler(StockController.fetchAllStocks));
     app.get('/api/fetchOnePageStocks', errorHandler(StockController.fetchOnePageStocks));
     app.get('/api/stock/:stock_id', errorHandler(StockController.fetch));
     app.get('/api/loadAllStocksForAutocompleteOnStartup', errorHandler(StockController.loadAllStocksForAutocompleteOnStartup));

     // Wait with implementing errorHandler until we
     // decided how to refactor the function getPrices
     app.get('/api/prices/:stock_id', StockController.getPrices);



     ///////////  STOCK CHART
     app.get('/api/chartNews/:stock_id', errorHandler(StockChartController.fetchChartNews));
     app.get('/api/chartInsiders/:stock_id', errorHandler(StockChartController.fetchChartInsiders));
     app.get('/api/chartEarningsDates/:stock_id', errorHandler(StockChartController.fetchChartEarningsDates));



     app.get('/api/stockExchanges', errorHandler(StockExchangeController.fetchStockExchanges));

     app.get('/api/fetchSector_name/:sector_id', errorHandler(SectorController.fetchSector_name));
     app.get('/api/fetchSectorsTree', errorHandler(SectorController.fetchSectorsTree));
     app.get('/api/getAllSectors', errorHandler(SectorController.getAllSectors));


     // app.post('/api/screenResults/', StockController.screenResults);
     app.get('/api/competitions', errorHandler(CompetitionController.getCompetitions));
     app.get('/api/userCompetitions/:user_id', errorHandler(CompetitionController.getUserCompetitions));
     app.get('/api/notifications/:user_id', errorHandler(NotificationController.getNotifications));


     // Backoffice
     app.get('/api/backoffice-company-data', errorHandler(BackofficeController.getCompanyDataDump));
     app.get('/api/report-from-millistream/:company_id/:period', errorHandler(BackofficeController.getReportFromMillistream));
     app.get('/api/missing-reports', errorHandler(BackofficeController.getMissingReports));
     app.get('/api/healthCheck', errorHandler(BackofficeController.healthCheck));
     app.get('/api/backoffice-company-calendars', errorHandler(BackofficeController.getCompanyCalendars));
     app.get('/api/check-millistream-calendars', errorHandler(BackofficeController.checkMillistreamCalendars));
     app.get('/api/getActivePdf/:pdf', errorHandler(CompanyReportController.getActivePdf));
     app.post('/api/getActiveAnalystPdf', errorHandler(CompanyReportController.getActiveAnalystPdf));


     // Wait with implementing errorHandler until we
     // decided how to refactor the function ingestFiles
     app.get('/textract/ingest', TextractController.ingestFiles);



     /// FOR REVIEW
     app.get('/api/chartUserAnnotations/:stock_id', errorHandler(StockChartController.fetchChartUserAnnotations));
     app.get('/api/chartUserTrades/:stock_id', errorHandler(StockChartController.fetchChartUserTrades));

     app.get('/api/exchange_rates', SysExchangeRateController.getExchangeRates);


 }

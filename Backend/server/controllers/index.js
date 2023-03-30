const UserController = require('./UserController');
const UserSettingsController = require('./UserSettingsController');
const UserResearchController = require('./UserResearchController');
const UserChartLinesController = require('./UserChartLinesController');
const UserTradePlanController = require('./UserTradePlanController');
const UserTradeController = require('./UserTradeController');
const UserDiaryController = require('./UserDiaryController');
const UserScreenController = require('./UserScreenController');
const UserTxController = require('./UserTxController');
const UserWatchlistController = require('./UserWatchlistController');
const FroalaController = require('./FroalaController');
const UserFunController = require('./UserFunController'); // TODO: ??
const UserPortfolioPlanController = require('./UserPortfolioPlanController');

const CompanyController = require('./CompanyController');
const CompanyReportController = require('./CompanyReportController');
const CompanyReportFinancialsController = require('./CompanyReportFinancialsController');
const CompanyAnalystsController = require('./CompanyAnalystsController');
const CompanyWebcastController = require('./CompanyWebcastController');

const StockController = require('./StockController');
const StockChartController = require('./StockChartController');
const StockInsiderController = require('./StockInsiderController');
const CompanyNewsController = require('./CompanyNewsController');
const StockExchangeController = require('./StockExchangeController');
const SectorController = require('./SectorController');

const TextractController = require('./TextractController');
const StripeController = require('./StripeController')
const BackofficeController = require('./BackofficeController');
const SearchController = require('./SearchController');

const UserAccountController = require('./UserAccountController');
const CompetitionController = require('./CompetitionController');
const NotificationController = require('./NotificationController');
const SysExchangeRateController = require('./SysExchangeRateController');




module.exports = {
    UserController,
    UserTxController,
    UserSettingsController,
    UserTradePlanController,
    UserTradeController,
    UserResearchController,
    UserChartLinesController,
    UserDiaryController,
    UserScreenController,
    UserWatchlistController,
    FroalaController,
    UserFunController,
    UserPortfolioPlanController,

    CompanyController,
    CompanyReportController,
    CompanyReportFinancialsController,
    CompanyNewsController,
    CompanyAnalystsController,
    CompanyWebcastController,

    StockController,
    StockChartController,
    StockInsiderController,
    SectorController,
    StockExchangeController,

    TextractController,
    StripeController,
    BackofficeController,
    SearchController,
    UserAccountController,
    CompetitionController,
    NotificationController,
    SysExchangeRateController,
}

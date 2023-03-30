import Vue from 'vue'
import VueRouter from 'vue-router'
import ForgotPassword from "../views/landing/ForgotPassword";
import { store } from './../stores/index.js';

const RapportKollen = () =>             import ('@/views/landing/RapportKollen');
const Application = () =>               import ('@/views/Application');
const NavigationTabs = () =>            import ('@/components/NavigationTabs');
const WatchlistSection = () =>          import ('@/components/WatchlistSection');
const StockSection = () =>              import ('@/views/stock/StockSection');
const ScreenerSection = () =>           import ('@/views/screener/Screener');
const backofficeUsers = () =>           import ('@/views/backoffice/BackofficeUsers');
const backofficeCompanies = () =>       import ('@/views/backoffice/BackofficeCompanies');
const logViewer = () =>                 import ('@/views/backoffice/LogViewer');
const vuexViewer = () =>                import ('@/views/backoffice/VuexViewer');
const Dashboard = () =>                 import ('@/views/dashboard/Dashboard');
const TextSearch = () =>                import ('@/views/textsearch/TextSearch');
const Research = () =>                  import ('@/views/research/Research');
const News = () =>                      import ('@/views/news/News');
const Plan = () =>                      import ('@/views/portfolio/Plan');
const Positions = () =>                 import ('@/views/portfolio/Positions');
const Performance = () =>               import ('@/views/portfolio/Performance');
const TransactionTabs = () =>           import ('@/views/portfolio/TransactionTabs');
const CompetitonOverview = () =>       import ('@/views/competitions/OverviewView');

Vue.use(VueRouter);

const sub_routes = (prop) => [
    {
        path: 'stock/:stock_id',
        name: prop + '.stock-detail',
        component: StockSection
    }, {
        path: 'watchlist',
        name: prop + '.watchlist',
        component: WatchlistSection
    }, {
        path: 'watchlist/:id',
        name: prop + '.watchlist-detail',
        component: WatchlistSection
    }, {
        path: 'screener',
        name: prop + '.screener',
        component: ScreenerSection
    }, {
        path: 'screener/:id',
        name: prop + '.screener-detail',
        component: ScreenerSection
    }, {
        path: 'backofficeUsers',
        name: prop + '.backofficeUsers',
        component: backofficeUsers
    }, {
        path: 'backofficeCompanies',
        name: prop + '.backofficeCompanies',
        component: backofficeCompanies
    }, {
        path: 'vuexViewer',
        name: prop + '.vuexViewer',
        component: vuexViewer
    }, {
        path: 'logViewer',
        name: prop + '.logViewer',
        component: logViewer
    }, {
        path: 'dashboard',
        name: prop + '.dashboard',
        component: Dashboard
    }, {
        path: 'textSearch',
        name: prop + '.textSearch',
        component: TextSearch
    }, {
        path: 'research',
        name: prop + '.research',
        component: Research
    }, {
        path: 'news',
        name: prop + '.news',
        component: News
    }, {
        path: 'plan',
        name: prop + '.plan',
        component: Plan
    }, {
        path: 'transactionTabs',
        name: prop + '.transactionTabs',
        component: TransactionTabs
    }, {
        path: 'positions',
        name: prop + '.positions',
        component: Positions
    }, {
        path: 'performance',
        name: prop + '.performance',
        component: Performance

    }, {
        path: 'competition/plan/:competition_id',
        name: prop + '.competitionPlan',
        component: CompetitonOverview
    }, {
        path: 'competition/transactions/:competition_id',
        name: prop + '.competitionTransactions',
        component: TransactionTabs
    }, {
        path: 'competition/positions/:competition_id',
        name: prop + '.competitionPositions',
        component: Positions
    }, {
        path: 'competition/performance/:competition_id',
        name: prop + '.competitionPerformance',
        component: Performance
    }
];


const routes = [{
        path: '/rapportkollen',
        name: 'landing-page',
        meta: { main: true },
        component: Application,
        children: sub_routes('landing-page')
    },
    {
        path: '/',
        name: 'login',
        component: RapportKollen
    },
    {
        path: '/login',
        name: 'login',
        component: RapportKollen
    },
    {
        path: '/register',
        name: 'register',
        component: RapportKollen
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: ForgotPassword
    },
	{
        path: '/:short_code',
        name: 'Competitions',
        component: RapportKollen
	},
];

const router = new VueRouter({
    mode: 'history',
    base: '/',
    routes
});


router.beforeEach((to, from, next) => {

    if (!!to.params.stock_id) {
        store.dispatch('addStockToRecents', to.params.stock_id);
    }

    if (to.meta.main) {
        next('/rapportkollen/watchlist');
    }
    next();
})
export default router;

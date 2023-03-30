import ApiService from "../../Services/ApiService";
import _ from 'lodash';

let months = [
{month: "2021-06", monthName: 'June', monthNumber: 6, count:0},
{month: "2021-07", monthName: 'July', monthNumber: 7, count:0},
{month: "2021-08", monthName: 'Aug.', monthNumber: 8, count:0},
{month: "2021-09", monthName: 'Sept', monthNumber: 9, count:0},
{month: "2021-10", monthName: 'Oct.', monthNumber:10, count:0},
{month: "2021-11", monthName: 'Nov.', monthNumber:11, count:0},
{month: "2021-12", monthName: 'Dec.', monthNumber:12, count:0},
];

export default {
    state: {
        userTrades: []
    },

    getters: {
        getUserTrades(state) {
            return state.userTrades;
        },
        getTrade(state) { // poorly named getter
            return state.userTrades;
        },

        monthlyPerformance(state) {
            let mp = state.userTrades.filter( t => {
                return t.exit_date !== null
            });
            let mp2 = mp.map( t => {
                return {
                    month: t.exit_date.substr(0,7),
                    pnl: t.pnl,
                }
            });
            const balance = 5000;

            const grouped = _(mp2)
                .groupBy('month')
                .map((value, key) => {
                    const pnl = _.sumBy(value, 'pnl');
                    return {
                        month: key,
                        wins: _.sumBy(value, a => {return a.pnl > 0})+0,  // strange hack to count, +0 to cast boolean
                        losses: _.sumBy(value, a => {return a.pnl < 0})+0,  // strange hack to count
                        pnl: pnl,
                        max_win: Math.max( ... value.map(a => {return a.pnl})),
                        max_loss: Math.min( ... value.map(a => {return a.pnl})),
                        pnl_pct: (( pnl / balance )*100).toFixed(1),
                    }
                })
                .value();

            return _.orderBy(grouped, ['month'], ['desc']);
        },
/*


        wins / losses  11 / 3           -100...        78...100      11/14 * 100 = 78 of 100
        avg win = 160
        avg loss = -80                   160 + abs(-80) = 240    160 / 240 *100  = 66 of 100
 */
        kelly2d(state) {
            let mp = state.userTrades.filter( t => {
                return t.exit_date !== null
            });

            const arrayOfPnL = mp.map(a => { return a.pnl});
            const x = Math.round(arrayOfPnL.reduce((a,b) => a + b, 0) / arrayOfPnL.length );
            console.log( x );


            const kelly =  {
                        wins: 10,
                        losses: 3,
                        avg_win: x,
                        avg_loss: 50, //Math.avg( ... trade.map(a => {return a.pnl})),
                    };

            console.log('kelly ',kelly);
            const win_loss_ratio = Math.round((kelly.wins / ( kelly.wins + Math.abs(kelly.losses))) * 100);
            const win_loss_size = Math.round( (kelly.avg_win / (kelly.avg_win + Math.abs(kelly.avg_win))) * 100) ;

            const kelly_stats = [{win_loss_ratio,  win_loss_size}];
            console.log(kelly_stats);
            return kelly_stats;   //   range   -100 to 100  ,   -100 to 100
        },

        tradeHistory(state) {
            return state.userTrades;
        },

    },

    mutations: {
        setTradeHistory(state, userTrades) {
            state.userTrades = userTrades;
        },
        setTrade(state, payload) {
            state.trades = payload;
        },

        setUserTrades(state, userTrades) {
            state.userTrades = userTrades;
        },

        removeTradeHistory(state, userTradeId) {
            state.userTrades = state.userTrades.filter(item => item.trade_id != userTradeId);
        },

        addTradeHistory(state, userTrade) {
            state.userTrades.push(userTrade);
        }
    },

    actions: {
        async loadUserTradeHistory({commit}, user_id) {
            const userTrades = await ApiService.getUserTrades(user_id);
            commit("setTradeHistory", userTrades);
        },

        async loadTrade({commit, rootState}, user_id) {
            this.loadTrades(user_id);
        },

        async loadTrades({commit, rootState}, user_id) {
            const trades = await ApiService.getUserTrades(user_id);
            commit("setUserTrades", trades);
        },
        async saveTrade({commit, rootState}, data) {
            const responseMain = await ApiService.updateArrayOfUserTrades(data);
            const response = await ApiService.getUserTrades(responseMain.user_id);
            commit("setTrade", response);
            return responseMain;
        }
    },
};

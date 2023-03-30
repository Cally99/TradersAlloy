export default {
    state: {
        chartInsider: {
        name: "Insider Trades",
        type: "InsiderTrades",
        data: [],
        settings: {
            display: true
        }
    },
    },
    getters: {
        getChartInsider(state) {
            return state.chartInsider;
        },
    },
  
    mutations: {
        setChartInsider(state, payload) {
            var now = new Date().getTime();
            var volume = 0;
            if (payload.length == 0) {
                state.chartInsider.data = [];
            } else {
                payload = payload.sort((a, b) => a.transaction_timestamp - b.transaction_timestamp);
                payload.map((item, i) => {
                    if (item.volumne !== undefined && item.volumne !== null) {
                        volume += item.volumne;
                    }
                    if (payload.length == i + 1) {
                        if (now >= item.transaction_timestamp) {
                            state.chartInsider.data.push([
                                item.transaction_timestamp * 1000, now, volume
                            ]);
                        }
                    } else {
                        state.chartInsider.data.push(
                            [item.transaction_timestamp * 1000, payload[i + 1].transaction_timestamp * 1000, volume]
                        );
                    }
                });
            }
        },
    },
  
    actions: {},
  };
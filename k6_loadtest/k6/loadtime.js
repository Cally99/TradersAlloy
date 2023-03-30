import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '20s', target: 10 },
    { duration: '20s', target: 15 },
  ],
};

export default function () {
  const url = 'https://dev-backend.tradersalloy.com/api/user/login';
  const payload = JSON.stringify({
    email: 'yunayamda3@gmail.com',
    password: 'asdfasdf',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, { 'status was 200': (r) => r.status == 200 });

  if(res.status == 200) {
    const login_data = JSON.parse(res.body);

    http.get('https://dev-backend.tradersalloy.com/api/fetchEarningsDateNext');
    http.get('https://dev-backend.tradersalloy.com/api/diaryItems/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/selectUserTradePlans/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/fetchResearchData/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/loadWLColumns/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/watchlistitems/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/competitions');
    http.get('https://dev-backend.tradersalloy.com/api/getNews50');
    http.get('https://dev-backend.tradersalloy.com/api/watchlists/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/watchlistJoins/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/fetchMinimizedCompanies');
    http.get('https://dev-backend.tradersalloy.com/api/fetchSectorsTree');
    http.get('https://dev-backend.tradersalloy.com/api/screens/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/stockExchanges');
    http.get('https://dev-backend.tradersalloy.com/api/loadAllStocksForAutocompleteOnStartup');
    http.get('https://dev-backend.tradersalloy.com/api/plan/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/fetchTx/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/getUserTrades/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/getUserAccounts/'+login_data.user_id);
    http.get('https://dev-backend.tradersalloy.com/api/getAllUserAccounts');
    http.get('https://dev-backend.tradersalloy.com/api/fetchMapFinancials');
    http.get('https://dev-backend.tradersalloy.com/api/fetchMapFinancialsYear');

  }
  
  sleep(1);
}
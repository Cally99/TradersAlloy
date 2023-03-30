import launcher from "k6/x/browser";
import { check, sleep } from 'k6';

// export const options = {
//     stages: [
//         { duration: '20s', target: 5 },
//         { duration: '20s', target: 10 },
//         { duration: '20s', target: 15 },
//     ],
// };

export default function() {
    const browser = launcher.launch('chromium', { headless: false });
    const context = browser.newContext();
    const page = context.newPage();
    page.goto('https://dev-frontend.tradersalloy.com/');

    page.$('input[name="email"]').type('yunayamda3@gmail.com');
    page.$('input[name="userpassword"]').type('asdfasdf');
    page.$('#logginBtn').click();

    sleep(10);
    check(page, {
        stock: (p) => p.$('.ag-center-cols-container .ag-row.ag-row-level-0') != null
    });
    page.screenshot({ path: `watchlist.png` });

    page.$('[id*="stock-"]').click();
    sleep(2);
    check(page, {
        tabbar_exist: (p) => p.$('.v-tabs') != null
    });
    page.screenshot({ path: `stock.png` });

    page.close();
    browser.close();
}


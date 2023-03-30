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

    page.$('[id*="stock-"]').click();
    sleep(3);
    check(page, {
        tabbar_exist: (p) => p.$('.v-tabs') != null,
        subtab_exist: (p) => p.$('.stock-section.v-tab').length > 0
    });
    page.screenshot({ path: `stock.png` });

    page.click('.stock-section.v-tab >> nth=1').click();
    sleep(3);
    page.screenshot({ path: `investor_reports.png` });

    page.click('.stock-section.v-tab >> nth=2').click();
    sleep(3);
    page.screenshot({ path: `chart.png` });

    page.close();
    browser.close();
}


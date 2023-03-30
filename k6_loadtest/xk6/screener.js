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
    page.click('#logginBtn');

    sleep(10);

    page.$('#screener').click();
    sleep(5);

    console.log(page.$('button').length)
    page.screenshot({ path: `screener.png` });

    page.$('span.ticker.blue1').dblclick();
    sleep(5);
    page.screenshot({ path: `stock_overview.png` });

    page.close();
    browser.close();
}


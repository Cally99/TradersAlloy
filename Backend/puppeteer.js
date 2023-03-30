require('dotenv').config()
const StockReport = require('./server/models').StockReport;
const StockReportPDF = require('./server/models').StockReportPDF;
const Stock = require('./server/models').Stock;
var keyword = ''
const puppeteer = require('puppeteer');
let selector = '.calendar-app > .searchField > .ng-valid > .searchbox__searchbar > .ng-pristine';
let url = 'https://financialhearings.com/';

const Sequelize = require('sequelize');

let sequelize;

console.log(process.env.DB_username);
console.log(process.env.DB_password);
console.log(process.env.DB_database);
sequelize = new Sequelize(process.env.DB_database, process.env.DB_username, process.env.DB_password, {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    define: {
        timestamps: false, // We just do not need
        underscored: false, // use camelCase
        freezeTableName: true // do not make plural - Andrew must learn the Model and TABLE have identiocal names
    },
    // sync: { force: true },   // drops and inserts ALL the data ... too often COMMENT WHEN NOT NEEDED
});



var temp_data = [
    { isin: 'SE0011205459', name: 'Bones' },
    { isin: 'SE0005562014', name: 'Guide' },
    { isin: 'SE0001057910', name: 'Sotka' },
]

get_init()

function get_init() {
    sequelize.query(
            `SELECT  S."isin", S."ticker"
        FROM public.stock as S`, { nest: false, type: sequelize.QueryTypes.SELECT },
        )
        .then(async s => {
            console.log('!!!!!!!!!!!!!!! start !!!!!!!!!!!!!!!!!!!!', s.length)
            for (var i = 0; i < s.length; i++) {
                // var temp_object = {}
                // temp_object.isin = s[i].isin
                // temp_object.name = s[i].ticker.substring(0, 5);
                // await get_puppeteer(temp_object.name, temp_object.isin)
                await get_puppeteer('FIRE', '0000000000')
            }
        })
        .catch(error => console.log('SQL error'));

}

function get_data(array) {
    return new Promise((resolve, reject) => {
        getAll();
        resolve()
    })
}



// const getAll = async () => {
//     for (var k=0; k<temp_data.length; k++) {
//         keyword = temp_data[k].name
//         await get_test(keyword, temp_data[k].isin)
//     }
//     console.log('!!!!!!!!!!!!!!! end !!!!!!!!!!!!!!!!!!!!')
// }

// getAll();

function get_puppeteer(keyword, isin) {
    return new Promise((resolve, reject) => {
        (async() => {
            console.log('####################', keyword)
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);
            await page.goto(url, { waitUntil: 'networkidle2' });
            await page.focus(selector)
            page.keyboard.type(keyword)
            await page.click(selector)
            await page.waitFor(4000)

            let array = await page.evaluate(() => {
                let sounds_array = document.getElementsByClassName('event-calendar event-calendar--library')[0].children
                let hotels = [];
                for (var i = 0; i < sounds_array.length; i++) {
                    let hotelJson = {};
                    if (sounds_array[i].querySelector('a[href].ng-binding[target=_blank]')) {
                        var dummy_data = sounds_array[i].getElementsByClassName('event__title ng-binding')[0].innerText
                        var quarter_temp = dummy_data.slice(dummy_data.length - 8)
                        var year_data = parseInt(quarter_temp.slice(quarter_temp.length - 4))
                        var quarter_data = quarter_temp.substring(0, 2)
                        if (year_data >= 2017) {
                            if (quarter_data == 'Q1' || quarter_data == 'Q2' || quarter_data == 'Q3' || quarter_data == 'Q4') {
                                hotelJson.title = year_data.toString() + '-' + quarter_data
                                hotelJson.link = sounds_array[i].querySelector('a[href].ng-binding[target=_blank]').innerHTML
                                hotels.push(hotelJson);
                            } else {
                                hotelJson.title = year_data.toString()
                                hotelJson.link = sounds_array[i].querySelector('a[href].ng-binding[target=_blank]').innerHTML
                                hotels.push(hotelJson);
                            }
                        }
                    }
                }
                return hotels;
            });
            // await browser.close();
            console.log('######### hotels ###########', array, isin)
                // if (array.length == 0) {
                //     await updateEmpty_SRP(isin)
                // } else {
                //     for (var x=0; x<array.length; x++) (
                //         await update_SRP(array[x], isin)
                //     )
                // }
            resolve()
        })();
    })
}





function update_SRP(data, isin) {
    console.log('######### Update Audio ###########', data, isin)
    return new Promise((resolve, reject) => {
        StockReportPDF.update({
                audio: data.link
            }, {
                where: { isin: isin, period: data.title }
            })
            .then(response => {
                console.log('updated StockReportPDF table')
                resolve();
            })
            .catch((error) => console.log('failed to update StockReportPDF table'));
    })
}

function updateEmpty_SRP(isin) {
    console.log('######### Update Null ###########', isin)
    return new Promise((resolve, reject) => {
        StockReportPDF.update({
                audio: 'scrapped'
            }, {
                where: { isin: isin }
            })
            .then(response => {
                console.log('updated StockReportPDF table')
                resolve();
            })
            .catch((error) => console.log('failed to update StockReportPDF table'));
    })
}



// const puppeteer = require('puppeteer');
// var keyword = 'Bones'
// let selector = '.calendar-app > .searchField > .ng-valid > .searchbox__searchbar > .ng-pristine';
// let url = 'https://financialhearings.com/';
// (async () => {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();
//     await page.goto(url, {waitUntil: 'networkidle2'});
//     await page.focus(selector)
//     page.keyboard.type(keyword)
//     await page.click(selector)
//     await page.waitFor(4000)

//     let soundsData = await page.evaluate(() => {
//         let hotels = [];
//         let sounds_array = document.getElementsByClassName('event-calendar event-calendar--library')[0].children

//         for (var i=0; i<sounds_array.length; i++) {
//             let hotelJson = {};
//             hotelJson.title= sounds_array[i].getElementsByClassName('event__title ng-binding')[0].innerText
//             hotelJson.link = sounds_array[i].querySelector('a[href].ng-binding[target=_blank]').innerHTML
//             hotels.push(hotelJson);
//         }
//         return hotels;
//     });

//     console.log('+++++++++++++',soundsData);
// })();
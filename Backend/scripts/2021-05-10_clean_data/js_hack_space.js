

console.log('----------------');


const reportDates = [
    {period:'2021-Q1', company_id: 111, pdf_link: 'keep me'},
    {period:'2020-Q4', company_id: 111, pdf_link: 'remove me'},
    {period:'2020-Q3', company_id: 111, pdf_link: 'remove me'},
    {period:'2020-Q2', company_id: 111, pdf_link: 'keep me'},
    {period:'2020-Q1', company_id: 111, pdf_link: 'keep me'},
];

const companyCalendar = [
    {period:'2020-Q4', company_id: 111, pdf_link: 'remove me'},
    {period:'2020-Q3', company_id: 111, pdf_link: 'remove me'},
];




////////////////////
function removeDuplicates(millistreamArray, databaseArray) {
    let insertDates = [];
    alreadyExistsDoNotAdd:
    for (r of millistreamArray) {
        for (cc of databaseArray) {
            if (r.period === cc.period) {
                continue alreadyExistsDoNotAdd;
            }
        }
        insertDates.push(r);
    }
    // console.log(insertDates);
    return insertDates;
}

const insertEvents = removeDuplicates(reportDates, companyCalendar);
console.log(insertEvents);


/*const companies = companyManager.list();
for (c of companies) {
    const millistreamArray = millistreamManager.getCalendar(c.company_id);
    const databaseArray = companyCalendarManager.getEvents(c.company_id);
    const insertEvents = removeDuplicates(millistreamArray, databaseArray);

    companyCalendarManager.bulkUpdate(insertEvents)

// bulk update
}
//filterObject(reportDates, "period", "2020-Q4");
//filterObject(reportDates, "period", "2020-Q3");



//console.log(reportDates);


console.log('----------------');

/*

const dates = [
    '2019/06/01',
    '2018/06/01',
    '2019/09/01', // This is the most recent date, but how to find it?
    '2018/09/01'
].map(v => new Date(v));
const maxDate = dates.reduce((max, d) => d > max ? d : max, dates[0]);
console.log(maxDate);



console.log('----------------');

const reportDates1 = [
    {date_report:'2020-Q4', pdf_link: 'old_link'},
    {date_report:'2021-Q1', pdf_link: 'lastest_link'},
    {date_report:'2020-Q3', pdf_link: 'old_link'},
    {date_report:'2020-Q2', pdf_link: 'old_link'},
    {date_report:'2020-Q1', pdf_link: 'old_link'},
];

this_last_report = reportDates1.reduce(
    (rMax, rCurrent) => {
        return (rCurrent.date_report > rMax.date_report ? rCurrent : rMax);
    }, reportDates1[0] );



console.log("this_last_report");
console.log(this_last_report);
console.log('----------------');

*/

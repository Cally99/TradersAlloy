
/**
 * Returns DEV, TEST or PROD depending on the .env entries
 *
 * */
exports.getPlatform = function() {
    const platforms = [
        {server_addr: 'http://localhost', platform: "DEV"},
        {server_addr: 'https://dev-frontend.tradersalloy.com', platform: "TEST"},
        {server_addr: 'https://app.tradersalloy.com', platform: "PROD"}
    ];
    const platform = platforms.find(p =>  p.server_addr == process.env.SERVER_ADDR).platform || 'DEV' ;
    return platform;

}


exports.formatMillions = function(x) {
    if(x < 1000000) {
        return (new Intl.NumberFormat('sv-SE').format((x).toFixed(0) ));
    } else {
        return (new Intl.NumberFormat('sv-SE').format((x/1000000).toFixed(0) )) + " M";
    }
}


// WHERE to put this so it can be used everywhere in the application ?
Date.prototype.getWeekOfYear = function() {
    let date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}


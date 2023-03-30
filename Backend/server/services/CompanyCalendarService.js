const CompanyCalendar = require('../models').CompanyCalendar;
const companyCalendarManager = require('../managers/CompanyCalendarManager');

module.exports = {

    async getCompanyCalendars() {
        return await companyCalendarManager.getCompanyCalendars();
    }
    
}


/**
 *
*/


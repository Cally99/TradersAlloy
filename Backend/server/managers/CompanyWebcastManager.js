const CompanyWebcast = require('../models').CompanyWebcast;

module.exports = {
    async insertOneWebcast(data) {
        return await CompanyWebcast.create(data);
    },

    async list() {
        return await CompanyWebcast.findAll();
    },

    async getOneCompanyWebcast(company_id) {
        return await CompanyWebcast.findAll({ where: { company_id } });
    },
};
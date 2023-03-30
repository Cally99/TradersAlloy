const Sector = require('../models').StockExchangeSector;
const Stock = require('../models').Stock;

const log4js = require('log4js');
const healthCheck = log4js.getLogger("health");


module.exports = {

    async list() {
        return await Sector.all();
    },

    async fetchSector_name(sector_id) {
        return await Sector.findByPk(sector_id);
    },

    async fetchSectorsTree2() {
        return await Sector.findAll({
            attributes: [['sector_id', 'id'], ['parent_sector_id', 'parentid'], ['sector_name', 'name'] ],
            order: [['parent_sector_id', 'ASC' ]]});
    },

    /** Includes the leaf nodes (stocks)
     *
     * */
    async fetchSectorsTree() {
        try {
            const tree = await Sector.findAll({
                attributes: [['sector_id', 'id'], ['parent_sector_id', 'parentid'], ['sector_name', 'name'] ],
                include: [ {model: Stock, as: 'children', attributes: ['stock_id', ['sector_id', 'parentid'], 'name', ['ticker', 'ticker']  ]} ],
                order: [['parent_sector_id', 'ASC' ]],
            });
            return tree;
        } catch(error) {
            console.log(error.message);
        }
    },

    async getAllSectors() {
        return await Sector.all();
    }

};

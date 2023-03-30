const sectorService = require("../services/SectorService");
const log4js = require('log4js');
const logger = log4js.getLogger("app_log");

module.exports = {
    async list(req, res) {
        const sectors = await sectorService.list();
        res.status(200).send(sectors);
    },

    async fetchSector_name(req, res) {
        const sector = await sectorService.fetchSector_name(req.params.sector_id);
        res.status(200).send(sector);
    },

    async fetchSectorsTree(req, res) {
        const sectors = await sectorService.fetchSectorsTree();
        res.status(200).send(sectors);
    },

    async fetchSectorsTreeLeaves(req, res) {
        const sectors = await sectorService.fetchSectorsTree();
        res.status(200).send(sectors);
    },

    async getAllSectors(req, res) {
        const sectors = await sectorService.getAllSectors();
        res.status(200).send(sectors);
    }


};

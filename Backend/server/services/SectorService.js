const sectorManager = require("../managers/SectorManager.js");

module.exports = {

  async list(req, res) {
    return await sectorManager.list();
  },

  async fetchSector_name(sector_id) {
    return await sectorManager.fetchSector_name(sector_id);
  },

  async fetchSectorsTree() {
    return await sectorManager.fetchSectorsTree();
  },

  async fetchSectorsTreeLeaves() {
    return await sectorManager.fetchSectorsTreeLeaves();
  },

  async getAllSectors() {
    return await sectorManager.getAllSectors();
  }

};


module.exports = (db, DataTypes) => {
    const CompanyIR = db.define('CompanyIR', {
            company_id: {
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            ir_page : DataTypes.TEXT,
            calendar_page : DataTypes.TEXT,
            reports_page : DataTypes.TEXT,
            reports_page_html : DataTypes.TEXT,
            reports_page_pdf_links : DataTypes.TEXT,
        },
        {tableName: 'company_ir'}
    );

    // CompanyIR.sync();

    return CompanyIR;
};

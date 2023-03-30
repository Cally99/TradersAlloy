module.exports = {
    getActualFoundReports(company, report) {
        return {
            company_id: company.company_id,
            period: company.period,
            currency: report.currency,
            price: company.price_today,
            date_report: company.date_report,
            type_report: company.type_report,
            eps: report.eps,
            sales: report.sales,
            profit: report.np,
            pe: report.pe,
            ps: report.ps,
            gp: report.gp,
            ebitda: report.ebitda,
            ebit: report.ebit,
            ptp: report.ptp,
            intangibleasset: report.intangibleasset,
            fixedasset: report.fixedasset,
            financialasset: report.financialasset,
            noncurrentasset: report.noncurrentasset,
            cce: report.cce,
            currentassets: report.currentassets,
            totalassets: report.totalassets,
            shequity: report.shequity,
            ltliabilities: report.ltliabilities,
            curliabilities: report.curliabilities,
            totalnumberofshares: report.totalnumberofshares,
            pdf_link: report.eventlink,
            pdf_language: report.eventlinklanguages,
        };
    },

    checkIfValuesInsertedInCompany(company_id, date_report, eps, sales, market_cap) {
        return {
            company_id: company_id,
            most_relevant_earnings_date: date_report,
            most_relevant_eps: eps,
            most_relevant_sales: sales,
            market_cap: market_cap
        };
    }
}

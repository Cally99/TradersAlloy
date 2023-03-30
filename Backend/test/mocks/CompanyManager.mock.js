

/** get the price according to the currency for a single stock
 *
 * example: small set of companies reporting 'recently'
 * */
exports.getCompaniesReportingNow = () => {
    return [{
            company_id:  39502  , // Nokia
            period: '2020-Q3',
            date_report: '2021-01-21',
            type_report: 3,
        },{
            company_id:  32875  ,// Avanza
            period: '2020-Q3',
            date_report: '2021-01-21',
            type_report: 3,
        },{
            company_id:  32395   ,// Sandvik
            period: '2020-Q3'   ,
            date_report:  '2021-01-21' ,
            type_report: 3,
        },
    ];
};

/**
 * */
exports.getCompaniesReportingNow_NOKIA = () => {
    return [{
            company_id:  39502  ,// Nokia
            period: '2020-Q3',
            date_report: '2021-01-21',
            type_report: 3,
        }
    ];
};

/**
 * */
exports.getCompaniesReportingNow_SAND = () => {
    return [{
            company_id:  32395   , // Sandvik
            period: '2020-Q3'   ,
            date_report:  '2021-01-21' ,
            type_report: 3,
        }
    ];
};

/**
 * */
exports.getCompaniesReportingNow_AZA = () => {
    return [{
            company_id:  32875  ,// Avanza
            period: '2020-Q3',
            date_report: '2021-01-21',
            type_report: 3,
        }
    ];
};

exports.list = () => {
    return [{
            company_id: '39502',
            name: 'Nokia Corporation',// Nokia
            description: 'Nokia Corporation engages in the network and technology businesses worldwide. The company operates in four segments: Ultra Broadband Networks, Global Services, IP Networks and Applications, and Nokia Technologies. It focuses on mobile radio including macro radio, small cells, and cloud native radio solutions for communications service providers and enterprises; and provides network planning and optimization, network implementation, and systems integration, as well as company-wide managed services. The company also offers fixed networking solutions, such as copper and fiber access products, solutions, and services. In addition, it provides network infrastructure and professional services for mobile networks; and managed services for the fixed, mobile, Internet protocol (IP), and optical domains. Further, the company offers network planning, implementation, operation, and maintenance services. Additionally, it provides IP/optical networking solutions, including IP routing and optical transport systems, software, and services; software solutions, such as customer experience management, network operations and management, communications and collaborations, policy and charging, as well as Cloud, IoT, security, and analytics platforms; and submarine networks and radio frequency systems. The company has a strategic collaboration with Microsoft. Nokia Corporation was founded in 1865 and is headquartered in Espoo, Finland.',
            market_cap: '183353560000',
            last_report_date: '2020-04-09',
            last_eps_ttm: 0.0344,
            last_sales: 5294000000
        },{
            company_id: '32395',
            name: 'Sandvik',   // Sandvik
            description: 'Sandvik AB (publ) operates as an engineering company in the areas of mining and rock excavation, metal cutting, and materials technology worldwide. The company offers metal-cutting tools and tooling systems, including boring, drilling, milling, reaming, and turning tools, as well as tailor made tools and inserts, and tooling systems. It also provides mining and rock excavation equipment and tools, such as stationary and mobile crushers and screens, underground drill rigs and bolters, surface drill rigs, exploration drill rigs and tools, underground loaders and trucks, mechanical cutting equipment, rock tools and drills, mining automation systems, and parts and services, as well as breakers, demolition tools, and booms. In addition, the company offers stainless steels, special alloys, and titanium products comprising bar and hollow bars, billets and blooms, controlled expansion alloy products, hot isostatic pressed products, metal powders, plates and sheets, strip steels, and wire products, as well as tubes, pipes, fittings, and flanges; and technical services related to stainless steels and special alloys. Further, it offers advisory services for the additive manufacturing, additive manufacturing services, and powders for additive manufacturing; and diffusion furnaces, and furnace products and heating materials. The company serves aerospace, automotive, construction, general engineering, mining, nuclear power generation, oil and gas, process, and renewable energy industries. Sandvik AB (publ) was founded in 1862 and is headquartered in Stockholm, Sweden.',
            market_cap: '2674953057280',
            last_report_date: '2020-04-09',
            last_eps_ttm: 24.87436,
            last_sales: 197421000000
        },{
            company_id: '32875',
            name: 'Avanza Bank Holding', // Avanza
            description: 'Avanza Bank Holding AB (publ), together with its subsidiaries, provides online stock trading services in Sweden. The company offers share and fund, investment savings, endowment insurance, endowment child insurance, external deposit, and pension insurance savings accounts, as well as occupational pensions and individual pension plans. It also trades in equities, funds, and other securities; and provides external and green mortgages, private banking mortgages, and margin loans and lending products. In addition, the company offers decision support services; and publishes topical news and independent advice on the financial Website, Placera, as well as on the weekly financial magazine, BÃ¶rsveckan. It primarily serves individual investors; and professional traders and corporate customers, such as entrepreneurs and asset managers. Avanza Bank Holding AB (publ) was founded in 1999 and is headquartered in Stockholm, Sweden.',
            market_cap: '378065638720',
            last_report_date: '2020-04-09',
            last_eps_ttm: 21.050400000000003,
            last_sales: 5644800000
        }
    ];
};

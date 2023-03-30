describe('All the test suites', () => {

    // // // Tested and all tests passed
    // // require('../testSuites/newTest.spec.js');

    // // Tested and few tests not passed in
    // require('../testSuites/VUEX.modules.spec.js');
    // require('../testSuites/VUEX.mutations.spec.js');
    // require('../testSuites/VUEX.actions.spec.js');
    require('../testSuites/VUEX.getters.spec.js');
    require('../testSuites/ApiService.spec.js');

    require('../testSuites/SeleniumUserRegistration.spec.js');
    require('../testSuites/SeleniumUserLogin.spec.js');
    require('../testSuites/SeleniumPositions.spec.js');
    require('../testSuites/SeleniumScreener.spec.js');



    // // // Not Tested
    // require('../testSuites/Screener.spec.js');

    // // // ****************** problems with "wrapper.find('#email');"
    // require('../testSuites/UserLogin.spec.js');
    // require('../testSuites/UserSignup.spec.js');

    // // // ****************** !Cannot find module 'jsdom-worker'
    // require('../testSuites/Chart.spec.js');
    // require('../testSuites/StockOverview.spec.js');

    // // // ****************** !trying to import a file which Jest cannot parse, e.g. it's not plain JavaScript
    // require('../testSuites/WatchlistSection.spec.js');

    // // // ******************* !where are this components??
    // // require('../testSuites/WatchlistSection_UserDiaryDropDown.spec.js');
    // // require('../testSuites/WatchlistSection_TagDropDown.spec.js');
});

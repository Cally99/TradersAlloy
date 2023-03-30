import Vue from 'vue';
import vuetify from '@/plugins/vuetify.js';
import "vuetify/dist/vuetify.min.css";
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import VueRouter from 'vue-router';
import i18n from '@/plugins/i18n';
import VueFroala from 'vue-froala-wysiwyg';
import App from './App.vue';
import RapportKollen from '@/views/landing/RapportKollen.vue';
import Application from '@/views/Application.vue';
import Trading from '@/views/Trading/TradingApp';
import Kelly2D from '@/views/portfolio/Kelly2D.vue';
import CanvasEPS from "./views/stock/CanvasEPS";
import Screen from "./components/SheetScreen.vue";
import { store } from "./stores/index.js";
import router from "./router";
import ApiService from '@/Services/ApiService.js';
import FroalaEditor from 'froala-editor';

import '@/assets/css/main.css';

// ag-grid license
import { LicenseManager } from "@ag-grid-enterprise/core";
LicenseManager.setLicenseKey(`CompanyName=TradersAlloy OU,LicensedApplication=Traders Alloy,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=1,AssetReference=AG-016916,ExpiryDate=27_July_2022_[v2]_MTY1ODg3NjQwMDAwMA==eb66012a2d4dc7e10055326814e63982`);

// Set h1 tag around selected text
FroalaEditor.DefineIcon('H1', { NAME: '<span style="font-size:18px; font-weight:normal; display:inline-block; padding-top:1px;">H1</span>', template: 'text' });
FroalaEditor.RegisterCommand('H1', {
    title: 'Header 1',
    focus: true,
    undo: true,
    icon: 'H1',
    refreshAfterCallback: true,
    callback() {
        const element = this.selection.blocks()[0];
        const txt = element.textContent;
        const elementName = element.tagName;
        const selectedText = this.selection.text();

        if (selectedText.length > 0) {
            this.html.insert(`<h1>${selectedText}</h1>`);
        } else if (elementName === 'H1') {
            element.remove();
            this.html.insert(txt);
        } else {
            element.remove();
            this.html.insert(`<h1>${txt}</h1>`);
        }
    }
});

// Set h2 tag around selected text
FroalaEditor.DefineIcon('H2', { NAME: '<span style="font-size:18px; font-weight:normal; display:inline-block; padding-top:1px;">H2</span>', template: 'text' });
FroalaEditor.RegisterCommand('H2', {
    title: 'Header 2',
    focus: true,
    undo: true,
    refreshAfterCallback: true,
    callback() {
        const element = this.selection.blocks()[0];
        const txt = element.textContent;
        const elementName = element.tagName;
        const selectedText = this.selection.text();

        if (selectedText.length > 0) {
            this.html.insert(`<h3>${selectedText}</h3>`);
        } else if (elementName === 'H3') {
            element.remove();
            this.html.insert(txt);
        } else {
            element.remove();
            this.html.insert(`<h3>${txt}</h3>`);
        }
    }
});

// Set highlight yellow background color around selected text
FroalaEditor.DefineIcon('highlight', { NAME: '<span class="mdi mdi-marker"></span>', template: 'text' });
FroalaEditor.RegisterCommand('highlight', {
    title: 'Highlight',
    focus: true,
    undo: true,
    refreshAfterCallback: true,
    callback() {
        const txt = this.selection.text();
        const element = this.selection.element();
        const backgroundColor = element.style.backgroundColor;

        if (txt.length > 0 && backgroundColor !== '') {
            this.html.insert(txt);
        } else if (txt.length > 0) {
            this.html.insert(`<span style="background-color: rgb(255, 255, 0);">${txt}</span>`);
        }
    }
});

// Set highlight yellow background color around selected text
FroalaEditor.DefineIcon('hr', { NAME: '<span class="mdi mdi-minus"></span>', template: 'text' });
FroalaEditor.RegisterCommand('hr', {
    title: 'Insert Horizontal Line',
    focus: true,
    undo: true,
    refreshAfterCallback: true,
    callback() {
        this.html.insert('<hr style="height:1px; border-width:0; color:gray; background-color:gray; margin:0 0 15px 0; padding:0;" />');
    }
});

require('froala-editor/js/froala_editor.pkgd.min.js');
require('froala-editor/js/plugins.pkgd.min.js');
require('froala-editor/css/froala_editor.pkgd.min.css');
require('froala-editor/css/froala_style.min.css');
require('froala-editor/js/plugins/colors.min.js');
require('froala-editor/css/plugins/colors.min.css');
require('froala-editor/js/plugins/font_size.min.js');
require('froala-editor/js/plugins/align.min.js');
require('froala-editor/js/plugins/font_family.min.js');
require('froala-editor/js/plugins/lists.min.js');
require('froala-editor/js/plugins/table.min.js');
require('froala-editor/js/plugins/image.min.js');
require('froala-editor/js/plugins/save.min.js');
require('froala-editor/js/plugins/paragraph_style.min.js');
require('froala-editor/js/plugins/code_view.min.js');
require('froala-editor/js/plugins/fullscreen.min.js');

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(VueFroala);

import VueIntercom from 'vue-intercom';
import axios from 'axios';
Vue.use(VueIntercom, {
    appId: 'q0r4rtur'
});

// const routes = {
//     '/': RapportKollen,
//     '/login': RapportKollen,
//     '/signup': RapportKollen,
//     '/invitation': RapportKollen,
//     '/signup': RapportKollen,
//     '/rapportkollen': Application,
//     '/app': Application,
//     '/forgot-password': ForgotPassword,

//     // internal / conveinence
//     '/trading': Trading,
//     '/v-chacheli': Chacheli,
//     '/canvas': CanvasEPS,
//     '/kelly': Kelly2D,
//     '/screen': Screen,
//     '/test': VueScripe,
// }

new Vue({
    i18n,
    vuetify,
    router,
    store,
    mounted: async function() {
        let location = await axios.get("https://geolocation-db.com/json/") // get the current location
        console.log('*********// your location //*************', location.data.country_code);
        if (localStorage.user && localStorage.user != "undefined") {
            const user = await ApiService.findUser(JSON.parse(localStorage.user).user_id);
            if (user) {
                let settings_data = JSON.parse(user.settings);

                if (settings_data.language) {
                    i18n.locale = settings_data.language;
                } else {
                    i18n.locale = 'sv';
                }

                this.$vuetify.theme.dark = settings_data.is_dark;
            }
        } else {
            if (location.data.country_code == "SE") {
                i18n.locale = 'sv';
            } else {
                i18n.locale = 'en';
            }
            this.$vuetify.theme.dark = false;
        }
    },
    render(h) {
        return h(App);
    }
}).$mount('#traderApp');

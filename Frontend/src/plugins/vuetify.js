import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css"; // Add this line
import colors from 'vuetify/lib/util/colors';
import Research from '@/components/customIcons/Research';
import Circle from '@/components/customIcons/Circle';
import RedIcon from '@/components/customIcons/RedIcon';
import ResearchNo from '@/components/customIcons/ResearchNo';
import ResearchNew from '@/components/customIcons/ResearchNew';
import ResearchNoNew from '@/components/customIcons/ResearchNoNew';
import BellActive from '@/components/customIcons/BellActive';
import BellAlarm from '@/components/customIcons/BellAlarm';
import BellNotAdded from '@/components/customIcons/BellNotAdded';
import BellExpired from '@/components/customIcons/BellExpired';
import PdfFile from '@/components/customIcons/PdfFile';
import PdfFileActive from '@/components/customIcons/PdfFileActive';
import TrashCan from '@/components/customIcons/TrashCan';
import Trophy from '@/components/customIcons/Trophy';
import Chart from '../components/customIcons/IconChart'


Vue.use(Vuetify);
const opts = {
  theme: {
    dark: false,
    themes: {
      light: {
        primary: '#3f51b5',
        secondary: colors.blueGrey.lighten5,
        accent: '#8c9eff',
        success: '#537f3b',
        info: '#4e6783',
        warning: '#ff7900',
        error: '#b71c1c',
        appTabs: '#b9c1c7',
        tradersAlloyBlue: '#316bd2', // --v-yourcustomvariablename-base ??
        grey1: '#e9edf0', // - for the menubar to the left
        grey2: '#C2CCD6',
        grey3: '#F9FAFB',
        grey4: '#F9FAFA',
        grey5: '#A3B3C2',
        grey6: '#F1F2F4',
        grey7: '#F0F2F5',
        grey8: '#859AAD',
        blue1: '#244360', // - for the ticker background
        blue2: '#4077AB',
        blue3: '#325D85',
        blue4: '#CBDCEB',
        blue5: '#E0E6EB',
        blue6: '#143452',
        blue7: '#94A6B8',
        blue8: '#E9EDF1', // - new background color for the menubar to the left
        blue9: '#F8FAFC',
        blue10: '#DEE6ED',
        blue11: '#173754',
        green1: '#009973',
        green2: '#25B19A',
        green3: '#2EB8A1',
        red1: '#E72929',
        red2: '#F0D5D5',
        surface: '#ECEFF1',
        stockTab: '#acc0c7',
        yellow1: '#FFFDE9',
      },
      dark: {
        primary: '#3f51b5',
        secondary: '#929ea4',
        accent: '#8c9eff',
        success: '#46a842',
        info: '#316bd2',
        warning: '#ffc158',
        error: '#b71c1c',
        appTabs: '#414447',
        // tradersAlloyBlue: '#121826',
        surface: '#374147',
        stockTab: '#f9f932',
      }
    },
  },
  options: {
    customProperties: true
  },
  icons: {
    iconfont: "mdi",
    values: {
      chart: {
        component: Chart
      },
      research: {
        component: Research
      },
      researchNo: {
        component: ResearchNo
      },
      circle: {
        component: Circle
      },
      redIcon: {
        component: RedIcon
      },
      researchNew: {
        component: ResearchNew
      },
      researchNoNew: {
        component: ResearchNoNew
      },
      bellActive: {
        component: BellActive
      },
      bellAlarm: {
        component: BellAlarm
      },
      bellNotAdded: {
        component: BellNotAdded
      },
      bellExpired: {
        component: BellExpired
      },
      pdfFile: {
        component: PdfFile
      },
      pdfFileActive: {
        component: PdfFileActive
      },
      trashCan: {
        component: TrashCan
      },
      trophy: {
        component: Trophy
      }
    }
  }
};

export default new Vuetify(opts);

// TODO: this.$vuetify.theme.dark = user.prefernece
// https://stackoverflow.com/questions/48280990/using-custom-theming-in-vuetify-and-pass-color-variables-to-components

/*
(moved from public/index.html ... what is this ?)
<!-- for vuetify -->
<!-- <link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' rel="stylesheet"> -->
    <!-- <script src="https://code.iconify.design/1/1.0.3/iconify.min.js"></script> -->
*/

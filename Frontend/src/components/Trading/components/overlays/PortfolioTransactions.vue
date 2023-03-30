<script>
import moment from 'moment';
import Overlay from "../../mixins/overlay.js";
import _ from 'lodash';

const helper = require('./../../../../util/helper');

export default {
  name: "PortfolioTransactions",
  mixins: [Overlay],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.1" };
    },
    draw(ctx) {
      let layout = this.$props.layout;
      let h = Math.floor(layout.height);

      let groupedTransactions = [];
      let txIds = [];

      for(const test of this.getPortfolioTransactionsChart) {
        const tempObject = this.getPortfolioTransactionsChart.filter((t) => t.tx_date === test.tx_date && t.price == test.price);

        if(!txIds.includes(test.tx_id)) {
          groupedTransactions.push(tempObject);
        }

        for(const o of tempObject) {
          txIds.push(o.tx_id);
        }
      }

      groupedTransactions = groupedTransactions.map((group) => {
        return _.orderBy(group, ['tx_type', 'tx_date'], ['asc', 'asc']);
      });

      for(let p of groupedTransactions) {
        let counter = 0;
        for(const one of p) {
          if(counter < 1) {
            const dateEposh = moment(one.tx_date).valueOf();
            const price = one.price;

            ctx.beginPath();
            let x = layout.t2screen(dateEposh);
            let y = layout.$2screen(price);

            if(one.tx_type === 'BUY') {
              ctx.fillStyle = '#008000';
            } else {
              ctx.fillStyle = '#e54150';
            }

            let countSell = 0;
            let countBuy = 0;

            for(const o of p) {
              if(o.tx_type === 'BUY') {
                countBuy++;
              } else {
                countSell++;
              }
            }

            if(countBuy > 0 && countSell > 0) {
              ctx.beginPath();
              ctx.fillStyle = '#008000';
              ctx.fillRect(x, y, 16, 8);

              ctx.beginPath();
              ctx.fillStyle = '#e54150';
              ctx.fillRect(x, y + 8, 16, 8);
            } else {
              ctx.fillRect(x, y, 16, 16);
            }

            ctx.stroke();
            let is_hover = this.hover(x, y);

            if (is_hover) {
              this.draw_label(ctx, x, y, p, ctx.fillStyle);
            }
          }
          counter++;
        }
      }
    },
    mousemove(event) {
      this.mouse.x = event.layerX;
      this.mouse.y = event.layerY;
    },
    hover(x, y) {
      return Math.abs(x - (this.mouse.x - 8)) < 8 && Math.abs(y - this.mouse.y + 8) < 8;
    },
    draw_label(ctx,x,y,p,fillStyle) {
      const table_height = 80 + (p.length * 40);
      let tbody = '';

      for(const one of p) {
        const account_name = this.$store.getters.getUserAccounts.find((a) => a.user_account_id === one.user_account_id).account_name;
        const color = (one.tx_type === 'BUY') ? '#439774' : '#D35258';

        tbody += `
          <tr style='color: ${color};'>
            <td style='padding:0 1rem;text-align:left;'>${one.tx_date}</td>
            <td style='padding:0 1rem;text-align:left;'>${one.tx_type}</td>
            <td style='padding:0 1rem;text-align:left;'>${helper.thousandFormatter(one.qty)}</td>
            <td style='padding:0 1rem;text-align:left;'>${helper.thousandFormatter(one.price)}</td>
            <td style='padding:0 1rem;text-align:left;'>${helper.thousandFormatter((one.qty * one.price))}</td>
            <td style='padding:0 1rem;text-align:left;'>${one.currency}</td>
            <td style='padding:0 1rem;text-align:left;'>${account_name}</td>
          </tr>
        `;
      }

      const data = `
        <svg xmlns='http://www.w3.org/2000/svg' width='720' height='${table_height}'>
          <foreignObject width='100%' height='100%'>
            <div xmlns='http://www.w3.org/1999/xhtml' style='font-size:12px; background:#F9FAFB; box-shadow:2px 2px 2px 1px rgba(0, 0, 0, 0.2);'>
              <table style='font-family: sans-serif; border:solid 1px #e0e6eb; width:100%; padding-bottom:5px;'>
                <tr>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Date')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Type')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Quantity')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Price')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Amount')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Currency')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('User_account')}</td>
                </tr>
                ${tbody}
              </table>
            </div>
          </foreignObject>
        </svg>
      `;

      const DOMURL = self.URL || self.webkitURL || self;
      const img = new Image();
      const svg = new Blob([data], {type: "image/svg+xml"});
      const url = DOMURL.createObjectURL(svg);

      img.addEventListener('load', function() {
        ctx.drawImage(img, 300, 50);
          DOMURL.revokeObjectURL(url);
      });

      img.src = url;
    },
    use_for() {
      return ["PortfolioTransactions"];
    },

  },
  // Define internal setting & constants here
  computed: {
    sett() {
      return this.$props.settings;
    },
    default_font() {
      return "12px " + this.$props.font.split("px").pop();
    },
    buy_color() {
      return "#2d81df";
    },
    sell_color() {
      return this.sett.sellColor || "#ec4662";
    },
    company_id() {
      return (this.$store.getters.getAllStocks.find((s) => s.stock_id === this.$route.params.stock_id)).company_id;
    },
    stock_id() {
      return (this.$store.getters.getAllStocks.find((s) => s.stock_id === this.$route.params.stock_id)).stock_id;
    },
    getPortfolioTransactionsChart() {
      return this.$store.getters.getTx.filter((tx) => (tx.tx_type === 'BUY' || tx.tx_type === 'SELL') && tx.stock_id === this.stock_id);
    }
  },
  data() {
      return {
        mouse: { x: undefined, y: undefined },
      }
  }
};
</script>

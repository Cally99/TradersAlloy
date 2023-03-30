<script>
import moment from 'moment';
import Overlay from "../../mixins/overlay.js";

const helper = require('./../../../../util/helper');

export default {
  name: "InsiderDot",
  mixins: [Overlay],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.1" };
    },
    draw(ctx) {
      let layout = this.$props.layout;
      let h = Math.floor(layout.height);

      for(let p of this.getInsiderDotChart) {
        ctx.beginPath();
        let x = layout.t2screen(p[0]);
        let y = layout.$2screen(p[1]);
        ctx.fillStyle = '#008000';

        if(p[2].find(item=> item[0] === true)) {
          ctx.fillStyle = '#e54150';
        }

        let countSell = 0;
        let countBuy = 0;

        for(const outer of p[2]) {
          for(const inner of outer) {
            if(inner === 'Avyttring') {
              countBuy++;
            } else if(inner === 'Förvärv') {
              countSell++;
            }
          }
        }

        if(countBuy > 0 && countSell > 0) {
          ctx.beginPath();
          ctx.fillStyle = '#008000';
          ctx.arc(x, y, 8, 0, Math.PI, true);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = '#e54150';
          ctx.arc(x, y, 8, 0, Math.PI, false);
          ctx.fill();
        } else {
          ctx.arc(x, y, 8, 0, Math.PI * 2, true);
          ctx.fill();
        }

        ctx.stroke();
        let is_hover = this.hover(x, y);

        if (is_hover) {
          this.draw_label(ctx, x, y , p ,ctx.fillStyle);
        }
      }
    },
    mousemove(event) {
      this.mouse.x = event.layerX;
      this.mouse.y = event.layerY;
    },
    hover(x, y) {
      return Math.abs(x - this.mouse.x) < 5 && Math.abs(y - this.mouse.y) < 5;
    },
    draw_label(ctx,x,y,p,fillStyle) {
      const transaction_date = moment(p[0]).format('YYYY-MM-DD');
      const table_height = 80 + p[2].length * 40;
      let tbody = '';

      for(const item of p[2]) {
        console.log(p[1]);
        const color =  item[0] ?  '#D35258' : '#439774';

        tbody += `
          <tr style='color: ${color};'>
            <td style='padding:0 1rem;text-align:left;border:0px solid;'>${transaction_date}</td>
            <td style='padding:0 1rem;text-align:left;border:0px solid;'>${item[2]}</td>
            <td style='padding:0 1rem;text-align:left;border:0px solid;'>${item[3]}</td>
            <td style='padding:0 1rem;text-align:left;border:0px solid;'><div style='max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>${item[4]}</div></td>
            <td style='padding:0 1rem;text-align:left;border:0px solid;'>${helper.thousandFormatter(item[5])}</td>
            <td style='padding:0 1rem;text-align:left;border:0px solid;'>${helper.thousandFormatter(item[6])}</td>
            <td style='padding:0 1rem;text-align:left;border:0px solid;'>${helper.thousandFormatter(item[7])}</td>
          </tr>
        `;
      }

      const data = `
        <svg xmlns='http://www.w3.org/2000/svg' width='720' height='${table_height}'>
          <foreignObject width='100%' height='100%'>
            <div xmlns='http://www.w3.org/1999/xhtml' style='font-size:12px; background:#F9FAFB; box-shadow:2px 2px 2px 1px rgba(0, 0, 0, 0.2);'>
              <table style='font-family: sans-serif; border:solid 1px #e0e6eb; width:100%; padding-bottom:5px;'>
                <tr>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Transaction_Date')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Type')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Person')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Title')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Volume')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Price')}</td>
                  <td style='padding:5px 1rem; font-weight:300;'>${this.$t('Value')}</td>
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
      return ["InsiderDot"];
    },

  },
  // Define internal setting & constants here
  computed: {
    sett() {
      return this.$props.settings;
    },
    default_font() {
      //console.log(this.$props.font.split('px').pop())
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
    getInsiderDotChart() {
      let insiderData = this.$store.getters["getInsiders"](this.company_id).insiders;
      let data = [];
      let index;

      insiderData.map((item) => {
        let transaction_nature = item.transaction_nature !== undefined && item.transaction_nature == "Avyttring";

        const value = item.qty_or_amount === 'Antal' ? (item.volume * item.price).toFixed(0) : item.volume;

        if (item.price !== undefined && item.price !== null && item.price > 0) {
          index = data.findIndex(
            (di) =>
              di[0] ==
                new Date(item.transaction_date).setUTCHours(0, 0, 0, 0) &&
              di[1] == item.price
          );
          if (index > -1) {
            if (
              data[index][2].find(
                (iiid) =>
                  iiid[0] == transaction_nature &&
                  iiid[3] == item.person &&
                  iiid[4] == item.person_title
              )
            ) {
              return;
            }
            data[index][2].push([
              transaction_nature,
              item.qty_or_amount,
              item.transaction_nature || "Förvärv",
              item.person || "",
              item.person_title || "",
              item.volume || 0,
              item.price || 0,
              value || 0,
            ]);
          } else {
            data.push([
              new Date(item.transaction_date).setUTCHours(0, 0, 0, 0),
              item.price,
              [
                [
                  transaction_nature,
                  item.qty_or_amount,
                  item.transaction_nature || "Förvärv",
                  item.person || "",
                  item.person_title || "",
                  item.volume || 0,
                  item.price || 0,
                  value || 0,
                ],
              ],
            ]);
          }
        }
      });
      return data;
    }
  },
  data() {
      return {
        mouse: { x: undefined, y: undefined },
      }
  }
};
</script>

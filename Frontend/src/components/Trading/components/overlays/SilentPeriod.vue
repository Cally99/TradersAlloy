<script>
// Data section splitters (with labels)

import Overlay from "../../mixins/overlay.js";
import moment from "moment";

export default {
  name: "Earnings1",
  mixins: [Overlay],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.0" };
    },
    draw(ctx) {
      let layout = this.$props.layout;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.line_color;

      const earningDates = this.$store.getters["getMapCompanies"].get(this.company_id).CompanyCalendars.map((i) => {
        const tempArrEpochDate = [moment(i.date_report).valueOf()];
        return tempArrEpochDate;
      });

      earningDates.forEach((p, i) => {
        ctx.beginPath();
        let x1 = layout.t2screen(p[0]); // x - Mapping
        let x2 = layout.t2screen(p[0] + 30 * 3600 * 24 * 1000); // x - Mapping
        let x3 = layout.t2screen(p[0] - 15 * 3600 * 24 * 1000); // x - Mapping

        ctx.fillStyle = "rgba(153, 153, 153, 0.3)";
        ctx.fillRect(x1, 0, x1 - x2, this.layout.height);
        ctx.stroke();
      });
    },

    draw_label(ctx, x, p) {
      let side = p[2] ? 1 : -1;

      ctx.font = this.new_font;

      let pos = p[4] || this.y_position;
      let w = ctx.measureText(p[1]).width + 10;
      let y = this.layout.height * (1.0 - pos);

      y = Math.floor(y);
      ctx.fillStyle = "#ea545580";

      //   ctx.fillStyle = p[3] || this.label_color;
      ctx.beginPath();

      // ctx.arc(x, this.layout.height / 2, 15.5, 0, Math.PI * 2, true);
      // ctx.fill();

      ctx.fillStyle = "#ea5455";
      ctx.textAlign = "center";
      ctx.font = "bold 20px Arial";
      // ctx.rotate((Math.PI * 2) / 6);
      ctx.fillText("IP", x, this.layout.height / 2 + 7.5);
    },
    use_for() {
      return ["Earnings1"];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett() {
      return this.$props.settings;
    },
    new_font() {
      return this.sett.font || "12px " + this.$props.font.split("px").pop();
    },
    label_color() {
      return this.sett.labelColor || "#4285f4";
    },
    line_color() {
      return this.sett.lineColor || "#4285f4";
    },
    line_width() {
      return this.sett.lineWidth || 1.0;
    },
    y_position() {
      return this.sett.yPosition || 0.9;
    },
    company_id() {
      return (this.$store.getters.getAllStocks.find((s) => s.stock_id === this.$route.params.stock_id)).company_id;
    }
  },
  data() {
    return {};
  }
};
</script>

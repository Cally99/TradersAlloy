<script>
import Overlay from "../../mixins/overlay.js";

export default {
  name: "InsiderTrades",
  mixins: [Overlay],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.1" };
    },
    draw(ctx) {
      let layout = this.$props.layout;
      let h = Math.floor(layout.height);
      let insiderScale = 0.5;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "black";

      let holdings = 0;
      // let holdingMax = 800;

      var factor =
        this.$props.data.length > 0
          ? this.$props.data[this.$props.data.length - 1][2]
          : 1;
      // console.log(this.$props.data);
      for (let p of this.$props.data) {
        //                new Area(this, ctx, {x1: 1557861200000, y1: 870, x2: 1558000000000, y2: 300 }) // TODO
        holdings = p[2]; // cumulative
        ctx.beginPath();
        let x1 = layout.t2screen(p[0]);
        let y0 =
          this.$props.layout.height -
          (holdings / factor) * 100 * (this.$props.layout.height / 1000);
        let x2 = layout.t2screen(p[1]);
        ctx.fillStyle = "rgba(255,153,208,0.4)";
        ctx.fillRect(
          x1,
          y0,
          x2 - x1,
          (holdings / factor) * 100 * (this.$props.layout.height / 1000)
        );

        ctx.stroke();
        if (this.show_label && p[3]) {
          // this.draw_label(ctx, x, y, p); // TODO: disabled
        }
      }
    },

    draw_label(ctx, x, y, p) {
      ctx.fillStyle = this.label_color;
      ctx.font = this.new_font;
      ctx.textAlign = "center";
      ctx.fillText(p[3], x, y - 25);
    },
    use_for() {
      return ["InsiderTrades"];
    },

    // Defines legend format (values & colors)
    legend(values) {
      return [
        {
          value: values[3]
        },
        {
          value: values[2].toFixed(0),
          color: this.$props.colors.colorText
        }
      ];
    }
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
    label_color() {
      return this.sett.labelColor || "#333";
    },
    marker_size() {
      return this.sett.markerSize || 5;
    },
    show_label() {
      return this.sett.showLabel !== false;
    },
    new_font() {
      return this.sett.font || this.default_font;
    }
  }
};
</script>

<script>
// Line drawing tool

import Overlay from "../../mixins/overlay.js";
import Tool from "../../mixins/tool.js";
import Icons from "../../stuff/icons.json";
import Pin from "../primitives/pin.js";
import Seg from "../primitives/seg.js";

export default {
  name: "TradeHistory",
  mixins: [Overlay, Tool],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.0" };
    },
    tool() {
      return {
        // Descriptor for the tool
        group: "Trade History",
        icon: Icons["dollar.png"],
        type: "Price",
        hint: "Trade History",
        data: [], // Default data
        settings: {
          tooltip: 'Trade History'
        }, // Default settings
      };
    },
    // Called after overlay mounted
    init() {
       if(this.settings.single) return
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, "pp1"));
      // Second one is following mouse until it clicks
      this.pins.push(
        new Pin(this, "pp2", {
          state: "tracking",
        })
      );

      this.pins[1].on("settled", () => {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        this.set_state("finished");
        this.$emit("drawing-mode-off");
      });

      this.pins[0].on("dragging", () => {
        this.set_state("finished");
        this.$emit("drawing-mode-off");
      });

      this.pins[1].on("dragging", () => {
        this.$emit("drawing-mode-off");
      });

    //   if (this.$props.settings.p3 !== undefined && this.initFlag) {
    //     this.pins.push(new Pin(this, "p3"));
    //     this.initFlag = false;
    //   } else 
        this.initFlag = false;
    },
    draw(ctx) {
      if (!this.pp1 || !this.pp2) return;
      let dir = Math.sign(this.pp2[1] - this.pp1[1]);
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
    
      // Background
      ctx.fillStyle = this.back_color1;
      const layout = this.$props.layout;

      let x1 = layout.t2screen(this.pp1[0]);
      let y1 = layout.$2screen(this.pp1[1]);
      let x2 = layout.t2screen(this.pp2[0]);
      let y2 = layout.$2screen(this.pp2[1]);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      // Top
      ctx.strokeStyle = "#ffec57";
      new Seg(this, ctx).draw(
        [this.pp1[0], this.pp2[1]],
        [this.pp2[0], this.pp2[1]]
      );
      // Bottom
      new Seg(this, ctx).draw(
        [this.pp1[0], this.pp1[1]],
        [this.pp2[0], this.pp1[1]]
      );

      let xm = layout.t2screen((this.pp1[0] + this.pp2[0]) * 0.5);
      let ySingle = this.pp1[1] > this.pp2[1] ? this.pp1[1] : this.pp2[1]
      let xSingle = this.pp1[0] > this.pp2[0] ? this.pp1[0] : this.pp2[0]
      ySingle = this.layout.$2screen(ySingle)
      xSingle = this.layout.t2screen(xSingle)
      var ym = this.layout.$2screen(this.pp2[1]);

      ctx.stroke();

      // Vertical
      ctx.strokeStyle = "#ffec57";
      ctx.beginPath();
      // ctx.setLineDash([5, 5]);
        new Seg(this, ctx).draw(
            [this.pp1[0], this.pp2[1]],
            [this.pp1[0], this.pp1[1]]
        );

         new Seg(this, ctx).draw(
            [this.pp2[0], this.pp2[1]],
            [this.pp2[0], this.pp1[1]]
        );

      ctx.stroke();
      
      // ctx.setLineDash([]);
    //   if (this.p3) {
        var px = this.pp1[0];
        var py = this.pp1[1];
        if (this.pp1[1] < this.pp2[1]) py = this.pp2[1];
        if (this.pp1[0] < this.pp2[0]) px = this.pp2[0];
        px = layout.t2screen(px);
        py = layout.$2screen(py);
        if(!this.settings.single) this.settingsIconDraw(ctx, px, py);
    //   }

      this.render_pins(ctx);
    },
    draw_value(ctx, dir, xm, y , x1, y1) {

    },
    settingsIconDraw(ctx, px, py) {
      ctx.font = this.new_font;

      // ctx.fillStyle = "#0aa5ff44";

      ctx.beginPath();

      // ctx.arc(px - 20, py + 20, 15.5, 0, Math.PI * 2, true);
      // ctx.fill();

      ctx.fillStyle = "#ff8e41";
      ctx.textAlign = "center";
      // ctx.font = "bold 30px Arial";
      ctx.font = "24px 'Material Icons'";
      ctx.fillText('settings', px - 20, py + 31);
    },
    use_for() {
      return ["TradeHistory"];
    },
    data_colors() {
      return [this.color];
    },
  },
  // Define internal setting & constants here
  computed: {
    sett() {
      return this.$props.settings;
    },
    pp1() {
      return this.$props.settings.pp1;
    },
    pp2() {
      return this.$props.settings.pp2;
    },
    p3() {
      return this.$props.settings.p3;
    },
    updateKey() {
      return this.$props.settings.update;
    },
    line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color() {
      return this.sett.color || this.$props.colors.colorCross;
    },
    back_color1() {
      return this.sett.backColor1 || "#f7e4001c";
    },
    back_color2() {
      return this.sett.backColor2 || "#f7000016";
    },
    value_back() {
      return this.sett.valueBack || "red";
    },
    value_color() {
      return this.sett.valueColor || this.$props.colors.colorText;
    },
    prec() {
      return this.sett.precision || 1;
    },
    new_font() {
      return "12px " + this.$props.font.split("px").pop();
    },
  },
  watch: {
    updateKey(val) {
      if (val) {
        this.pins = [];
        this.initFlag = true;
        this.init();
      }
    },
  },
  data() {
    return {
      initFlag: true,
    };
  },
};
</script>

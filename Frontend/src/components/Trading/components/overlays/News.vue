<script>
// Line drawing tool

import Overlay from "../../mixins/overlay.js";
import Pin from "../primitives/pin.js";
import Tool from "../../mixins/tool.js";
import Icons from "../../stuff/icons.json";

export default {
  name: "NewsTool",
  mixins: [Overlay, Tool],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.0" };
    },
    // Called after overlay mounted
    init() {
      this.pins.push(new Pin(this, "p1"));

      if(this.p1 && !this.p1[1]) {
        let diff = Infinity;
        let ii = -1;

        this.sub.map((item, index) => {
          if(Math.abs(item[0] - this.p1[0]) < diff) {
            diff = Math.abs(item[0] - this.p1[0]);
            ii = index;
          }
        });

        this.p1[1] = this.sub[ii][1];
        this.pins[0] = new Pin(this, "p1");
      }

      this.set_state("finished");
      this.$emit("drawing-mode-off");
    },
    draw(ctx) {
      if (!this.p1) {
        return;
      }

      const layout = this.$props.layout;

      ctx.beginPath();

      const x = layout.t2screen(this.p1[0]);
      const y = layout.$2screen(this.p1[1]);
      const text = 'X';

      const is_hover = this.hover(x, y, 100);

      ctx.lineWidth = is_hover ? 1.8 : this.line_width;

      const background = "#FFFFFF";
      const color = "#000000";
      this.draw_label(ctx, x, y , text , background , color, is_hover);

      ctx.stroke();

      ctx.shadowColor = 'rgba(0, 0, 0, 0)';

    //   this.render_pins(ctx , 'text');
    },
    hover(x, y, textLength) {
      return Math.abs(x - this.mouse.x) < 20 &&  y - this.mouse.y < (100 + textLength);
    },
    draw_label(ctx, x, y, text, background, color, hover) {
      const xx = x;
      const yy = y;
      
      const side = (this.layout.height / 2) > y ? 1 : -1;

      this.side = side;

      if(hover) {
        const pin = {
          x: this.pins[0].x,
          y: this.pins[0].y,
          side: this.side,
          textLength: this.textLength
        };

        this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.chartPrice.getPinFromChart(pin);
      }

      x += 1 * side;
      ctx.font = "12px Arial";

      let w = ctx.measureText(text).width + 10;

      if(w < 60) {
        w = 60;
      }

      y = Math.floor(y);

      ctx.fillStyle = background;
      ctx.strokeStyle = '#8e8d8d';
      ctx.beginPath();
      ctx.translate(xx, yy);
      ctx.rotate(0 * Math.PI / 180);
      ctx.translate(-xx, -yy);
      
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 * side, y - 10 * side);
      ctx.lineTo(x + (w - 10) * side, y - 10 * side);
      ctx.lineTo(x + (w - 10) * side, y + 10 * side);
      ctx.lineTo(x + 10 * side, y + 10 * side);
      ctx.closePath();

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;

      ctx.fill();

      ctx.fillStyle = color;
      ctx.textAlign = side < 0 ? "right" : "left";
      ctx.fillText('news', x + 15 * side, y + 4);
      ctx.resetTransform();
    },
    use_for() {
      return ["NewsTool"];
    },
    data_colors() {
      return [this.color];
    }

  },
  mousemove(event) {
    this.mouse.x = event.layerX;
    this.mouse.y = event.layerY;
  },
  // Define internal setting & constants here
  computed: {
    sett() {
      return this.$props.settings;
    },
    p1() {
      return this.$props.settings.p1;
    },
    p2() {
      return this.$props.settings.p2;
    },
    line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color() {
      return this.sett.color || "#FFFFBA";
    }
  },
  data() {
    return {
      mouse: { x: undefined, y: undefined },
      side: null,
      textLength: 0
    };
  }
};
</script>

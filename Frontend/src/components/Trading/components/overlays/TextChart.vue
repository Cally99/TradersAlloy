<script>
// Line drawing tool

import Overlay from "../../mixins/overlay.js";
import Tool from "../../mixins/tool.js";
import Icons from "../../stuff/icons.json";
import Pin from "../primitives/pin.js";

export default {
  name: "TextTool",
  mixins: [Overlay, Tool],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.0" };
    },
    tool() {
      return {
        group: "Text Tool",
        icon: Icons["text.png"],
        type: "TextTool",
        hint: "This hint will be shown on hover",
        data: [], // Default data
        settings: {
          tooltip: 'Text / Trade Journal'
        }, // Default settings
      };
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
      const text = this.$props.settings.text || "text";

      if(text.length < 10) {
        this.textLength = 12;
      } else if(text.length > 10 && text.length <= 13) {
        this.textLength = text.length * 2;
      } else if(text.length > 13 && text.length <= 16) {
        this.textLength = text.length * 2.5;
      } else if(text.length > 16) {
        this.textLength = text.length * 3.5;
      }

      const is_hover = this.hover(x, y, this.textLength);

      ctx.lineWidth = is_hover ? 1.8 : this.line_width;

      const background = this.$props.settings.background || "#FFFFBA";
      const color = this.$props.settings.color || "#000000";
      this.draw_label(ctx, x, y , text , background , color, is_hover);

      ctx.stroke();

      ctx.shadowColor = 'rgba(0, 0, 0, 0)';

      this.render_pins(ctx , 'text');
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

      x += 2.5 * side;
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
      ctx.rotate(90 * Math.PI / 180);
      ctx.translate(-xx, -yy);
      
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20 * side, y - 10 * side);
      ctx.lineTo(x + (w + 20) * side, y - 10 * side);
      ctx.lineTo(x + (w + 20) * side, y + 10 * side);
      ctx.lineTo(x + 20 * side, y + 10 * side);
      ctx.closePath();

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;

      ctx.fill();

      ctx.fillStyle = color;
      ctx.textAlign = side < 0 ? "right" : "left";
      ctx.fillText(text, x + 25 * side, y + 4);
      ctx.resetTransform();
    },
    use_for() {
      return ["TextTool"];
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

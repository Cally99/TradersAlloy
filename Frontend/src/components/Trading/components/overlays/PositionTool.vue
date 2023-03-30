<script>
/* eslint-disable no-console */
// Line drawing tool

import Overlay from "../../mixins/overlay.js";
import Tool from "../../mixins/tool.js";
import Icons from "../../stuff/icons.json";
import Pin from "../primitives/pin.js";
import Seg from "../primitives/seg.js";

export default {
  name: "PositionTool",
  mixins: [Overlay, Tool],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.0" };
    },
    tool() {
      return {
        // Descriptor for the tool
        group: "Trade Plan",
        icon:  Icons["position_long.png"],// '/images/icons/red-warning.svg',
        type: "Price",
        hint: "Trade Plan",
        data: [], // Default data
        settings: { // Default settings
          tooltip: 'Trade Plan',
        },
      };
    },
    /**
     * Rearraging the drawing points 
     * because sometimes user can draw the points from bottom-left to top-right
     * or from bottom-right to top-left.
     * 
     * So keeping the exit date smaller than the entry date
     * and
     * the target price bigger than the stoploss price always.
     */
    rearrangePoints() {
      const pins = this.pins;
      const exitDate = Math.min(pins[0].t, pins[1].t), x0 = Math.min(pins[0].x, pins[1].x);
      const targetPrice = Math.max(pins[0].y$, pins[1].y$), y0 = Math.max(pins[0].y, pins[1].y);

      const entryDate = Math.max(pins[0].t, pins[1].t), x1 = Math.max(pins[0].x, pins[1].x);
      const stoplossPrice = Math.min(pins[0].y$, pins[1].y$), y1 = Math.min(pins[0].y, pins[1].y);

      pins[0].t = exitDate;
      pins[0].y$ = targetPrice;
      pins[0].t1 = exitDate;
      pins[0].y$1 = targetPrice;
      pins[0].x = x0;
      pins[0].y = y0;

      pins[1].t = entryDate;
      pins[1].y$ = stoplossPrice;
      pins[1].t1 = entryDate;
      pins[1].y$1 = stoplossPrice;
      pins[1].x = x1;
      pins[1].y = y1;

      this.settings.p1[0] = exitDate;
      this.settings.p1[1] = targetPrice;
      this.settings.p2[0] = entryDate;
      this.settings.p2[1] = stoplossPrice;
    },
    // Called after overlay mounted
    init() {
       if(this.settings.single) return
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, "p1"));
      // Second one is following mouse until it clicks
      this.pins.push(
        new Pin(this, "p2", {
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
        this.pins[2] = new Pin(
          this,
          "p3",
          {
            key: "mid_set",
            update: this.p3,
          },
          [this.pins[0], this.pins[1]]
        );
        this.set_state("finished");
        this.$emit("drawing-mode-off");
      });

      this.pins[1].on("dragging", () => {
        if (this.pins.length < 3) {
          this.pins.push(
            new Pin(
              this,
              "p3",
              {
                key: "mid_set",
                update: false,
              },
              [this.pins[0], this.pins[1]]
            )
          );
        } else {
          this.pins[2] = new Pin(
            this,
            "p3",
            {
              key: "mid_set",
              update: this.p3,
            },
            [this.pins[0], this.pins[1]]
          );
        }
        // when user drawing the point 2, rearranging the points
        this.rearrangePoints();
        // this.set_state("finished");
        this.$emit("drawing-mode-off");
      });

      if (this.$props.settings.p3 !== undefined && this.initFlag) {
        this.pins.push(new Pin(this, "p3"));
        this.initFlag = false;
      } else {
        this.initFlag = false;
      }
    },
    draw(ctx) {
      if (!this.p1 || !this.p2) return;

      // Determine alarm is off state
      const isAlarmActive = (new Date().getTime() < Math.max(this.p1[0], this.p2[0]));

      let dir = Math.sign(this.p2[1] - this.p1[1]);
      ctx.lineWidth = isAlarmActive ? this.line_width : this.line_width;
      ctx.strokeStyle = isAlarmActive ? this.color : this.disable_color;
      ctx.beginPath();

      if(!isAlarmActive) {
        ctx.setLineDash([10, 10]);
      }
      // Background
      ctx.fillStyle = isAlarmActive ? this.back_color1 : this.back_disable_color1;
      const layout = this.$props.layout;

      let x1 = layout.t2screen(this.p1[0]);
      let y1 = layout.$2screen(this.p1[1]);
      let x2 = layout.t2screen(this.p2[0]);
      let y2 = layout.$2screen(this.p2[1]);

      if (!this.p3) {
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      } else {
        let y3 = layout.$2screen(this.p3[1]);

        if (y2 >= y1) {
          ctx.fillRect(x1, y1, x2 - x1, y3 - y1);
          ctx.fillStyle = isAlarmActive ? this.back_color2 : this.back_disable_color2;
          ctx.fillRect(x1, y3, x2 - x1, y2 - y3);
        } else {
          ctx.fillRect(x1, y3, x2 - x1, y2 - y3);
          ctx.fillStyle = isAlarmActive ? this.back_color2 : this.back_disable_color2;
          ctx.fillRect(x1, y1, x2 - x1, y3 - y1);
        }
      }

      // Top
      new Seg(this, ctx).draw(
        [this.p1[0], this.p2[1]],
        [this.p2[0], this.p2[1]]
      );
      // Bottom
      new Seg(this, ctx).draw(
        [this.p1[0], this.p1[1]],
        [this.p2[0], this.p1[1]]
      );
      // Virtical
      new Seg(this, ctx).draw(
        [this.p1[0], this.p1[1]],
        [this.p1[0], this.p2[1]]
      );
      new Seg(this, ctx).draw(
        [this.p2[0], this.p1[1]],
        [this.p2[0], this.p2[1]]
      );

      // Arrow
      let xm = layout.t2screen((this.p1[0] + this.p2[0]) * 0.5);
      let ySingle = this.p1[1] > this.p2[1] ? this.p1[1] : this.p2[1]
      let xSingle = this.p1[0] > this.p2[0] ? this.p1[0] : this.p2[0]
      ySingle = this.layout.$2screen(ySingle)
      xSingle = this.layout.t2screen(xSingle)
      var ym = null;
      if (!this.p3) {
        ym = this.layout.$2screen((this.p1[1] + this.p2[1]) * 0.5);
      } else {
        ym = this.layout.$2screen(this.p3[1]);
      }

      ctx.stroke();

      // Vertical
      ctx.beginPath();

      if (!this.p3) {
        new Seg(this, ctx).draw(
          [this.p2[0], (this.p1[1] + this.p2[1]) * 0.5],
          [this.p1[0], (this.p1[1] + this.p2[1]) * 0.5]
        );
      } else {
        new Seg(this, ctx).draw(
          [this.p2[0], this.p3[1]],
          [this.p1[0], this.p3[1]]
        );
      }
      ctx.stroke();

      if (this.p3) {
        this.draw_value(ctx, dir, xm, ym , xSingle , ySingle);
        var px = this.p1[0];
        var py = this.p1[1];
        if (this.p1[1] < this.p2[1]) py = this.p2[1];
        if (this.p1[0] < this.p2[0]) px = this.p2[0];
        px = layout.t2screen(px);
        py = layout.$2screen(py);
        if(!this.settings.single && isAlarmActive) this.settingsIconDraw(ctx, px, py);
      }
      this.render_pins(ctx);

      // Draw alarm
      this.renderAlam(ctx, isAlarmActive);
      this.setSetting(isAlarmActive)
    },
    draw_value(ctx, dir, xm, y) {
      if (this.selected || this.show_pins) {
        ctx.font = this.new_font;
        let yMax = Math.max(this.p1[1], this.p2[1]);
        let yMin = Math.min(this.p1[1], this.p2[1]);

        let risk = (yMax - this.p3[1]).toFixed(this.prec);
        let return_value = (this.p3[1] - yMin).toFixed(this.prec);

        var p = 0;
        if (return_value != 0) p = (risk / return_value).toFixed(this.prec);

        let text = `Risk/Return  Ratio: ${p}`;
        let w = Math.max(ctx.measureText(text).width + 20, 100);
        ctx.fillStyle = this.value_back;
        
        if(!this.settings.single) {
          ctx.fillRect(xm - w * 0.5, y - 30 * dir, w, 20 * dir);
        }
        
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        if(!this.settings.single) {
          ctx.textAlign = "center";
          ctx.fillText(text, xm, y + (dir > 0 ? -15 : 25));
        }
      }
    },
    settingsIconDraw(ctx, px, py) {
      ctx.font = this.new_font;

      ctx.beginPath();

      ctx.fillStyle = this.disable_color;
      ctx.textAlign = "center";
      ctx.font = "24px 'Material Icons'";
      ctx.fillText('settings', px - 20, py + 31);
    },
    /**
     * Draw dotted line between board and y axis
     * @ctx canvas context
     * @notExpired when alarm is off then false
     */
    renderAlam(ctx, notExpired) {
      if(!notExpired && this.drag === null) return;

      const layout = this.$props.layout;
      const lastXPosition = (notExpired) ? this.range[1] : this.p2[0] + 2000000000;

      ctx.lineWidth = this.line_width * 1.5;
      ctx.beginPath();
      ctx.setLineDash([15, 15]);


      
      new Seg(this, ctx).draw(
        [this.p2[0], this.p1[1]],
        [lastXPosition, this.p1[1]]
      );
      new Seg(this, ctx).draw(
        [this.p2[0], this.p2[1]],
        [lastXPosition, this.p2[1]]
      );
      if(this.p3) {
        new Seg(this, ctx).draw(
          [this.p2[0], this.p3[1]],
          [lastXPosition, this.p3[1]]
        );
      }
      ctx.stroke();

      let px = lastXPosition, py = this.p1[1];
        px = layout.t2screen(px);
        py = layout.$2screen(py);
        this.alamIconDraw(ctx, px, py, notExpired);
      py = this.p2[1];
        py = layout.$2screen(py);
        this.alamIconDraw(ctx, px, py, notExpired);
      if (this.p3) {
        py = this.p3[1];
          py = layout.$2screen(py);
          this.alamIconDraw(ctx, px, py, notExpired);
      }
    },
    /**
     * Draw alarm icon by expired state
     * @ctx canvas context
     * @px alarm draw position x
     * @py alarm draw position y
     * @notExpired expired state is off or not
     */
    alamIconDraw(ctx, px, py, notExpired) {
      ctx.beginPath();
      ctx.textAlign = "center";
      ctx.font = "24px 'Material Icons'";

      if(notExpired) {
        ctx.fillStyle = this.active_alarm_color;
        ctx.fillText('notifications', px - 10, py + 10);
      } else { 
        ctx.fillStyle = this.disable_alarm_color;
        ctx.fillText('notifications_off', px - 10, py + 10);
      }
    },
    /**
     * set alarm state on or off
     * @notExpird expired state is off or not
     */
    setSetting(notExpired) {
      const alarmOnOffState = (notExpired) ? 'on' :'off';

      this.settings.entry_alert_status = alarmOnOffState;
      this.settings.stoploss_alert_status = alarmOnOffState;
      this.settings.target_alert_status = alarmOnOffState;

    },
    use_for() {
      return ["PositionTool"];
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
    p1() {
      return this.$props.settings.p1;
    },
    p2() {
      return this.$props.settings.p2;
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
    disable_color() {
      return "#00000080";
    },
    active_alarm_color() {
      return "#508A23";
    },
    disable_alarm_color() {
      return "#A5A5A5";
    },
    back_color1() {
      return this.sett.backColor1 || "#9bffa316";
    },
    back_disable_color1() {
      return "#C4C4C450";
    },
    back_color2() {
      return this.sett.backColor2 || "#f7000016";
    },
    back_disable_color2() {
      return "#8A8A8A50";
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

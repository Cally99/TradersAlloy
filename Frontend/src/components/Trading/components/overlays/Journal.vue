<script>
import Overlay from "../../mixins/overlay.js";
export default {
  name: "Journal",
  mixins: [Overlay],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.0" };
    },
    draw(ctx) {
      let layout = this.$props.layout;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.line_color;
      this.$props.data.forEach((p, i) => {
        var y = this.sub.find(item=>item[0]<=p[0])
        var diff = Infinity
        var ii = -1
        this.sub.map((item,index)=> {
          if(Math.abs(item[0]-p[0]) < diff) {
            diff = Math.abs(item[0]-p[0])
            ii = index
          }
        })
        y = layout.$2screen(this.sub[ii][1])
        
        y = Math.floor(y);
        ctx.beginPath();
        let x = layout.t2screen(p[0]); // x - Mapping
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x-30, y);
        ctx.lineTo(x+30, y);
        ctx.stroke();
        let is_hover = this.hover(x, y);
        if (p[1]) this.draw_label(ctx, x, p, y, is_hover);
      });
    },
    draw_label(ctx, x, p, y , h) {
      var xx= x
      var yy = y
      
      let side = this.layout.height/2>y ? 1 : -1;

      x += 2.5 * side;
      ctx.font = this.new_font;
      let text = this.calcText(p[1], h);
      // let pos = p[4] || this.y_position;
      let w = ctx.measureText(text).width + 10;
      // let y = this.layout.height * (1.0 - pos);
      y = Math.floor(y);
      ctx.fillStyle = p[3] || this.label_color;
      ctx.beginPath();
      ctx.translate(xx, yy);
      ctx.rotate(90 * Math.PI / 180);
      ctx.translate(-xx, -yy);
      
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y + 10 * side);
      ctx.lineTo(x + 10 * side, y + 10 * side);
      ctx.closePath();

      ctx.fill();

      ctx.fillStyle = "black";
      ctx.font = "bold Arial";
      ctx.textAlign = side < 0 ? "right" : "left";
      ctx.fillText(text, x + 15 * side, y + 4);
      ctx.resetTransform();
    },
    mousemove(event) {
      this.mouse.x = event.layerX;
      this.mouse.y = event.layerY;
    },
    hover(x, y) {
      // return false
      return Math.abs(x - this.mouse.x) < 20 &&  y - this.mouse.y < 240;
      // return x - this.mouse.x < 240 && Math.abs(y - this.mouse.y) < 20;
    },
    use_for() {
      return ["Journal"];
    },
  },
  // Define internal setting & constants here
  computed: {
    calcText() {
      return (text, h) => {
        if (h) return text;
        else {
          if (text.length > 20) {
            return text.substring(0, 17) + " ...";
          }
          return text;
        }
      };
    },
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
  },
  data() {
    return {
      mouse: { x: undefined, y: undefined },
      highlighted: null,
    };
  },
};
</script>
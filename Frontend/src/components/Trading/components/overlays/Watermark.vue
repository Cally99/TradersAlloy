<script>
import Overlay from "../../mixins/overlay.js";

export default {
  name: "Watermark",
  mixins: [Overlay],
  methods: {
    meta_info() {
      return { author: "C451", version: "1.0.1" };
    },
    draw(ctx) {
      let layout = this.$props.layout;
      let h = Math.floor(layout.height);
      let w = Math.floor(layout.width);
      ctx.font = "bold 70px Arial";
      ctx.fillStyle = this.$vuetify.theme.dark ? "#555" : "#ddd";
      ctx.textAlign = "center";
      ctx.fillText(this.$props.settings.data.ticker, w / 2, h / 2);
      ctx.font = "bold 28px Arial";

      ctx.fillText(this.$props.settings.data.name, w / 2, h / 2 + 30);
    },

    use_for() {
      return ["Watermark"];
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

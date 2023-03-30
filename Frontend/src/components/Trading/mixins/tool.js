/* eslint-disable no-console */

// Usuful stuff for creating tools. Include as mixin

import Keys from '../stuff/keys.js'

export default {
    methods: {
        init_tool() {
            // Collision functions (float, float) => bool,
            this.collisions = []
            this.pins = []

            let layout = this.$props.layout

            this.mouse.on('mousemove', () => {
                if (this.collisions.some(f => f(
                        this.mouse.x, this.mouse.y,
                    ))) {
                    this.show_pins = true
                } else if (this.$props.id.includes("PositionTool_")) {
                    let p1 = this.$props.settings.p1
                    let p2 = this.$props.settings.p2
                    let px1 = p1[0]
                    let py1 = p1[1]
                    let px2 = p2[0]
                    let py2 = p2[1]
                    if (px1 < p2[0]) {
                        px1 = p2[0]
                        px2 = p1[0]
                    }

                    if (py1 < p2[1]) {
                        py1 = p2[1]
                        py2 = p1[1]
                    }

                    px1 = layout.t2screen(px1)
                    px2 = layout.t2screen(px2)
                    py1 = layout.$2screen(py1)
                    py2 = layout.$2screen(py2)
                        // && this.mouse.x > px2 && this.mouse.y < py1 && this.mouse.y > py2
                    if (this.mouse.x < px1 && this.mouse.x > px2 && this.mouse.y > py1 && this.mouse.y < py2) {
                        this.show_pins = true
                    } else {
                        this.show_pins = false
                    }
                } else if (this.$props.id.includes("TradeHistory_")) {
                    if (this.$props.settings.pp1 == undefined) return;
                    if (this.$props.settings.pp2 == undefined) return;

                    let p1 = this.$props.settings.pp1
                    let p2 = this.$props.settings.pp2
                    let px1 = p1[0]
                    let py1 = p1[1]
                    let px2 = p2[0]
                    let py2 = p2[1]
                    if (px1 < p2[0]) {
                        px1 = p2[0]
                        px2 = p1[0]
                    }

                    if (py1 < p2[1]) {
                        py1 = p2[1]
                        py2 = p1[1]
                    }

                    px1 = layout.t2screen(px1)
                    px2 = layout.t2screen(px2)
                    py1 = layout.$2screen(py1)
                    py2 = layout.$2screen(py2)
                        // && this.mouse.x > px2 && this.mouse.y < py1 && this.mouse.y > py2
                    if (this.mouse.x < px1 && this.mouse.x > px2 && this.mouse.y > py1 && this.mouse.y < py2) {
                        this.show_pins = true
                    } else {
                        this.show_pins = false
                    }
                } else if (this.$props.id.includes("TextTool_")) {
                    let p1 = this.$props.settings.p1
                    let x = layout.t2screen(p1[0])
                    let y = layout.$2screen(p1[1])

                    let side = this.layout.height / 2 > y ? 1 : -1;
                    if (Math.abs(x - this.mouse.x) < 20 && (this.mouse.y - y) * side > 0 && (this.mouse.y - y) * side < 60) {
                        this.show_pins = true
                    } else {
                        this.show_pins = false
                    }
                } else if (this.$props.id.includes("NewsTool_")) {
                    let p1 = this.$props.settings.p1
                    let x = layout.t2screen(p1[0])
                    let y = layout.$2screen(p1[1])

                    let side = this.layout.height / 2 > y ? 1 : -1;
                    if ((this.mouse.x - x) < 50 && (this.mouse.x - x) > 0 && Math.abs(y - this.mouse.y) < 10) {
                        this.show_pins = true
                    } else {
                        this.show_pins = false
                    }
                } else {
                    this.show_pins = false
                }
                if (this.drag) this.drag_update()
            })

            this.mouse.on('mousedown', e => {

                if (e.defaultPrevented) return
                if (this.collisions.some(f => f(
                        this.mouse.x, this.mouse.y,
                    ))) {
                    if (!this.selected) {
                        this.$emit('object-selected')
                    }
                    this.start_drag()
                    e.preventDefault()
                    this.pins.forEach(x => x.mousedown(e, true))
                } else if (this.$props.id.includes("PositionTool_")) {
                    let p1 = this.$props.settings.p1
                    let p2 = this.$props.settings.p2
                    let px1 = p1[0]
                    let py1 = p1[1]
                    let px2 = p2[0]
                    let py2 = p2[1]
                    if (px1 < p2[0]) {
                        px1 = p2[0]
                        px2 = p1[0]
                    }

                    if (py1 < p2[1]) {
                        py1 = p2[1]
                        py2 = p1[1]
                    }

                    let layout = this.$props.layout
                    px1 = layout.t2screen(px1)
                    px2 = layout.t2screen(px2)
                    py1 = layout.$2screen(py1)
                    py2 = layout.$2screen(py2)
                        // && this.mouse.x > px2 && this.mouse.y < py1 && this.mouse.y > py2

                    //  && this.mouse.y < py1 + 20
                    if (this.mouse.x < px1 && this.mouse.x > px1 - 35 && this.mouse.y > py1 && this.mouse.y < py1 + 35) {
                        if (!this.selected) {
                            this.$emit('object-selected')
                        }

                        setTimeout(() => {
                            this.$emit('settings-click')
                        }, 10);
                    } else {
                        if (this.mouse.x < px1 && this.mouse.x > px2 && this.mouse.y > py1 && this.mouse.y < py2) {
                            if (!this.selected) {
                                this.$emit('object-selected')
                            }
                            this.start_drag()
                            e.preventDefault()
                            this.pins.forEach(x => x.mousedown(e, true))
                        }
                    }
                } else if (this.$props.id.includes("TradeHistory_")) {
                    if (this.$props.settings.pp1 == undefined) return;
                    if (this.$props.settings.pp2 == undefined) return;
                    let p1 = this.$props.settings.pp1
                    let p2 = this.$props.settings.pp2
                    let px1 = p1[0]
                    let py1 = p1[1]
                    let px2 = p2[0]
                    let py2 = p2[1]
                    if (px1 < p2[0]) {
                        px1 = p2[0]
                        px2 = p1[0]
                    }

                    if (py1 < p2[1]) {
                        py1 = p2[1]
                        py2 = p1[1]
                    }

                    let layout = this.$props.layout
                    px1 = layout.t2screen(px1)
                    px2 = layout.t2screen(px2)
                    py1 = layout.$2screen(py1)
                    py2 = layout.$2screen(py2)
                        // && this.mouse.x > px2 && this.mouse.y < py1 && this.mouse.y > py2

                    //  && this.mouse.y < py1 + 20
                    if (this.mouse.x < px1 && this.mouse.x > px1 - 35 && this.mouse.y > py1 && this.mouse.y < py1 + 35) {
                        this.$emit('object-selected')
                        setTimeout(() => {
                            this.$emit('settings-history-click')
                        }, 10);
                    } else {
                        if (this.mouse.x < px1 && this.mouse.x > px2 && this.mouse.y > py1 && this.mouse.y < py2) {
                            if (!this.selected) {
                                this.$emit('object-selected')
                            }
                            this.start_drag()
                            e.preventDefault()
                            this.pins.forEach(x => x.mousedown(e, true))
                        }
                    }
                } else if (this.$props.id.includes("TextTool_")) {
                    let p1 = this.$props.settings.p1
                    let x = layout.t2screen(p1[0])
                    let y = layout.$2screen(p1[1])

                    if (Math.abs(x - this.mouse.x) < 20 && y - this.mouse.y < 60) {
                        if (!this.selected) {
                            this.$emit('object-selected')
                        }
                        this.start_drag()
                        e.preventDefault()
                        this.pins.forEach(x => x.mousedown(e, true))
                        this.$emit('settings-text')
                    }
                } else if (this.$props.id.includes("NewsTool_")) {
                    let p1 = this.$props.settings.p1
                    let x = layout.t2screen(p1[0])
                    let y = layout.$2screen(p1[1])

                    if (Math.abs(this.mouse.x - x) < 50 && Math.abs(this.mouse.x - x) > 0 && Math.abs(y - this.mouse.y) < 10) {
                        if (!this.selected) {
                            this.$emit('object-selected')
                        }
                        // this.start_drag()
                        e.preventDefault()
                        this.pins.forEach(x => x.mousedown(e, true))
                        this.$emit('settings-text')
                    }
                }
            })
            this.mouse.on('mouseup', () => {
                this.drag = null
                this.$emit('scroll-lock', false)
            })

            this.keys = new Keys(this)
            this.keys.on('Delete', this.remove_tool)
            this.keys.on('Backspace', this.remove_tool)

            this.show_pins = false
            this.drag = null
        },
        render_pins(ctx, flag = "") {
            if (this.selected || this.show_pins) {
                this.pins.forEach(x => x.draw(ctx, flag))
            }
        },
        set_state(name) {
            this.$emit('change-settings', {
                $state: name
            })
        },
        watch_uuid(n, p) {
            // If layer $uuid is changed, then re-init
            // pins & collisions
            if (n.$uuid !== p.$uuid) {
                for (let p of this.pins) p.re_init()
                this.collisions = []
                this.show_pins = false
                this.drag = null
            }
        },
        pre_draw() {
            // Delete all collision functions before
            // the draw() call and let primitives set
            // them again
            this.collisions = []
        },
        remove_tool() {
            if (this.selected) this.$emit('remove-tool')
        },
        start_drag() {
            this.$emit('scroll-lock', true)
            let cursor = this.$props.cursor
            this.drag = { t: cursor.t, y$: cursor.y$ }
            this.pins.forEach(x => x.rec_position())

        },
        drag_update() {
            let dt = this.$props.cursor.t - this.drag.t
            let dy = this.$props.cursor.y$ - this.drag.y$
            this.pins.forEach(x => x.update_from(
                [x.t1 + dt, x.y$1 + dy], true
            ));

            this.alarmUpdate();
        },
        /**
         * update alarm state
         */
        alarmUpdate() {
            this.$emit('change-settings', {
                ['entry_alert_status']: this.settings.entry_alert_status
            });
            this.$emit('change-settings', {
                ['stoploss_alert_status']: this.settings.stoploss_alert_status
            });
            this.$emit('change-settings', {
                ['target_alert_status']: this.settings.target_alert_status
            });
        }
    },
    computed: {
        tooltip() {
            return this.$store.getters['getChartTooltip']
        },
        // Settings starting with $ are reserved
        selected() {
            return this.$props.settings.$selected
        },
        state() {
            return this.$props.settings.$state
        },
    },
}
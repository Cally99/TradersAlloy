// Semi-automatic pin object. For stretching things.

export default class Pin {

    // (Comp reference, a name in overlay settings,
    // pin parameters)
    constructor(comp, name, params = {}, data = {}) {

        this.RADIUS = comp.$props.config.PIN_RADIUS || 5.5
        this.RADIUS_SQ = Math.pow(this.RADIUS + 7, 2)
        this.COLOR_BACK = comp.$props.colors.back
        this.COLOR_BR = comp.$props.colors.text

        this.comp = comp
        this.layout = comp.layout
        this.mouse = comp.mouse
        this.name = name
        this.state = params.state || 'settled'

        this.mouse.on('mousemove', e => this.mousemove(e))
        this.mouse.on('mousedown', e => this.mousedown(e))
        this.mouse.on('mouseup', e => this.mouseup(e))

        if (comp.state === 'finished') {
            if (params.key == "mid_set") this.mid_set(data, params.update)
            else {
                this.state = 'settled'
                this.update_from(comp.$props.settings[name])
            }

        } else {
            if (params.key == "mid_set") this.mid_set(data, params.update)
            else
                this.update()
        }

        if (this.state !== 'settled') {
            this.comp.$emit('scroll-lock', true)
        }
    }

    re_init() {
        this.update_from(
            this.comp.$props.settings[this.name]
        )
    }

    draw(ctx , flag='') {
        switch (this.state) {
            case 'tracking':
                break
            case 'dragging':
                if (!this.moved) this.draw_circle(ctx,flag)
                break
            case 'settled':
                this.draw_circle(ctx, flag)
                break
        }
    }

    draw_circle(ctx , flag = '') {
        var ratio = flag == '' ? 1 : 0.8;
        let r, lw;
        if (this.comp.selected) {
            r = this.RADIUS; lw = 1.5;
        } else {
            r = this.RADIUS * 0.95; lw = 1;
        }

        ctx.lineWidth = lw
        ctx.strokeStyle = this.COLOR_BR
        ctx.fillStyle = this.COLOR_BACK
        ctx.beginPath()
        ctx.arc(
            this.x = this.layout.t2screen(this.t),
            this.y = this.layout.$2screen(this.y$),
            r*ratio + 0.5, 0, Math.PI * 2, true)
        ctx.fill()
        ctx.stroke()
    }

    mid_set(data, updateKey) {
        let t = Math.min(data[0].t, data[1].t)
        t += Math.abs(Math.round((data[0].t - data[1].t) * 500000000) / 1000000000)

        let y$ = Math.min(data[0].y$, data[1].y$)
        y$ += Math.abs(Math.round((data[0].y$ - data[1].y$) * 500000000) / 1000000000)

        this.t = t
        this.x = this.layout.t2screen(this.t)


        if (updateKey == false) {
            this.y$ = y$
            this.y = this.layout.$2screen(this.y$)
        }
        else {
            this.y$ = updateKey[1]
            this.y = this.layout.$2screen(this.y$)
        }
        this.comp.$emit('change-settings', {
            ['p3']: [this.t, this.y$]
        })
    }

    update() {
        let midPoint = this.comp.p3
        this.y$ = this.comp.$props.cursor.y$
        let p1 = this.comp.p1
        let p2 = this.comp.p2

        if (this.name != 'p3' && midPoint !== undefined) {
            if (this.name == "p1") {
                if (p1[1] > p2[1]) {
                    if (midPoint[1] > this.y$) {
                        this.y$ = midPoint[1]
                    }
                }
                else {
                    if (midPoint[1] < this.y$) {
                        this.y$ = midPoint[1]
                    }
                }
            }
            else if (this.name == "p2") {
                if (p1[1] > p2[1]) {
                    if (midPoint[1] < this.y$)
                        this.y$ = midPoint[1]
                }
                else {
                    if (midPoint[1] > this.y$)
                        this.y$ = midPoint[1]
                }
            }
        }

        this.y = this.comp.$props.cursor.y

        if (this.name != 'p3') {
            this.t = this.comp.$props.cursor.t
            this.x = this.comp.$props.cursor.x
        }

        if (this.name == "p3") {

            let yMax = Math.max(p1[1], p2[1])
            let yMin = Math.min(p1[1], p2[1])

            if (this.y$ > yMax)
                this.y$ = yMax
            if (this.y$ < yMin)
                this.y$ = yMin

        }

        // Save pin as time in IB mode
        //if (this.layout.ti_map.ib) {
        //    this.t = this.layout.ti_map.i2t(this.t )
        //}
        // Reset the settings attahed to the pin (position)

        this.comp.$emit('change-settings', {
            [this.name]: [this.t, this.y$]
        })

        // if (this.name != "p3" && this.comp.pins.length > 1) {
        //     this.mid_set([this.comp.pins[0], this.comp.pins[1]])
        // }
    }

    update_from(data, emit = false) {

        if (!data) return
        if(isNaN(Number(data[1]))) return

        this.y$ = Number(data[1])


        this.y = this.layout.$2screen(this.y$)
        this.t = data[0]
        this.x = this.layout.t2screen(this.t)

        // TODO: Save pin as time in IB mode
        //if (this.layout.ti_map.ib) {
        //    this.t = this.layout.ti_map.i2t(this.t )
        //}

        if (emit) this.comp.$emit('change-settings', {
            [this.name]: [this.t, this.y$]
        })

    }

    rec_position() {
        this.t1 = this.t
        this.y$1 = this.y$
    }

    mousemove() {

        switch (this.state) {
            case 'tracking':
            case 'dragging':
                // this.moved = true
                this.update()
            // if (this.comp.pins.length > 1)
            //     this.mid_set([this.comp.pins[0], this.comp.pins[1]])
            // break
        }


    }

    mousedown(event, force = false) {
        if (event.defaultPrevented && !force) return
        switch (this.state) {
            case 'tracking':
                this.state = 'settled'
                if (this.on_settled) this.on_settled()
                this.comp.$emit('scroll-lock', false)
                break
            case 'settled':
                if (this.hover()) {
                    this.state = 'dragging'
                    this.moved = false
                    this.comp.$emit('scroll-lock', true)
                    this.comp.$emit('object-selected')
                }
                break
        }
        if (this.hover()) {
            event.preventDefault()
        }
    }

    mouseup() {
        switch (this.state) {
            case 'dragging':
                this.state = 'settled'
                if (this.on_settled) this.on_settled()
                this.comp.$emit('scroll-lock', false)
                break
        }
    }

    on(name, handler) {
        switch (name) {
            case 'settled':
                this.on_settled = handler
                break
            case 'dragging':
                this.on_settled = handler
                break

        }
    }

    hover() {

        let x = this.x
        let y = this.y
        return (
            (x - this.mouse.x) * (x - this.mouse.x) +
            (y - this.mouse.y) * (y - this.mouse.y)
        ) < this.RADIUS_SQ
    }

}

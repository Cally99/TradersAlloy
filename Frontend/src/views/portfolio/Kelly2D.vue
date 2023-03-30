<template lang="pug">
    DIV
        div(width="600px" style="background-color:white;")
            canvas( id="kelly2d" width="400" height="300" style=    "z-index:100; position:absolute; top:600; left:600;") Your browser doesn’t currently support HTML5 Canvas. Please check caniuse.com/#feat=canvas for information on browser support for canvas.
            canvas( id="kelly2d2" width="400" height="300" style="z-index:101; position:absolute; top:600; left:600;") Your browser doesn’t currently support HTML5 Canvas. Please check caniuse.com/#feat=canvas for information on browser support for canvas.

        div(v-show="false")
            img( id="smiley_sad" src="../../../public/images/smiley_sad.png" )
            img( id="smiley_hero" src="../../../public/images/smiley_hero.png" )
            img( id="smiley_dead" src="../../../public/images/smiley_dead.png" )
            img( id="smiley_neutral" src="../../../public/images/smiley_neutral.png" )
            img( id="smiley_good" src="../../../public/images/smiley_good.png" )
</template>

<script>
import ApiService from "../../Services/ApiService.js";

export default {
    name: 'Kelly2D',
    data () {
        return {
            kelly_history: [
                {period: '1', x: 140, y: 140},
                {period: '2', x: 130, y: 140},
                {period: '3', x: 150, y: 140},
                {period: '4', x: 160, y: 160},
                {period: '5', x: 180, y: 180},
                {period: '6', x: 240, y: 260},
            ],
        }
    },

    created() {
        this.user = JSON.parse(localStorage.user);
        ApiService.selectUserTrades(this.user.user_id)
            .then(req => {
                this.trades = req.data;

                // more lodash cleverness ... sum the P/L per month
                this.monthly_pnl = _(this.trades)
                    .groupBy( (x) => x.exit_date.substr(0,7))
                    .map((value, key) => ({
                        period: key,
                        pnl_pct: _.sumBy(value, 'pnl'),
                        rows: _.size(value),
                    }))
                    .value();


                let sumOfLosses = this.trades.reduce((a, b) => a + (b<0?b : 0), 0);
                let sumOfWins = this.trades.reduce((a, b) => a + (b>0?b : 0), 0);



                // Add data to one row of the month to be rendered as the first column
                for (let i = 0; i < this.trades.length; i++) {
                    this.trades[i].period = this.trades[i].exit_date.substr(0,7);
                    for (let j = 0; j < this.monthly_pnl.length; j++) {
                        if (this.trades[i].exit_date.substr(0,7) == this.monthly_pnl[j].period) {
                            this.trades[i].period_pnl_pct = this.monthly_pnl[j].pnl_pct;
                            this.trades[i].period_rows =    this.monthly_pnl[j].rows;
                            this.monthly_pnl[j].period = 'do not add to any more records';
                            break;
                        }
                    }
                }})
            .catch(error => {
            })
    },
    mounted() {
        let canvas = document.getElementById('kelly2d');
        let ctx = canvas.getContext('2d');
        let kanvas = document.getElementById('kelly2d2');
        let ktx = kanvas.getContext('2d');

        let smiley_sad = document.getElementById("smiley_sad");
        let smiley_neutral = document.getElementById("smiley_neutral");
        let smiley_hero = document.getElementById("smiley_hero");
        let smiley_dead = document.getElementById("smiley_dead");
        let smiley_good = document.getElementById("smiley_good");

        //  * * * TEXT * * *
        ctx.fillStyle = "#000000";
        ctx.font = '9pt Calibri, sans-serif';
        ctx.fillText('# losers', 5, 150);
        ctx.fillText('# winners', 350, 150);
//        ctx.rotate( (Math.PI / 180) * 315);


        ctx.beginPath();

        smiley_good.onload = function() {
            ctx.drawImage(smiley_sad,55,6, 38, 38);
            ctx.drawImage(smiley_sad,105,6, 38, 38);
            ctx.drawImage(smiley_neutral,155,6, 38, 38);
            ctx.drawImage(smiley_good,205,6, 38, 38);
            ctx.drawImage(smiley_good,255,6, 38, 38);
            ctx.drawImage(smiley_hero,305,6, 38, 38);

            ctx.drawImage(smiley_sad,55,55, 38, 38);
            ctx.drawImage(smiley_sad,105,55, 38, 38);
            ctx.drawImage(smiley_neutral,155,55, 38, 38);
            ctx.drawImage(smiley_good,205,55, 38, 38);
            ctx.drawImage(smiley_good,255,55, 38, 38);
            ctx.drawImage(smiley_good,305,55, 38, 38);

            ctx.drawImage(smiley_sad,55,105, 38, 38);
            ctx.drawImage(smiley_sad,105,105, 38, 38);
            ctx.drawImage(smiley_neutral,155,105, 38, 38);
            ctx.drawImage(smiley_good,205,105, 38, 38);
            ctx.drawImage(smiley_good,255,105, 38, 38);
            ctx.drawImage(smiley_good,305,105, 38, 38);

            ctx.drawImage(smiley_sad,     55,155, 38, 38);
            ctx.drawImage(smiley_sad,    105,155, 38, 38);
            ctx.drawImage(smiley_neutral,155,155, 38, 38);
            ctx.drawImage(smiley_neutral,205,155, 38, 38);
            ctx.drawImage(smiley_neutral,255,155, 38, 38);
            ctx.drawImage(smiley_neutral,305,155, 38, 38);

            ctx.drawImage(smiley_dead,  55,205, 38, 38);
            ctx.drawImage(smiley_dead, 105,205, 38, 38);
            ctx.drawImage(smiley_sad, 155,205, 38, 38);
            ctx.drawImage(smiley_sad, 205,205, 38, 38);
            ctx.drawImage(smiley_sad, 255,205, 38, 38);
            ctx.drawImage(smiley_sad, 305,205, 38, 38);

            ctx.drawImage(smiley_dead,  55,255, 38, 38);
            ctx.drawImage(smiley_dead, 105,255, 38, 38);
            ctx.drawImage(smiley_sad, 155,255, 38, 38);
            ctx.drawImage(smiley_sad, 205,255, 38, 38);
            ctx.drawImage(smiley_sad, 255,255, 38, 38);
            ctx.drawImage(smiley_sad, 305,255, 38, 38);
        };
        ctx.closePath();



        ctx.fillStyle = "rgba(168,9,29,0.5)";
        ctx.beginPath();
        ctx.fillRect(50, 0, 100, 300);

        ctx.fillStyle = "rgba(168,9,29,0.5)";
        ctx.beginPath();
        ctx.fillRect(50, 200, 300, 100);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = "rgba(68,250,56,0.4)";
        ctx.beginPath();
        ctx.fillRect(150, 0, 200, 200);
        ctx.fill();
        ctx.closePath();

        // xaxis>>>yaxis
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50,150);
        ctx.lineTo(350, 150);
        ctx.moveTo(200, 0);
        ctx.lineTo(200,300);
        ctx.stroke();
        ctx.closePath();


        // Now apply the data (to a new canvas layer)
        ktx.transform(1, 0, 0, -1, 0, canvas.height);
        const fills = [ '#fff06344','#fff063aa','#fff063bb',
                        '#fff063cc', '#fff063ee','#ffd651'];

        this.kelly_history.forEach( function(k, i) {
            ktx.fillStyle = fills[i];
            ktx.beginPath();
            ktx.arc(k.x, k.y, 8+(i*2), 0, 2 * Math.PI);
            ktx.fill();
            ktx.closePath();
        });
        ktx.strokeStyle = "#f9793b";
        ktx.lineWidth = 1;
        ktx.stroke();
        ktx.closePath();

// Commercial imitation prohibited by international IP law


    },
}

</script>

<style scoped>

</style>

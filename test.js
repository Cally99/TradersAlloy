let trades = [
    100, 20, 300, -400, 50, -50, 2000, 300, -270, 25, -100, 300, -50, -50, 100, 20, 300, 400, 50, -50, -270,
    25, -100, 300, -50, 200, 300, 400, -20, 200, 250, -100, 500,-100, 300, -50, 200, 300, 400, -20, 200, 250, -100, 500,
    -100, 300, -50, 200, 300, 400, -20, 200, 250, -100, 500, 600, 700, -100, 300, -50, 200, 300, 400, -20, 200, 250, -100, 500
];

let wins = 0;
let losses = 0;
let lossSum = 0;
let winSum = 0;

let sample = [];

for (let i=0; i<trades.length-1; i++) {
    if (trades[i] > 0){
        wins ++;
        winSum += trades[i];
    } else {
        losses ++;
        lossSum += trades[i];
    }
    // CHUNK INTO samples of 10... and add to
    if (i%10==0) {
        let avgWinSize = Math.round(winSum/wins);
        let avgLossSize = Math.round(lossSum/losses); //-620;

        let x = (wins/10)*300;
        let y = 0;
        if (avgWinSize > Math.abs(avgLossSize)) {
            y = ((avgWinSize) / Math.abs(avgLossSize)+2)*50;
        } else {
            y = ((((Math.abs(avgLossSize )/ avgWinSize) -1)*-1)+3)*50
        }
        sample.push({sampleX: Math.round(x), sampleY: Math.round(y) });
        wins = 0;
        winSum = 0;
        losses = 0;
        lossSum = 0;

    }
}


sample.forEach(s => {
    console.log(` point = (${s.sampleX}, ${s.sampleY}) `);
})


//console.log(`... ${wins} / ${losses}............... ${avgWinSize} vs. ${avgLossSize} `);
//console.log(` 2DKelly = (${x}, ${y}) `);



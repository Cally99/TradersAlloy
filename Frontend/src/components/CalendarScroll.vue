<template lang="pug">
    div(style="width:890px;")
        span(v-on:mousedown="moveScroll(-5)" v-on:mouseup="stopScroll()" v-on:mouseleave="stopScroll()"
            class="scroll-button")
            v-icon(large) mdi-arrow-left-drop-circle
        div(id="scroll-container" style="float:left;")
            slot
        span(v-on:mousedown="moveScroll(5)" v-on:mouseup="stopScroll()" v-on:mouseleave="stopScroll()"
            class="scroll-button"
            )
            v-icon(large) mdi-arrow-right-drop-circle
</template>

<script>
    export default {
        /* ToDo
        1. How to scroll partially (not extreme left or extreme right)

        2. BUG FIX RangeError: Maximum call stack size exceeded

        3. How to hide the buttons when scrolled to maximum ?

        computed: {
            showRightArrow: function () {
                const x = document.getElementById('scroll-container');
                console.log ('---',x.scrollLeft );
                return false;
            }
        },
        */
        data: {
            scrollMoving : '',
            stoppedScrollCnt : 0,
        },
        methods:{
            moveScroll(dir) {
                const x = document.getElementById('scroll-container');
                this.scrollMoving = setInterval(function(){
                    var prevPos = x.scrollLeft;
                    x.scrollLeft += dir;
                    if(prevPos == x.scrollLeft) {
                        this.stoppedScrollCnt ++;
                        if(this.stoppedScrollCnt > 30) {
                            this.stoppedScrollCnt = 0;
                            if(dir > 0) {
                                x.scrollLeft = 0;
                            }
                            else {
                                x.scrollLeft = x.scrollWidth;
                            }
                        }
                    }
                    else {
                        this.stoppedScrollCnt = 0;
                    }
                }, 10);
            },
            stopScroll() {
                clearInterval(this.scrollMoving)
            }
        },
        mounted() {
            let x = document.getElementById('scroll-container');
            x.scrollLeft = x.scrollWidth;
        },
        beforeDestroy () {
            clearInterval(this.scrollMoving)
        },
    }
</script>

<style scoped>
    .scroll-button {
        position: relative;
        background: #E0E0E0;
        float: left;
        height: 130px;
        width: 45px;
    }

    .scroll-button > i {
        color: #C0C0C0;
        position:absolute;
        top: 0; bottom: 0; left: 0; right: 0;
        margin: auto;
        height: 20px;
    }
    .scroll-button:hover > i {
        color: #999999;
        cursor: pointer;
    }
    #scroll-container {
        display: inline-block;
        width:800px;
        overflow-x: auto;
        white-space: nowrap;
    }


</style>

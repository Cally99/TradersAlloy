<template lang="pug">
    div( v-show="showColorPicker" @mouseleave="closeColorPicker" class="color-picker-container")
        div( v-for="color in backgroundColors" @click="changeColor(color)" class="color-item" :class="(changedColor === null) ? (selectedColor === color) ? 'item-border' : '' : (changedColor === color) ? 'item-border' : ''" :style="`background:${color};`")
</template>

<script>
import ApiService from '@/Services/ApiService.js';
import Vue from 'vue';
import _ from 'lodash';

export default Vue.extend({
    name: 'ColorPicker',
    props: {
        selectedColor: String
    },
    data() {
        return {
            showColorPicker: false,
            clickedNote: null,
            changedColor: null,
            backgroundColors: ['#C2E0FC', '#C9FDCE', '#FFFFBA', '#FAE0BF', '#F4B6BB']
        };
    },
    methods: {
        setClickedNote(item) {
            this.clickedNote = item;
        },
        closeColorPicker() {
            this.showColorPicker = false;
            this.changedColor = null;
        },
        openColorPicker() {
            this.showColorPicker = true;
        },
        async changeColor(color) {
            this.changedColor = color;

            const diary_item_id = this.clickedNote.diary_item_id;
            const background = color;

            const colorUpdateObject = {
                diary_item_id,
                background
            };

            await ApiService.updateDiaryItem(colorUpdateObject);

            this.$store.commit('updateMapUserDiaryItem', Object.assign({}, colorUpdateObject, { key: 'background' }));

            this.$emit('updateChart');

            if(document.getElementById(this.clickedNote.stock_id) !== null) {
                let tempNotes = this.$store.getters["getMapUserDiary"].filter(item => item.stock_id === this.clickedNote.stock_id);
                const sortedTempNotes = _.orderBy(tempNotes, ['date_created', 'diary_item_id'], ['desc', 'desc']);
                const diaryElement = document.getElementById(this.clickedNote.stock_id);

                diaryElement.style.backgroundColor = (sortedTempNotes[0].background).trim();
            }
        }
    }
})
</script>

<style scoped>
.color-picker-container {
    position: fixed;
    background: white;
    padding-left: 4px;
    padding-top: 4px;
    padding-bottom: 4px;
    border: 1px solid;
    z-index: 1000;
}

.color-item {
    float: left;
    width: 20px;
    height: 20px;
    margin-right: 4px;
}

.item-border {
    border: 1px solid;
}
</style>

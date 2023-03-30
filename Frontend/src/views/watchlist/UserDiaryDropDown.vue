<template lang="pug">
    div(class="pt-2")
        div(v-if="models.length == 0" @click="showDropDown=true")
            span(class="ma-1 font-italic font-sm" style="font-size: .8rem;color: #00a1ff;") {{ $t('watchlist_add_new_notes') }}
        div(style="cursor:pointer; " )
            div(v-if="models.length>0" @click="showDropDown=true" :style="(models[models.length-1].background) ? `background:${models[models.length-1].background}` : 'background:#FFFFBA;'")
                span  {{models[models.length-1].note}}
            div(v-if="showDropDown" class="dropDown p-2")
                div(class="d-flex align-center mb-1")
                    div(style="width:110px;") {{new Date().toISOString().slice(0,10)}}
                    input(type="text"
                        style="border:1px solid silver; width:100%;"
                        :style="(inputModel.background) ? `background:${inputModel.background};` : 'background:#FFFFBA;'"
                        name="newTag"
                        v-model="newNote"
                        @focus="closeColorPicker"
                        @keyup.enter="createDiaryItem"
                        @click="useColorPicker(inputModel, $event)"
                        placeholder="new journal entry...")

                div(v-for="item in models.slice().reverse()" :style="(item.background) ? `background:${item.background};` : 'background:#FFFFBA;'" class="d-flex  mb-1")
                    div(style="width:110px;") {{item.date_created}}
                    div(@click="useColorPicker(item, $event)" class="ml-2" style="width:100%; cursor:pointer;") {{item.note}}

        ColorPicker( :selectedColor="selectedColor" ref="colorPicker")
</template>

<script>
import ColorPicker from '../../components/ColorPicker';
import ApiService from '@/Services/ApiService.js';
import _ from 'lodash';
import Vue from 'vue';

export default Vue.extend({
    name: 'UserDiaryDropDown',
    props: {
        // stock: Object
    },
    components: {
        ColorPicker
    },
    mounted() {
        if (this.params) {
            this.stock_id = this.params.data.stock_id;
        }
    },
    data: function() {
        return {
            selectedColor: null,
            backgroundColors: ["#C2E0FC", "#C9FDCE", "#FFFFBA", "#FAE0BF", "#F4B6BB"],
            stock_id: null,
            newNote: "",
            showDropDown: false,
            userId: JSON.parse(localStorage.getItem('user')).user_id,
            inputBackgroundColor: '#FFFFBA',
            inputItem : {
                background: "#FFFFBA",
                color: null,
                date_created: new Date().toISOString().slice(0,10),
                diary_item_id: -1,
                note: "",
                stock_id: null,
                user_id: null,
                y: null
            },
        }
    },
    methods: {
        closeColorPicker() {
            this.$refs.colorPicker.closeColorPicker();
        },
        useColorPicker(item, event) {
            this.$refs.colorPicker.openColorPicker();
            this.$refs.colorPicker.setClickedNote(item);

            const colorPickerElement = this.$refs.colorPicker.$el;
            const element = event.target;
            const rect = element.getBoundingClientRect();
            const bottom = rect.bottom;
            const left = rect.left;

            colorPickerElement.style.top = (bottom + window.pageYOffset) + "px";
            colorPickerElement.style.left = (left + 20) + "px";
            
            this.selectedColor = item.background.trim();
        },
        close(e) {
            if (!this.$el.contains(e.target)) {
                this.$refs.colorPicker.closeColorPicker();
                this.showDropDown = false;
            }
        },
        async createDiaryItem() {
            if(!this.newNote) {
                return;
            }

            this.models.push({
                date_created: new Date().toISOString().slice(0,10),
                note: this.newNote
            });

            try {
                const response = await ApiService.insertDiaryItem({
                    user_id: this.userId,
                    stock_id: this.stock_id,
                    note: this.newNote,
                    date_created: new Date().toISOString().slice(0,10),
                    background: this.inputModel.background
                });

                this.$store.commit("addMapUserDiaryItem", response.data);
                this.newNote="";
            } catch (error) {
                console.log(error.message);
            }
        },
    },
    computed: {
        models:   {
            get() { 
                let mapUserDiary = this.$store.getters["getMapUserDiary"].filter(item=> item.stock_id ==this.stock_id);

                mapUserDiary = _.orderBy(mapUserDiary, ["diary_item_id"], ["asc"]);

                return mapUserDiary;
            }
        },
        inputModel: {
            get() { 
                let mapUserDiary = this.$store.getters["getMapUserDiary"].find(item=> item.diary_item_id == -1);
                if (mapUserDiary) {
                    return mapUserDiary;
                } else {
                    let inputItem = {
                        background: "#FFFFBA",
                        color: null,
                        date_created: new Date().toISOString().slice(0,10),
                        diary_item_id: -1,
                        note: "",
                        stock_id: null,
                        user_id: null,
                        y: null
                    }
                    
                    return inputItem;
                }

            }
        }
    },
    created() {
        window.addEventListener('click', this.close)
    },
    beforeDestroy() {
        window.removeEventListener('click', this.close)
    }
})
</script>

<style scoped>
* {
    margin: 0;
    box-sizing: border-box;
}

body {
    font-family: "Helvetica Neue";
    background: #fafafa;
    padding: 10rem;
}

@media (max-width: 480px) {
    body {
        padding: 0;
    }
}

.dropDown {
    z-index: 10;
    position: fixed;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 5px 0 0 0 ;
    margin: -5px 0 0 40px;
    min-width: 460px;
    box-shadow: 10px 13px 48px -4px rgba(0,0,0,0.49);
    overflow-y: visible;
    cursor: default;
    -webkit-overflow-scrolling: touch;  /* what is this ? */
}

.emptyNote{
    opacity: 0;
}

.emptyNote:hover{
    color: #117a8b;
    opacity: 1;
}
</style>

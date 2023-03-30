export default {
    state: {
        noteBtn_clicked: false
    },
    getters: {
        getNoteBtn_clicked(state) {
            return state.noteBtn_clicked;
        }
    },
  
    mutations: {
        setNoteBtn_clicked(state, payload) {
            state.noteBtn_clicked = payload;
        }
    },
  
    actions: {},
  };
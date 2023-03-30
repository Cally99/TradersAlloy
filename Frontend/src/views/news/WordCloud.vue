<template lang="pug">
   vue-word-cloud(:words="formattedWords" :font-size-ratio="3" )  
</template>

<script>
import VueWordCloud from 'vuewordcloud';
export default {
  name: "WordCloud",
  components: {
    [VueWordCloud.name]: VueWordCloud,
  },
  props: ['words'],
  computed: {
    formattedWords() {
      let formattedWords = []
      this.words.forEach((word) => {
        formattedWords.push({
          text: word.tag,
          weight: word.frequency
        })
      })
      return formattedWords
    }
  }
}
</script>

<style>
</style>
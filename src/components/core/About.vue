<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-app-bar color="#00000e" dark>
        <v-app-bar-nav-icon><v-icon>fas fa-question</v-icon></v-app-bar-nav-icon>
        <v-toolbar-title>About</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-app-bar-nav-icon @click.stop="show = false"
          ><v-icon>close</v-icon></v-app-bar-nav-icon
        >
      </v-app-bar>
      <v-card-title primary-title>
        <div>
          <div class="body-1">
            <span
              ><b>COVID19 Impact</b> Test
            </span>
          </div>
        </div>
      </v-card-title>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["visible"],
  computed: {
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
        }
      }
    }
  }
};
</script>

<style scoped>
.v-card__text,
.v-card__title {
  word-break: normal !important;
}
</style>

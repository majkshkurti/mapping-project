<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-app-bar color="#00000e" dark>
        <v-app-bar-nav-icon
          ><v-icon>fas fa-question</v-icon></v-app-bar-nav-icon
        >
        <v-toolbar-title>About</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-app-bar-nav-icon @click.stop="show = false"
          ><v-icon>close</v-icon></v-app-bar-nav-icon
        >
      </v-app-bar>
      <v-card-title primary-title>
        <div>
          <div class="body-1">
            <div>
              <br />
              <p>
                This map outlines the social and economic impacts that COVID-19
                pandemic has made on the top global economies. With this
                interactive map the changes in GDP and unemployment over a
                period of 2019-2021 can be analyzed. It also gives the amount of
                money these governments have spent for the containment of this
                virus as well as to support their economy.
              </p>
              <br />
              <p>Developed by Syed, Alex and Majk</p>
              <span>
                <span>&#169;</span> 2021
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/majkshkurti/mapping-project" >
                  <i class="fab fa-github"></i
                ></a>
              </span>
            </div>
          </div>
        </div>
      </v-card-title>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['visible'],
  computed: {
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit('close');
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

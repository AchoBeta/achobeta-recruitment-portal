<script lang="ts" setup>
import { PropTypes } from "@/utils/type/propTypes";
defineOptions({
  name: "titleBlock",
});
const prop = defineProps({
  title: PropTypes.string.def("标题"),
});
</script>

<template>
  <div>
    <p class="title-p">{{ prop.title }}</p>
    <!-- <div class="title-border"></div> -->
  </div>
</template>

<style scoped>
.title-p {
  height: 2rem;
  border-left: 10px solid rgb(89, 68, 193);
  line-height: 2rem;
  font-size: 1.1rem;
  margin: 0;
  padding: 0 0 0 1vw;
}

.title-border {
  height: 1rem;
  width: 10px;
  background-color: green;
  position: relative;
  left: -2vw;
  top: -3.5rem;
}
</style>

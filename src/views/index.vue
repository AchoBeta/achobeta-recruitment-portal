<script lang="ts" setup>
import ActivitiesCard from "@/components/activitiesCard.vue";
import Introduce from "@/components/Introduce.vue";
import { useRouter } from "vue-router";
import processIntroduce from "@/components/processIntroduce.vue";
import navigationTop from "@/components/navigationTop.vue";
import { ref, onMounted } from "vue";
import { useStore } from "@/store/index";
import { getBatch } from "@/api/api";
import { cardType } from "@/utils/type/cardType";
import { batchType } from "@/utils/type/batchType.ts";
import scroollTo from "@/utils/scroollTo";
import { enCode } from "@/utils/URIProtect.ts";
import { useIdStore } from "@/store/idStore.ts";
import { toast } from "vue-sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type BatchCardType = {
  id: string;
  cardDescription: cardType;
};

const router = useRouter();
const storage = useStore();
const IdStore = useIdStore();

const batchCard = ref<BatchCardType[]>([
  {
    id: "1",
    cardDescription: {
      title: "暂无招新批次",
      content: "暂无招新批次",
      footer: "暂无招新批次",
    },
  },
]);

const carouselPhoto = [
  {
    class: "carousel-img",
    src: "/picture1.jpg",
    alt: "暂时无法接收图片",
  },
  {
    class: "carousel-img",
    src: "/picture2.jpg",
    alt: "暂时无法接收图片",
  },
  {
    class: "carousel-img",
    src: "/picture3.jpg",
    alt: "暂时无法接收图片",
  },
  {
    class: "carousel-img",
    src: "/picture4.jpg",
    alt: "暂时无法接收图片",
  },
];
const teamPhoto = [
  {
    class: "carousel-img",
    src: "/image2.png",
    alt: "暂时无法接收图片",
  },
  {
    class: "carousel-img",
    src: "/image4.png",
    alt: "暂时无法接收图片",
  },
  {
    class: "carousel-img",
    src: "/image3.png",
    alt: "暂时无法接收图片",
  },
];

const toApplication = (id: string, tit: string) => {
  console.log(tit); //活动标题
  IdStore.setBatchId(id); //为页面设置batchId，当在页面路由进行跳转or刷新时，确保可以BatchId不消失

  tit = enCode(tit);
  router.push({ path: "/resume", query: { title: tit } });
};

onMounted(() => {
  console.log(import.meta.url);
  scroollTo();
  // let state='暂无批次'
  getBatch(storage.token)
    .then((res) => {
      console.log(res);
      if (res.data.code == 200) {
        //如果成功，则注入进招新批次卡片的对象
        batchCard.value.shift(); //删除数组的默认初始值
        res.data.data.forEach((item: batchType) => {
          // if (item.isRun===true)
          //   state='已开启'
          // else
          //   state='未开启'
          batchCard.value.push({
            id: (item.id as number).toString(),
            cardDescription: {
              title: item.title,
              content: "招新届数" + item.batch,
              footer: "截至时间:" + item.deadline,
            },
          });
        });
      } else if (res.data.code == 2009) {
        //如果已失效
        console.log("无token");
        router.push("/login");
      } else toast.error(res.data.message);
    })
    .catch((err) => {
      console.log(err);
    });
});
</script>

<template>
  <navigationTop class="top"></navigationTop>
  <!-- Back to top button using Tailwind -->
  <button
    @click="scroollTo"
    class="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
    aria-label="回到顶部"
  >
    ↑
  </button>

  <div class="flex flex-col w-full min-h-screen bg-white/60">
    <!-- Main carousel -->
    <Carousel class="w-full h-[400px]" :opts="{ loop: true }">
      <CarouselContent>
        <CarouselItem v-for="item in carouselPhoto" :key="item.src">
          <img :class="item.class" :src="item.src" :alt="item.alt" />
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>

    <!-- Content sections -->
    <Introduce>
      <template #title>
        <div class="card-title">
          <p class="english-title">Recruitment activities</p>
          <p class="chinese-title">招新批次</p>
        </div>
      </template>
      <template #content>
        <activitiesCard
          v-for="item in batchCard"
          @toAnother="
            toApplication(item.id, item.cardDescription.title as string)
          "
          :cardMain="item.cardDescription"
        ></activitiesCard>
      </template>
    </Introduce>

    <Introduce>
      <template #title>
        <div class="card-title">
          <p class="english-title">Recruitment process</p>
          <p class="chinese-title"><b>招新流程</b></p>
        </div>
      </template>
      <template #content>
        <processIntroduce></processIntroduce>
      </template>
    </Introduce>

    <Introduce>
      <template #title>
        <div class="card-title">
          <p class="english-title">Team Introduction</p>
          <p class="chinese-title"><b>团队产品</b></p>
        </div>
      </template>
      <template #content>
        <!-- Team carousel with card effect -->
        <Carousel
          class="w-full h-[240px]"
          :opts="{
            loop: true,
            align: 'center',
          }"
        >
          <CarouselContent class="-ml-2 md:-ml-4">
            <CarouselItem
              v-for="item in teamPhoto"
              :key="item.src"
              class="pl-2 md:pl-4 basis-3/5"
            >
              <div class="p-1">
                <img
                  :class="item.class"
                  :src="item.src"
                  :alt="item.alt"
                  class="rounded-lg shadow-md"
                />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </template>
    </Introduce>
  </div>
</template>

<style scoped>
@font-face {
  font-family: JetBrains-ExtraBoldItalic;
  src: url("@/assets/ttf/JetBrainsMono-ExtraBoldItalic.ttf");
}

.top {
  z-index: 999;
  position: sticky;
  top: 0;
}

.float-button {
  z-index: 999;
}

.english-title {
  font-family: JetBrains-ExtraBoldItalic;
  font-size: 1.4rem;
  padding-left: 3%;
}

.layout {
  width: 100vw;
  height: auto;
  background-color: rgba(255, 255, 255, 0.612);
}

.chinese-title {
  font-family: "楷体";
  font-size: 1.5rem;
  font-weight: bold;
  padding-left: 3%;
}

.carousel-box {
  height: 400px;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-title {
  margin-top: 20px;
  margin-bottom: 10px;
}
</style>

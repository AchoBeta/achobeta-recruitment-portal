<script lang="ts" setup>

import processIntroduce from "@/components/processIntroduce.vue";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/store/index";
import { getBatch } from "@/api/api";
import { cardType } from "@/utils/type/cardType";
import { batchType } from "@/utils/type/batchType";
import scroollTo from "@/utils/scroollTo";
import { enCode } from "@/utils/URIProtect";
import { useIdStore } from "@/store/idStore";
import { toast } from "vue-sonner";
import type { CarouselApi } from "@/components/ui/carousel";
import { watchOnce } from "@vueuse/core";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BatchCardType = {
  id: string;
  cardDescription: cardType;
};

const router = useRouter();
const storage = useAuthStore();
const IdStore = useIdStore();

// 主轮播图缩略图功能
const emblaMainApi = ref<CarouselApi>();
const emblaThumbnailApi = ref<CarouselApi>();
const selectedIndex = ref(0);

function onSelect() {
  if (!emblaMainApi.value || !emblaThumbnailApi.value)
    return;
  selectedIndex.value = emblaMainApi.value.selectedScrollSnap();
  emblaThumbnailApi.value.scrollTo(emblaMainApi.value.selectedScrollSnap());
}

function onThumbClick(index: number) {
  if (!emblaMainApi.value || !emblaThumbnailApi.value)
    return;
  emblaMainApi.value.scrollTo(index);
}

watchOnce(emblaMainApi, (emblaMainApi) => {
  if (!emblaMainApi)
    return;

  onSelect();
  emblaMainApi.on("select", onSelect);
  emblaMainApi.on("reInit", onSelect);
});

// 团队轮播图缩略图功能
const emblaTeamApi = ref<CarouselApi>();
const emblaTeamThumbnailApi = ref<CarouselApi>();
const selectedTeamIndex = ref(0);

function onTeamSelect() {
  if (!emblaTeamApi.value || !emblaTeamThumbnailApi.value)
    return;
  selectedTeamIndex.value = emblaTeamApi.value.selectedScrollSnap();
  emblaTeamThumbnailApi.value.scrollTo(emblaTeamApi.value.selectedScrollSnap());
}

watchOnce(emblaTeamApi, (emblaTeamApi) => {
  if (!emblaTeamApi)
    return;

  onTeamSelect();
  emblaTeamApi.on("select", onTeamSelect);
  emblaTeamApi.on("reInit", onTeamSelect);
});

// 图片预览功能
const isImagePreviewOpen = ref(false);
const previewImageSrc = ref('');
const previewImageAlt = ref('');

function openImagePreview(src: string, alt: string) {
  previewImageSrc.value = src;
  previewImageAlt.value = alt;
  isImagePreviewOpen.value = true;
}

function closeImagePreview() {
  isImagePreviewOpen.value = false;
}

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
  <div class="min-h-screen bg-background text-foreground">

    <!-- Hero Section with Enhanced Carousel -->
    <div class="w-full">
      <!-- Main Carousel -->
      <Carousel class="relative w-full h-[50vh] max-h-[600px]" :opts="{ loop: true }"
        @init-api="(val) => emblaMainApi = val">
        <CarouselContent>
          <CarouselItem v-for="(item, _) in carouselPhoto" :key="item.src">
            <div class="relative h-[50vh] max-h-[600px]">
              <img :src="item.src" :alt="item.alt" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent hero-overlay">
              </div>
              <!-- Hero Content Overlay -->
              <div class="absolute inset-0 flex items-center justify-center z-20">
                <div class="text-center text-white max-w-4xl px-6 drop-shadow">
                  <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                    AchoBeta
                  </h1>
                  <p class="text-xl md:text-2xl mb-8">
                    创新 · 协作 · 成长
                  </p>
                </div>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious
          class="left-4 md:left-6 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm carousel-nav" />
        <CarouselNext
          class="right-4 md:right-6 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm carousel-nav" />
      </Carousel>

      <!-- Thumbnail Carousel -->
      <div class="container mx-auto px-4 md:px-6 py-6">
        <Carousel class="relative w-full max-w-2xl mx-auto" :opts="{ loop: true, align: 'center' }"
          @init-api="(val) => emblaThumbnailApi = val">
          <CarouselContent class="flex gap-2 ml-0">
            <CarouselItem v-for="(item, index) in carouselPhoto" :key="item.src"
              class="pl-0 basis-1/2 sm:basis-1/3 md:basis-1/4 cursor-pointer" @click="onThumbClick(index)">
              <div class="p-1 transition-all duration-300"
                :class="index === selectedIndex ? 'scale-105' : 'opacity-60 hover:opacity-80'">
                <Card class="overflow-hidden border-2 transition-all duration-300"
                  :class="index === selectedIndex ? 'border-primary shadow-lg' : 'border-transparent'">
                  <CardContent class="p-0">
                    <img :src="item.src" :alt="item.alt" class="w-full transition-all duration-300" />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-16 space-y-24">
      <!-- Recruitment Activities Section -->
      <section id="recruitment-batches" class="relative">
        <div class="text-center mb-16">
          <div class="inline-block">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Recruitment Activities
            </h2>
            <div class="h-1 w-32 mx-auto mb-4"></div>
          </div>
          <p class="text-xl text-muted-foreground font-medium">招新批次</p>
        </div>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="item in batchCard" :key="item.id" class="group cursor-pointer"
            @click="toApplication(item.id, item.cardDescription.title as string)">
            <CardHeader class="pb-4">
              <CardTitle class="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                {{ item.cardDescription.title }}
              </CardTitle>
              <CardDescription class="text-muted-foreground">
                {{ item.cardDescription.content }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground mb-6">{{ item.cardDescription.footer }}</p>
              <div class="flex justify-end">
                <Button variant="outline" size="sm"
                  class="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                  查看详情
                  <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Recruitment Process Section -->
      <section id="recruitment-process" class="relative">
        <div class="text-center mb-16">
          <div class="inline-block">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Recruitment Process
            </h2>
            <div class="h-1 w-32 mx-auto mb-4"></div>
          </div>
          <p class="text-xl text-muted-foreground font-medium">招新流程</p>
        </div>

        <Card class="bg-gradient-to-br from-card to-secondary/20 border-0 shadow-xl process-card">
          <CardContent class="p-8">
            <processIntroduce />
          </CardContent>
        </Card>
      </section>

      <!-- Team Introduction Section -->
      <section class="relative">
        <div class="text-center mb-16">
          <div class="inline-block">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Team Introduction
            </h2>
            <div class="h-1 w-32 mx-auto mb-4"></div>
          </div>
          <p class="text-xl font-medium text-muted-foreground">团队产品</p>
        </div>

        <!-- Grid Layout -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card v-for="(item, _) in teamPhoto" :key="item.src" class="overflow-hidden cursor-pointer"
            @click="openImagePreview(item.src, item.alt)">
            <CardContent class="p-0 relative">
              <img :src="item.src" :alt="item.alt"
                class="w-full h-48 object-contain transition-transform duration-500 hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent team-overlay"></div>
              <!-- Click to enlarge hint -->
              <div
                class="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                点击放大
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>

    <!-- Footer Section -->
    <footer class="border-t py-16 mt-24">
      <div class="container mx-auto px-6 text-center">
        <h3 class="text-2xl font-bold mb-4">AchoBeta</h3>
        <p class="mb-8">创新技术，成就未来</p>
        <!-- <div class="flex justify-center space-x-6">
          <Button variant="ghost">
            关于我们
          </Button>
          <Button variant="ghost">
            联系方式
          </Button>
          <Button variant="ghost">
            加入我们
          </Button>
        </div> -->
      </div>
    </footer>

    <!-- Image Preview Modal -->
    <div v-if="isImagePreviewOpen"
      class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 modal-overlay"
      @click="closeImagePreview">
      <div class="relative max-w-[90vw] max-h-[90vh] p-4">
        <!-- Close Button -->
        <Button @click="closeImagePreview"
          class="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-background/20 border-border/30 text-foreground hover:bg-background/30 backdrop-blur-sm"
          size="icon" variant="outline">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>

        <!-- Preview Image -->
        <img :src="previewImageSrc" :alt="previewImageAlt"
          class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" @click.stop />
      </div>
    </div>
  </div>
</template>
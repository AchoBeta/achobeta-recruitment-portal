import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/index";
import { useIdStore } from "@/store/idStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      // 等待路由跳转完成后再滚动到锚点
      setTimeout(() => {
        const element = document.getElementById(to.hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      return { top: 0 }
    }
  },
  routes: [
    {
      path: "/",
      redirect: "/index",
    },
    {
      path: "/index",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "index",
          component: () => import("@/views/index.vue"),
        }
      ]
    },
    {
      path: "/person",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "person",
          component: () => import("@/views/person.vue"),
        }
      ]
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/login.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/activity/:batchId",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { title: "活动一览", requiresAuth: true },
      children: [
        {
          path: "",
          name: "activity",
          component: () => import("@/views/glanceActivities.vue"),
        }
      ]
    },
    // 新增：带 actId 的报名页路由
    {
      path: "/activities/:actId/application",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { title: "活动报名", requiresAuth: true },
      children: [
        {
          path: "",
          name: "activitiesApplication",
          component: () => import("@/views/activitiesApplication.vue"),
        }
      ]
    },
    {
      path: "/application",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { title: "活动报名", requiresAuth: true },
      // 旧路由兼容：如果存在 actId 则重定向到新路由
      beforeEnter: (_to, _from, next) => {
        const idStore = useIdStore();
        const actId = idStore.getActId();
        if (actId) {
          next({ name: "activitiesApplication", params: { actId } });
        } else {
          next();
        }
      },
      children: [
        {
          path: "",
          name: "application",
          component: () => import("@/views/activitiesApplication.vue"),
        }
      ]
    }, {
      path: "/process",
      name: "process",
      component: () => import("@/views/process.vue"),
      meta: { title: "流程介绍", requiresAuth: true },
    },
    {
      path: "/interview",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "interview",
          component: () => import("@/views/interview.vue"),
        }
      ]
    },
    {
      path: "/interviewDetailed",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "interviewDetailed",
          component: () => import("@/views/interviewDetailed.vue"),
        }
      ]
    },
    {
      path: "/activities/:actId/questionnaire",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "questionnaire",
          component: () => import("@/views/questionNaire.vue"),
        }
      ]
    },
    {
      path: "/questionNaire",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      // 旧路由兼容：如果存在 actId 则重定向到新路由
      beforeEnter: (_to, _from, next) => {
        const idStore = useIdStore();
        const actId = idStore.getActId();
        if (actId) {
          next({ name: "questionnaire", params: { actId } });
        } else {
          next();
        }
      },
      children: [
        {
          path: "",
          name: "questionNaire",
          component: () => import("@/views/questionNaire.vue"),
        }
      ]
    },
    {
      path: "/resume",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "resume",
          component: () => import("@/views/resume.vue"),
        }
      ]
    },
  ],
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);

  if (requiresAuth && !authStore.isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'login' });
  } else if (to.name === 'login' && authStore.isLoggedIn) {
    // 已登录用户访问登录页，重定向到首页
    next({ name: 'index' });
  } else {
    // 正常访问
    next();
  }
});

export default router;

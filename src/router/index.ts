import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/index";

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
      name: "index",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          component: () => import("@/views/index.vue"),
        }
      ]
    },
    {
      path: "/person",
      name: "person",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
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
      name: "activity",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { title: "活动一览", requiresAuth: true },
      children: [
        {
          path: "",
          component: () => import("@/views/glanceActivities.vue"),
        }
      ]
    },
    {
      path: "/application",
      name: "application",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { title: "活动报名", requiresAuth: true },
      children: [
        {
          path: "",
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
      name: "interview",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          component: () => import("@/views/interview.vue"),
        }
      ]
    },
    {
      path: "/interviewDetailed",
      name: "interviewDetailed",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          component: () => import("@/views/interviewDetailed.vue"),
        }
      ]
    },
    {
      path: "/questionNaire",
      name: "questionNaire",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          component: () => import("@/views/questionNaire.vue"),
        }
      ]
    },
    {
      path: "/resume",
      name: "resume",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
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

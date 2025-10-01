import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref<string>("");

    // 计算属性：登录状态
    const isLoggedIn = computed(() => !!token.value);

    function setToken(newToken: string) {
      token.value = newToken;
    }

    function clearToken() {
      token.value = "";
    }

    function logout() {
      clearToken();
      // 清理其他相关数据
      localStorage.removeItem("auth");
    }

    return {
      token,
      isLoggedIn,
      setToken,
      clearToken,
      logout,
    };
  },
  {
    persist: {
      key: "auth",
    },
  },
);

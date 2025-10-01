<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { emailLogin, sendCaptcha } from "@/api/api";
import { emailLoginType } from "@/utils/type/emailLoginType";
import { useAuthStore } from "@/store/index";
import { useIdStore } from "@/store/idStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "vue-sonner";

const pageHeight = ref(document.documentElement.scrollHeight);
const router = useRouter();
const storage = useAuthStore();
const idStore = useIdStore();
const emailForm = ref<emailLoginType>({
  login_type: "email",
  email_params: {
    email: "",
    emailCode: "",
  },
});
const isDisabled = ref<boolean>(false);

const sendCodeText = ref("获取验证码");
const timer = ref(60);

// const options=computed(()=>{
//   return ['@gmail.com', '@163.com', '@qq.com'].map((suffix) => {
//     const prefix = email.value.split('@')[0]
//     return {
//       label: prefix + suffix,
//       value: prefix + suffix
//     }
//   })
// })

function isValidEmail(email: string) {
  const emailRegex =
    /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  console.log(emailRegex.test(email));

  return emailRegex.test(email);
}

//发送验证码
const sendCode = () => {
  console.log(storage.token);

  //先验证手机号是否合规，然后再发送接口api，返回时才进行此处判断
  const email = emailForm.value.email_params.email;
  if (email != null && email != "") {
    if (isValidEmail(email)) {
      sendCaptcha(email)
        .then((res) => {
          console.log(res.data.code);
          if (res.data.code == 200) {
            toast.success("成功发送验证码！");
            countDown();
            isDisabled.value = true;
          } else {
            toast.warning(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.message);
        });
    } else {
      toast.error("您输入的邮箱格式不对");
    }
  } else {
    toast.error("请填写邮箱!!");
  }
};

const countDown = () => {
  const time = setInterval(() => {
    if (timer.value > 0) {
      sendCodeText.value = `${timer.value}秒后重新发送`;
      timer.value--;
    } else {
      clearInterval(time);
      resetTimer();
      isDisabled.value = false;
    }
  }, 1000);
};

const resetTimer = () => {
  sendCodeText.value = "获取验证码";
  timer.value = 60;
};

const login = () => {
  emailLogin(emailForm.value)
    .then((res) => {
      if (res.data.code === 200) {
        storage.setToken(res.data.data.access_token); //Client存储Token
        idStore.setEmail(emailForm.value.email_params.email as string);
        router.push("/");
      } else if (res.data.code == 2500) {
        toast.error("输入验证码错误");
        toast.warning(res.data.message);
      } else {
        toast.warning(res.data.message);
      }
    })
    .catch((err) => {
      console.log(err);
      toast.error(err.message);
    });
};

const watchHeight = () => {
  // document.body.style.height = `${pageHeight.value}px`           //使文档恢复初试页面高度
  // (document.getElementById("app") as HTMLElement).style.height = pageHeight.value + "px";
  const vh = pageHeight.value * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

onMounted(() => {
  window.addEventListener("resize", watchHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", watchHeight);
});

// 将 v-model 的 null 安全映射为字符串，避免类型错误
const emailValue = computed<string | number | undefined>({
  get: () => emailForm.value.email_params.email ?? "",
  set: (val) => {
    const v = typeof val === "string" ? val : val != null ? String(val) : "";
    emailForm.value.email_params.email = v;
  },
});

const emailCodeValue = computed<string | number | undefined>({
  get: () => emailForm.value.email_params.emailCode ?? "",
  set: (val) => {
    const v = typeof val === "string" ? val : val != null ? String(val) : "";
    emailForm.value.email_params.emailCode = v;
  },
});
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
    <Card class="mx-auto w-full sm:max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">
          登录
        </CardTitle>
        <CardDescription>
          请输入您的邮箱和验证码登录系统
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">邮箱</Label>
            <Input id="email" v-model="emailValue" type="email" placeholder="请输入邮箱" required />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="code">验证码</Label>
              <Button @click="sendCode" :disabled="isDisabled" variant="outline" size="sm" class="ml-auto">
                {{ sendCodeText }}
              </Button>
            </div>
            <Input id="code" v-model="emailCodeValue" placeholder="请输入验证码" required />
          </div>
          <div class="text-xs text-gray-500 text-center">
            无账号将自动注册
          </div>
          <Button @click="login" type="submit" class="w-full">
            登录
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* 使用 shadcn 官方样式，无需自定义CSS */
</style>

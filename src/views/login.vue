<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import navigationTop from "@/components/navigationTop.vue";
import { useRouter } from "vue-router";
import { emailLogin, sendCaptcha } from "@/api/api";
import { emailLoginType } from "@/utils/type/emailLoginType";
import { useStore } from "@/store/index";
import { useIdStore } from "@/store/idStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computed } from "vue";
import { toast } from "vue-sonner";

const pageHeight = ref(document.documentElement.scrollHeight);
const router = useRouter();
const storage = useStore();
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
  <navigationTop class="top" :pageHeight="pageHeight"></navigationTop>
  <div class="login-layout">
    <div class="flex-layout">
      <p class="login-tag">邮箱登录</p>
      <div>
        <p class="form-title">邮箱</p>
        <Input
          placeholder="请输入您的邮箱"
          class="email-input"
          v-model="emailValue"
        />
      </div>
      <div>
        <p class="form-title">验证码</p>
        <div class="captcha-flex flex justify-around items-end">
          <Input
            class="captcha"
            v-model="emailCodeValue"
            placeholder="请输入验证码"
          />
          <p
            :class="['captcha-tip', { disabled: isDisabled }]"
            @click="sendCode"
          >
            {{ sendCodeText }}
          </p>
        </div>
      </div>
      <Button
        variant="default"
        @click="login"
        class="button w-[90%] h-[calc(var(--vh,1vh)*6)] mx-[5%]"
        >登录</Button
      >
      <!-- <p class="tip">暂时只有网易、QQ的邮箱能使用哦😥</p> -->
    </div>
  </div>
</template>

<style scoped>
.top {
  z-index: 999;
  position: sticky;
  top: 0;
}

.login-layout {
  width: 100vw;
  height: calc(var(--vh, 1vh) * 6);
  background-color: rgb(255, 255, 255);
}

.flex-layout {
  height: calc(var(--vh, 1vh) * 90);
  width: 90vw;
  margin: 0 auto 0 5vw;
  font-family: "宋体";
}

.login-tag {
  margin: calc(var(--vh, 1vh) * 10) 0 0 0;
  font-weight: bold;
  font-size: 1.4rem;
}

.form-title {
  font-size: 1.1rem;
  margin: 0 0 0 3vw;
}

.email-input {
  border: none;
  outline: none;
  width: 80vw;
  margin: calc(var(--vh, 1vh) * 1) 5vw calc(var(--vh, 1vh) * 2) 5vw;
  padding: 0 0 calc(var(--vh, 1vh) * 1) 0;
  background-color: inherit;
  border-bottom-width: 2px;
  border-bottom-color: rgb(134, 128, 128);
  border-bottom-style: solid;
  font-size: 1rem;
}

/* .flex-layout :deep .n-input-wrapper{
  border:none!important;
  outline: none;
}
.flex-layout :deep .n-input__input{
  border:none!important;
  outline: none;
}
.flex-layout :deep .n-input__input-el{
  border:none!important;
  outline: none;
}
.flex-layout :deep .n-input{
  border:none!important;
  outline: none;
  background-color: inherit;
}
.flex-layout :deep .n-stateful{
  border-width: 0!important;
  outline: none;
  background-color: inherit;
}
.flex-layout :deep .n-auto-complete{
  border:none;
  outline: none;
  width: 90%;
  margin: 1vh 0 2vh 2vw;
  padding: 0 0 1vh 0;
  background-color: inherit;
  border-bottom-width:2px;
  border-bottom-color: rgb(134, 128, 128);
  border-bottom-style: solid;
  font-size: 1rem;
}
.flex-layout :deep .n-input--focus{
  outline: none!important;
} */
.captcha-flex {
  width: 80vw;
  margin: calc(var(--vh, 1vh) * 1) 5vw calc(var(--vh, 1vh) * 4) 5vw;
  border-bottom-color: rgb(178, 165, 165);
  border-bottom-style: solid;
  border-bottom-width: 2px;
}

.captcha {
  width: 50vw;
  border: none;
  outline: none;
  background-color: inherit;
  font-size: 1rem;
  padding: 0 0 calc(var(--vh, 1vh) * 1) 0;
  flex-grow: 1;
}

.captcha-tip {
  width: 20vw;
  padding: 0 2vw 0 0;
}

.button {
  width: 90%;
  height: calc(var(--vh, 1vh) * 6);
  margin: 0 5%;
}

.tip {
  margin: calc(var(--vh, 1vh) * 2) 0 0 1vw;
}

.disabled {
  width: 30vw;
  color: gray;
  pointer-events: none;
}

/*测试用 */
</style>

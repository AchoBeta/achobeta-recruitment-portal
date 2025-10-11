<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/store/index";
import { useIdStore } from "@/store/idStore";
import { getTemplate, getQuestion, submitQuestion } from "@/api/api";
import { toast } from "vue-sonner";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import type { timePeriod } from "@/utils/type/timePeriod";
import type { questionReceive } from "@/utils/type/questionReceive";
import Field from "@/components/ui/field/Field.vue";
import { FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import FieldLegend from "@/components/ui/field/FieldLegend.vue";

const router = useRouter();
const route = useRoute();
const storage = useAuthStore();
const idStore = useIdStore();

const actId = ref<string>("");
const isVisible = ref<boolean>(false);
const emptyMsg = ref<string>("");

const questions = ref<questionReceive[]>([]);
const timeOptions = ref<timePeriod[]>([]);

const schema = toTypedSchema(
  z.object({
    participationId: z.number(),
    answers: z.record(z.string(), z.string().optional()).default({}),
    periodIds: z.array(z.number()).default([]),
  })
);

const form = useForm({
  validationSchema: schema,
  initialValues: {
    participationId: 0,
    answers: {},
    periodIds: [],
  },
});

const loadData = async () => {
  const routeActId = route.params.actId as string | undefined;
  if (routeActId) {
    actId.value = routeActId;
    idStore.setActId(routeActId);
  } else if (idStore.getActId()) {
    actId.value = idStore.getActId() as string;
  } else {
    toast.warning("请先选择活动!!");
    isVisible.value = false;
    emptyMsg.value = "暂无活动问卷";
    return;
  }

  try {
    const draft = await getQuestion(actId.value, storage.token);
    const pid = draft.data?.data?.id;
    if (pid) form.setFieldValue("participationId", Number(pid));

    const draftQ = draft.data?.data?.questionAnswerVOS || [];
    const draftPeriods = draft.data?.data?.timePeriodVOS || [];

    if (draftQ.length) {
      questions.value = draftQ.map((it: any) => ({
        questionId: it.id,
        question: it.title,
        receive: it.answer ?? "",
      }));
      const ansObj: Record<string, string> = {};
      draftQ.forEach((it: any) => {
        ansObj[String(it.id)] = String(it.answer ?? "");
      });
      form.setFieldValue("answers", ansObj);
    }

    form.setFieldValue(
      "periodIds",
      draftPeriods.map((it: any) => Number(it.id))
    );

    const tpl = await getTemplate(actId.value, storage.token);
    const tplQs = tpl.data?.data?.questionVOS || [];
    const tplPeriods = tpl.data?.data?.timePeriodVOS || [];

    if (questions.value.length === 0 && tplQs.length) {
      questions.value = tplQs.map((it: any) => ({
        questionId: it.id,
        question: it.title,
        receive: "",
      }));
    }

    timeOptions.value = tplPeriods.map((it: any) => ({
      value: Number(it.id),
      label: `${it.startTime || ""} - ${it.endTime || ""}`,
    }));

    isVisible.value = questions.value.length > 0 || timeOptions.value.length > 0;
    if (!isVisible.value) {
      emptyMsg.value = "暂无活动问卷";
    }
  } catch (e) {
    console.log(e);
    toast.error("加载问卷失败");
    isVisible.value = false;
    emptyMsg.value = "加载失败";
  }
};

const togglePeriod = (id: number, checked: boolean) => {
  console.log(id, checked)
  const arr = (form.values.periodIds ?? []).slice()
  const has = arr.includes(id)
  if (checked && !has) arr.push(id)
  if (!checked && has) arr.splice(arr.indexOf(id), 1)
  form.setFieldValue("periodIds", arr)
  console.log(form.values.periodIds)
}

const onSubmit = form.handleSubmit(async (values) => {
  const payload = {
    participationId: values.participationId,
    questionAnswerDTOS: questions.value
      .filter((q) => q.questionId != null)
      .map((q) => ({
        questionId: q.questionId as number,
        answer: String(values.answers[String(q.questionId as number)] ?? ""),
      })),
    periodIds: Array.from(new Set(values.periodIds)).map((n) => Number(n)),
  };

  try {
    const res = await submitQuestion(storage.token, payload as any);
    if (res.data.code === 200) {
      toast.success("提交成功");
      router.push(`/activities/${actId.value}/application`);
    } else {
      toast.warning(res.data.message || "提交失败");
    }
  } catch (err) {
    console.log(err);
    toast.error("提交失败");
  }
});

onMounted(loadData);
</script>

<template>
  <div class="space-y-6 p-4">
    <div class="flex items-center gap-2">
      <Button variant="outline" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        返回</Button>
    </div>

    <Card v-if="!isVisible">
      <CardContent>
        {{ emptyMsg || '' }}
      </CardContent>
    </Card>

    <form v-else @submit="onSubmit" class="space-y-6">
      <Card>
        <CardContent class="space-y-6">
          <div v-for="(item, idx) in questions" :key="item.questionId ?? -1" class="space-y-2">
            <FormField v-slot="{ componentField }" :name="`answers.${item.questionId}`">
              <FormItem>
                <FormLabel>{{ item.question ?? '' }}</FormLabel>
                <FormControl>
                  <Textarea v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <Separator v-if="idx < questions.length - 1" />
          </div>

          <Separator />

          <!-- 对齐 shadcn-vue 文档的 FormField 用法，为 periodIds 提供表单上下文 -->
          <FormField v-slot="{ value }" name="periodIds">
            <FieldSet>
              <FieldLegend>时间段选择</FieldLegend>
              <FieldGroup>
                <Field v-for="opt in timeOptions" :key="opt.value" orientation="horizontal">
                  <Checkbox :id="`period-${opt.value}`" :modelValue="(value ?? []).includes(opt.value)"
                    @update:modelValue="(c: boolean | 'indeterminate') => togglePeriod(opt.value, c === true)" />
                  <FieldLabel :for="`period-${opt.value}`">{{ opt.label }}</FieldLabel>
                </Field>
              </FieldGroup>
              <FormMessage />
            </FieldSet>
          </FormField>
        </CardContent>
      </Card>

      <div class="flex justify-end">
        <Button type="submit">提交问卷</Button>
      </div>
    </form>
  </div>
</template>
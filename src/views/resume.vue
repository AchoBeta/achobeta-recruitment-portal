<script lang="ts" setup>
import { formType, attachmentList } from "@/utils/type/formType";
// import { PropTypes } from '@/utils/propTypes'
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import titleBlock from "@/components/titleBlock.vue";
import Add12Filled from "@vicons/fluent/Add12Filled";
import {
  submitResume,
  queryResume,
  uploadFileList,
  uploadPicture,
  resourcePreview,
  deleteResource,
} from "@/api/api";
import { useAuthStore } from "@/store/index";
import { toast } from "vue-sonner";
import { deCode } from "@/utils/URIProtect";
import { useIdStore } from "@/store/idStore";

// shadcn-vue imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

const pageHeight = ref(document.documentElement.scrollHeight);
const idStore = useIdStore();
const storage = useAuthStore();
const title = ref<string>("");
const batchId = ref<string>("");
const count = ref<number>(3);
const router = useRouter();
const params = useRoute().query;

const showModal = ref<boolean>(false);
const fileList = ref<any[]>([]);

let fileArr: File[] = []; //有值时才说明有新文件，没值则说明没有新文件（有旧文件和没有旧文件）
let picture: File | null = null;
let compareList: attachmentList[] = []; //用来对比是否有删附件资源
let fileListCode: attachmentList[] = []; //附件资源码
let pictureCode: number | null = null;
//资源上传的file表单类型
const pictureData = new FormData();
const fileListData = new FormData();

function isValidStudentId(studentId: string) {
  const inputRegex = /^20\d{8,11}$/;
  //符合条件(true)，则返回false；不符合条件(false)，则返回true
  return !inputRegex.test(studentId); //如果是数字，则返回false，不会进入判定
}
function isValidGrade(grade: number) {
  const inputRegex = /^\d{4}$/;
  return !inputRegex.test(grade.toString()); //如果是数字，则返回false，不会进入判定
}

function isValidEmail(email: string) {
  const emailRegex =
    /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  return !emailRegex.test(email);
}

function isValidPhone(phone: string) {
  const phoneRegex = /^\d{11}$/;
  return !phoneRegex.test(phone);
}

const gender = [
  {
    value: "0",
    label: "男",
  },
  {
    value: "1",
    label: "女",
  },
];

const form = ref<formType>({
  stuSimpleResumeDTO: {
    batchId: null, //招新批次
    studentId: null, //学号
    name: null, //姓名
    gender: null, //性别
    grade: null, //年级
    major: null, //专业
    className: null, //班级
    email: null, //邮箱
    phoneNumber: null, //phoneNumber
    reason: null, //加入AB的理由
    introduce: null, //简介
    experience: null, //经历
    image: null, //证件照
    awards: null, //获奖经历
    remark: null, //备注,
    stateCount: 999, //剩余可提交次数
  },
  stuAttachmentDTOList: [],
});

//删除附件列表中不需要的资源
const judgDelete = async function () {
  //先判断是否有删除曾经的
  //以对照附件表中的资源码为样本，对比fileListCode这个即将上传的附件资源码列表，查看即将上传的表中是否能找到对照表的码，不行则为删除
  for (const item of compareList) {
    const hasValue = fileListCode.some(
      (obj) => obj.attachment === item.attachment,
    );

    if (!hasValue) {
      //hasValue为true，说明有该值，即没被删掉;为false，则说明fileListCode里面没有item的值，已经在用户可视处删除了
      console.log("没错,这个资源已经被删掉了");
      await deleteResource(storage.token, item.attachment).then((res) => {
        console.log(res);
        if (res.data.code === 200) {
          //还要删附件列表
          console.log("成功删除"); //找被删去的资源码在表单数据中的下表
          toast.success("成功删除某个文件");
          const index = ((code: number) => {
            for (let i = 0; i < form.value.stuAttachmentDTOList.length; i++) {
              if (form.value.stuAttachmentDTOList[i].attachment === code) {
                console.log("找到应该被删除的附件下标" + i);
                form.value.stuAttachmentDTOList.splice(i, 1); //修改目前fileListCode的数组，删去附件列表中被删去的元素
                console.log(form.value.stuAttachmentDTOList);
                return i; // 返回找到的索引
              }
            }
            return -1; // 没找到返回 -1
          })(item.attachment);
          console.log(index);
        } else {
          toast.warning(res.data.message);
          showModal.value = false;
          console.log("动画关闭");
        }
      });
    }
  }
};

//上传图片资源函数
const uploadP = async function () {
  //如何判断是否重复上传 —— 不用判断是否重复上传了？直接覆盖？？
  await uploadPicture(storage.token, pictureData)
    .then((res) => {
      console.log(res);
      if (res.data.code === 200) {
        form.value.stuSimpleResumeDTO.image = res.data.data; //赋值
        console.log("第一次上传资源成功");
      } else {
        toast.warning(res.data.message);
        showModal.value = false;
        console.log("动画关闭");
      }
    })
    .catch((err) => {
      console.log(err); //出错就退出！
      showModal.value = false;
      console.log("动画关闭");
    });
};

//删除图片资源
const deleteP = async function (code: number) {
  await deleteResource(storage.token, code)
    .then((res) => {
      if (res.data.code === 200) {
        console.log("删除老资源成功");
      } else {
        toast.warning(res.data.message);
        showModal.value = false;
        console.log("动画关闭");
      }
    })
    .catch((err) => {
      console.log(err);
      showModal.value = false;
      console.log("动画关闭");
    });
};

//上传新增附件资源
const uploadNewList = async function () {
  toast.warning("进到上传资源函数咯");
  if (fileArr.length != 0) {
    //如果有新附件列表  （如何避免重复上传）
    //开始资源上传,先是附件列表
    console.log("有新增附件");

    await uploadFileList(storage.token, fileListData)
      .then((res) => {
        if (res.data.code === 200) {
          form.value.stuAttachmentDTOList = []; //将表单数据重置，之后操作统一赋值
          toast.success("返回资源码数组" + res.data.data.length);
          //赋值构造 ，将新的附件列表资源码返回到对象数组
          for (let i = 0; i < res.data.data.length; i++) {
            fileListCode.push({
              filename: fileArr[i].name,
              attachment: res.data.data[i],
            });
            console.log(res.data.data[i]);
          }
          //给简历附件列表数组推进新值
          fileListCode.forEach((item) => {
            form.value.stuAttachmentDTOList.push({
              filename: item.filename,
              attachment: item.attachment,
            });
          });
          console.log(form.value.stuAttachmentDTOList);
          console.log(fileListCode);
          toast.success("成功上传某个附件");
        } else {
          toast.warning(res.data.message);
          toast.warning("上传失败");
          showModal.value = false;
          console.log("动画关闭");
        }
      })
      .catch((err) => {
        console.log(err);
        showModal.value = false;
        console.log("动画关闭");
        toast.warning("上传失败");
        toast.warning(err.message);
      });
  } else {
    toast.error("资源数组为空");
  }
};

const submit = async () => {
  if (
    form.value.stuSimpleResumeDTO.name == null ||
    form.value.stuSimpleResumeDTO.name.trim() === ""
  ) {
    //姓名
    toast.error("请输入姓名");
    return;
  }
  if (
    form.value.stuSimpleResumeDTO.studentId == null ||
    form.value.stuSimpleResumeDTO.studentId.trim() === "" ||
    isValidStudentId(form.value.stuSimpleResumeDTO.studentId)
  ) {
    //学号
    toast.error("请输入20开头的11~13位的学号!");
    return;
  }
  if (form.value.stuSimpleResumeDTO.gender == null) {
    //性别
    toast.error("请选择性别");
    return;
  }
  if (
    form.value.stuSimpleResumeDTO.grade == null ||
    isValidGrade(form.value.stuSimpleResumeDTO.grade)
  ) {
    //年级
    toast.error("请输入20xx格式年级!");
    return;
  }
  if (
    form.value.stuSimpleResumeDTO.major == null ||
    form.value.stuSimpleResumeDTO.major.trim() === ""
  ) {
    //专业
    toast.error("请输入专业");
    return;
  }
  if (
    form.value.stuSimpleResumeDTO.className == null ||
    form.value.stuSimpleResumeDTO.studentId.trim() === ""
  ) {
    toast.error("班级");
    return;
  }
  if (
    form.value.stuSimpleResumeDTO.email == null ||
    form.value.stuSimpleResumeDTO.email.trim() === "" ||
    isValidEmail(form.value.stuSimpleResumeDTO.email)
  ) {
    toast.error("邮箱输入有误!");
    return;
  }
  if (
    form.value.stuSimpleResumeDTO.phoneNumber == null ||
    form.value.stuSimpleResumeDTO.phoneNumber.trim() === "" ||
    isValidPhone(form.value.stuSimpleResumeDTO.phoneNumber)
  ) {
    toast.error("请输入11位手机号!");
    return;
  }
  if (
    form.value.stuSimpleResumeDTO.reason == null ||
    form.value.stuSimpleResumeDTO.reason.trim() === ""
  ) {
    toast.error("请输入加入AB的理由");
    return;
  }
  if (
    form.value.stuSimpleResumeDTO.introduce == null ||
    form.value.stuSimpleResumeDTO.introduce.trim() === ""
  ) {
    toast.error("请输入简历");
    return;
  }
  if (
    form.value.stuSimpleResumeDTO.experience == null ||
    form.value.stuSimpleResumeDTO.experience.trim() === ""
  ) {
    toast.error("请输入经历");
    return;
  }
  // if(form.value.stuSimpleResumeDTO.image==null || form.value.stuSimpleResumeDTO.image.trim()===''){
  //   toast.error('请上传证件照')
  //   return
  // }
  if (
    form.value.stuSimpleResumeDTO.awards == null ||
    form.value.stuSimpleResumeDTO.awards.trim() === ""
  ) {
    toast.error("请完善获奖经历");
    return;
  }

  //加载动画
  showModal.value = true;
  console.log("打开动画");

  //判断是否有证件照
  if (
    (form.value.stuSimpleResumeDTO.image === null || pictureCode === null) &&
    picture === null
  ) {
    //返回值即没有图片，也没上传过图片
    toast.error("请上传证件照!");
    showModal.value = false;
    return;
  } else if (form.value.stuSimpleResumeDTO.image === null && picture != null) {
    //没有上传过照片，第一次上传证件照
    console.log("第一次上传证件照");

    //先上传图片，再判断是否需要删除附件资源
    uploadP()
      .then(() => judgDelete())
      .then(() => uploadNewList())
      .then(() => submitResume(storage.token, form.value))
      .then((res) => {
        console.log(res);
        if (res.data.code === 200) {
          toast.success("提交成功");
          if (count.value) count.value--;
          showModal.value = false;
          router.go(0);
        } else {
          toast.warning(res.data.message);
          showModal.value = false;
          console.log("动画关闭");
        }
      })
      .catch((err) => {
        console.log(err);
        showModal.value = false;
        console.log("动画关闭");
      });

    // //如何判断是否重复上传 —— 不用判断是否重复上传了？直接覆盖？？
    // await uploadPicture(storage.token,pictureData).then(res=>{
    //   console.log(res);
    //   if(res.data.code === 200){
    //     form.value.stuSimpleResumeDTO.image = res.data.data           //赋值
    //     console.log('第一次上传资源成功');

    //   }
    //   else{
    //     toast.warning(res.data.message)
    //     showModal.value = false
    //   }
    // }).catch(err=>{
    //   console.log(err);                  //出错就退出！
    //   showModal.value = false
    // })
  } else if (form.value.stuSimpleResumeDTO.image != null && picture != null) {
    console.log("有新资源上传,删除老资源");
    //先上传图片，再判断是否需要删除附件资源
    deleteP(form.value.stuSimpleResumeDTO.image)
      .then(() => uploadP())
      .then(() => judgDelete())
      .then(() => uploadNewList())
      .then(() => submitResume(storage.token, form.value))
      .then((res) => {
        console.log(res);
        if (res.data.code === 200) {
          toast.success("提交成功");
          if (count.value) count.value--;
          showModal.value = false;
          router.go(0);
        } else {
          toast.warning(res.data.message);
          showModal.value = false;
          console.log("动画关闭");
        }
      })
      .catch((err) => {
        console.log(err);
        showModal.value = false;
        console.log("动画关闭");
      });
    // await deleteResource(storage.token,form.value.stuSimpleResumeDTO.image).then(res=>{
    //   if(res.data.code === 200){
    //     console.log('删除老资源成功');
    //   }
    //   else{
    //     toast.warning(res.data.message)
    //     showModal.value = false
    //   }
    // }).catch(err=>{
    //   console.log(err);
    //   showModal.value = false
    // })

    // //上传新的证件照
    // await uploadPicture(storage.token,pictureData).then(res=>{
    //   console.log(res);
    //   if(res.data.code === 200){
    //     form.value.stuSimpleResumeDTO.image = res.data.data           //赋值
    //     console.log('新证件照上传成功');
    //   }
    //   else{
    //     toast.warning(res.data.message)
    //     showModal.value = false
    //   }
    // }).catch(err=>{
    //   console.log(err);                  //出错就退出！
    //   showModal.value = false
    // })
  } else if (form.value.stuSimpleResumeDTO.image != null && picture === null) {
    judgDelete()
      .then(() => uploadNewList())
      .then(() => submitResume(storage.token, form.value))
      .then((res) => {
        console.log(res);
        if (res.data.code === 200) {
          toast.success("提交成功");
          if (count.value) count.value--;
          showModal.value = false;
          router.go(0);
        } else {
          toast.warning(res.data.message);
          showModal.value = false;
          console.log("动画关闭");
        }
      })
      .catch((err) => {
        console.log(err);
        showModal.value = false;
        console.log("动画关闭");
      });
  }

  // if(fileArr.length!=0){          //如果有新附件列表  （如何避免重复上传）
  // //开始资源上传,先是附件列表
  //   console.log('有新增附件');

  //   await uploadFileList(storage.token,fileListData).then(res=>{
  //     if(res.data.code === 200){
  //       form.value.stuAttachmentDTOList = []                //将表单数据重置，之后操作统一赋值
  //       //赋值构造 ，将新的附件列表资源码返回到对象数组
  //       for(let i=0 ; i<res.data.data.length;i++){
  //         fileListCode.push({
  //           filename:fileArr[i].name,
  //           attachment:res.data.data[i]
  //         })
  //         console.log(res.data.data[i]);

  //       }

  //       console.log(fileListCode);
  //     }
  //     else{
  //       toast.warning(res.data.message)
  //       showModal.value = false
  //     }

  //     //给简历附件列表数组推进新值
  //     fileListCode.forEach(item=>{
  //       form.value.stuAttachmentDTOList.push({
  //         filename:item.filename,
  //         attachment:item.attachment
  //       })
  //     })
  //     console.log(form.value.stuAttachmentDTOList);

  //   }).catch(err=>{
  //     console.log(err);
  //     showModal.value = false
  //   })
  // }

  // const upload = document.getElementById('upload');
  // console.log(upload.files);                         //upload可以接收到上传的图片，但是不清楚上传后又删除会怎样

  // judgDelete().then(()=>{
  //   // submitResume(storage.token,form.value).then(res=>{
  //   //   console.log(res);
  //   //   if(res.data.code===200){
  //   //     toast.success('提交成功')
  //   //     if(count.value)
  //   //       count.value--;
  //   //   }
  //   //   else{
  //   //     toast.warning(res.data.message)
  //   //     showModal.value = false
  //   //   }
  //   // }).catch(err=>{
  //   //   console.log(err);
  //   //   showModal.value = false
  //   // })
  // }).catch(err=>{
  //   console.log(err);
  //   showModal.value = false
  // })
};

const toActivities = () => {
  router.push({ path: "/activitiesLayout/activity" });
};

const toProcess = () => {
  router.push({ path: "/process" });
};

onMounted(() => {
  if (idStore.getBatchId() != null)
    //如果地址栏不为空
    batchId.value = idStore.getBatchId() as string;
  else {
    toast.error("请先选择你的招新批次!!!");
  }
  form.value.stuSimpleResumeDTO.batchId = parseInt(batchId.value as string); //将上个页面选择的id，送到当前页面作为不可更改批次使用
  title.value = deCode(params.title as string);

  queryResume(batchId.value as string, storage.token)
    .then((res) => {
      console.log(res);

      if (res.data.code === 200) {
        //如果200，且有简历上传过
        form.value.stuSimpleResumeDTO.batchId =
          res.data.data.stuSimpleResumeVO.batchId;
        form.value.stuSimpleResumeDTO.studentId =
          res.data.data.stuSimpleResumeVO.studentId;
        form.value.stuSimpleResumeDTO.name =
          res.data.data.stuSimpleResumeVO.name;
        form.value.stuSimpleResumeDTO.gender =
          res.data.data.stuSimpleResumeVO.gender;
        form.value.stuSimpleResumeDTO.grade =
          res.data.data.stuSimpleResumeVO.grade;
        form.value.stuSimpleResumeDTO.major =
          res.data.data.stuSimpleResumeVO.major;
        form.value.stuSimpleResumeDTO.className =
          res.data.data.stuSimpleResumeVO.className;
        form.value.stuSimpleResumeDTO.email =
          res.data.data.stuSimpleResumeVO.email;
        form.value.stuSimpleResumeDTO.phoneNumber =
          res.data.data.stuSimpleResumeVO.phoneNumber;
        form.value.stuSimpleResumeDTO.reason =
          res.data.data.stuSimpleResumeVO.reason;
        form.value.stuSimpleResumeDTO.introduce =
          res.data.data.stuSimpleResumeVO.introduce;
        form.value.stuSimpleResumeDTO.experience =
          res.data.data.stuSimpleResumeVO.experience;
        form.value.stuSimpleResumeDTO.image =
          res.data.data.stuSimpleResumeVO.image;
        form.value.stuSimpleResumeDTO.awards =
          res.data.data.stuSimpleResumeVO.awards;
        form.value.stuSimpleResumeDTO.remark =
          res.data.data.stuSimpleResumeVO.remark;
        form.value.stuSimpleResumeDTO.stateCount =
          res.data.data.stuSimpleResumeVO.submitCount;
        //将返回数据赋值给附件列表
        form.value.stuAttachmentDTOList = res.data.data.stuAttachmentVOList;
        //对照附件表也拿到了原本资源码
        compareList = res.data.data.stuAttachmentVOList;
        pictureCode = res.data.data.stuSimpleResumeVO.image;

        toast.success({
          title: "您已填写简历",
          content: "是否直接查看该批次活下的活动?",
          positiveText: "是",
          negativeText: "否",
          onPositiveClick: () => {
            toActivities();
          },
          onNegativeClick: () => { },
        });

        //如果有图片资源码
        if (form.value.stuSimpleResumeDTO.image != null) {
          resourcePreview(storage.token, form.value.stuSimpleResumeDTO.image)
            .then((res) => {
              fileList.value = [];
              //将二进制的utf8字符码转换为base64码去访问
              const src = `data: image/jpeg;base64,${btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), ""))}`;
              // const byteString = atob(src.split(',')[1]); // 解码 Base64
              // const mimeString = src.split(',')[0].split(':')[1].split(';')[0]; // 获取 MIME 类型

              // // 创建 Uint8Array
              // const ab = new Uint8Array(byteString.length);
              // for (let i = 0; i < byteString.length; i++) {
              //     ab[i] = byteString.charCodeAt(i);
              // }

              // // 创建 Blob
              // const blob = new Blob([ab], { type: mimeString });

              // // 创建 URL
              // const url = URL.createObjectURL(blob);
              // console.log(url);

              // fileList.value.push({
              //   id:'a',
              //   status:'finished',
              //   name:'一张照片',
              //   file:src
              // })

              //将图片添加到证件照元素中
              const imgContainer = document.getElementById("imgContainer");
              const img = document.getElementById("img");
              const icon = document.getElementById("icon");
              (imgContainer as HTMLElement).style.display = "block";
              (icon as HTMLElement).style.display = "none";
              (img as HTMLImageElement).src = src;
              // const p = document.createElement('img')
              // p.src = src
              // document.body.appendChild(p)
              // console.log(src);
            })
            .catch((err) => {
              console.log(err);
            });
        }

        if (form.value.stuAttachmentDTOList.length) {
          //如果附件列表有长度
          const files = form.value.stuAttachmentDTOList;
          files.forEach((item) => {
            fileList.value.push({
              id: item.attachment.toString(),
              status: "finished",
              name: item.filename,
            });
            fileListCode.push({
              filename: item.filename,
              attachment: item.attachment,
            });
          });
          console.log(fileListCode);
        }
      } else {
        //没填写过简历时
        toast.warning("请先填写简历");
        if (idStore.getEmail() != null) {
          //如果有邮箱
          form.value.stuSimpleResumeDTO.email = idStore.getEmail();
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
  window.addEventListener("resize", watchHeight);
});

watch(
  () => form.value.stuSimpleResumeDTO.stateCount,
  (New, old) => {
    console.log(old);
    if (New != null) count.value = 3 - New;
  },
);

//监听添加事件，实际文件为file+fileList
const beforeUploadPicture = (event: Event) => {
  const target = event.target as HTMLInputElement;
  console.log(target);

  if ((target.files as FileList).length) {
    //如果文件有长度，即有上传图片
    const imgContainer = document.getElementById("imgContainer");
    const img = document.getElementById("img");
    const icon = document.getElementById("icon");
    let imgUrl = "";

    //设置图片上传需要数据
    picture = (target.files as FileList)[0];

    (imgContainer as HTMLElement).style.display = "block";
    (icon as HTMLElement).style.display = "none";
    imgUrl = window.URL.createObjectURL(picture);
    (img as HTMLImageElement).src = imgUrl;

    pictureData.set("file", picture); //重新设置图片
  }
};

const delImage = () => {
  const imgContainer = document.getElementById("imgContainer");
  const img = document.getElementById("img");
  const icon = document.getElementById("icon");
  const upload = document.getElementById("upload");

  //删除图片
  (img as HTMLImageElement).src = "";
  //删除input内容
  (upload as HTMLInputElement).value = "";
  (imgContainer as HTMLElement).style.display = "none";
  (icon as HTMLElement).style.display = "inline-block";
  //删除设置的某个图片
  picture = null;
  pictureData.delete("file");
  pictureCode = null;
};
// const removeUploadPicture = (event)=>{
//   // picture = null
//   // pictureData.delete('file')
// }

// const controlModal = ()=>{
//   const del = document.getElementById('delImg');
//   console.log(del);

//   (del as HTMLElement).style.display = 'block';
//   (del as HTMLElement).style.fontSize = '20px';
// }

//监听添加事件，实际文件为file+fileList
const beforeUploadList = (data: {
  file: any;
  fileList: any[];
}) => {
  console.log(data.file);
  console.log(data.fileList);

  // fileArr = []

  // //区分新增的文件的文件与返回的文件 —— 是否有file属性
  // data.fileList.forEach(item=>{
  //   if(item.file != null){                //只返回有file，不会将曾经上传过后返回来的文件当作新的文件使用
  //     fileArr.push(item.file)
  //     console.log('推进');

  //   }
  // })

  //再添加新增文件
  fileArr.push(data.file.file as File);

  //先添加数组，再添加file（新文件）
  //保险起见，每次都先删除file键值，不选择直接覆盖
  fileListData.delete("file");
  //为表单数据逐个新增file进同一个键中，而不能使用set方法!!
  fileArr.forEach((item: File) => {
    fileListData.append("file", item);
  });
  // console.log(fileListData)
  console.log(fileArr);
};

//根据名字移除，如果移除的元素有file，那么直接移除；如果没有，表明是曾经上传过的资源要移除，还需额外移除fileListCode
const removeUploadList = async (data: {
  file: any;
  fileList: any[];
}) => {
  let newfile = [];
  console.log(fileListCode);
  newfile = data.fileList.filter((item: any) => {
    //当附件列表只有一个附件的时候？？
    console.log(item);

    if (item.file === null && data.file.name == item.name) {
      //如果是要删除的元素，且为曾经上传过的文件

      const index = ((code: number) => {
        for (let i = 0; i < fileListCode.length; i++) {
          if (fileListCode[i].attachment === code) {
            fileListCode.splice(i, 1); //修改目前fileListCode的数组，删去附件列表中被删去的元素
            return i; // 返回找到的索引
          }
        }
        return -1; // 没找到返回 -1
      })(Number(item.id));

      console.log(index);

      return (data.file as any).name != item.name;
    } else {
      return (data.file as any).name != item.name; //根据名字删除，得到一个根据名字区分的新数组
    }
  });
  //得到新的附件列表数组后

  //重新给表单数组赋值,只赋值有file的，说明是新增的
  fileArr = [];
  newfile.forEach((item) => {
    if (item.file != null) {
      fileArr.push(item.file);
    } else {
      console.log("这是上传过的文件");
    }
  });

  fileListData.delete("file");
  //为表单数据逐个新增file进同一个键中，而不能使用set方法!!
  fileArr.forEach((item: File) => {
    fileListData.append("file", item);
  });
  console.log(fileListCode);
  console.log(fileArr);
};

// 添加文件处理方法
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    files.forEach(file => {
      fileList.value.push({
        name: file.name,
        file: file
      });
      fileArr.push(file);
    });
    
    // 更新FormData
    fileListData.delete("file");
    fileArr.forEach((item: File) => {
      fileListData.append("file", item);
    });
  }
};

const removeFile = (index: number) => {
  const removedFile = fileList.value[index];
  fileList.value.splice(index, 1);
  
  // 从fileArr中移除对应文件
  const fileIndex = fileArr.findIndex(file => file.name === removedFile.name);
  if (fileIndex > -1) {
    fileArr.splice(fileIndex, 1);
  }
  
  // 更新FormData
  fileListData.delete("file");
  fileArr.forEach((item: File) => {
    fileListData.append("file", item);
  });
};

// 添加文件输入触发方法
const fileInput = ref<HTMLInputElement>();
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 添加拖拽上传处理方法
const handleFileDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (files) {
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
      fileList.value.push({
        name: file.name,
        file: file
      });
      fileArr.push(file);
    });
    
    // 更新FormData
    fileListData.delete("file");
    fileArr.forEach((item: File) => {
      fileListData.append("file", item);
    });
  }
};

// 添加文件大小格式化方法
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const watchHeight = () => {
  // document.body.style.height = `${pageHeight.value}px`           //使文档恢复初试页面高度
  // (document.getElementById("app") as HTMLElement).style.height = pageHeight.value + "px";
  const vh = pageHeight.value * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", watchHeight);
});
</script>

<template>
  <div class="resume-layout">
    <h1 class="header-description">
      {{ title }}
    </h1>
    <Button variant="outline" @click="toProcess" class="Resumeprocess">简历进度</Button>
    
    <form id="form" class="space-y-6 p-6">
      <titleBlock title="个人信息【必填】" class="title"></titleBlock>
      
      <!-- 证件照上传 -->
      <div class="form-item">
        <Label class="text-base font-medium">证件照 *</Label>
        <div class="content">
          <input type="file" id="upload" @change="beforeUploadPicture" accept="image/png,image/jpeg,image/jpg" />
          <div class="view">
            <div id="imgContainer">
              <img id="img" />
              <div id="img-mask">
                <span id="delImg" @click="delImage">×</span>
              </div>
            </div>
            <span id="icon">+</span>
          </div>
        </div>
      </div>

      <!-- 姓名 -->
       <div class="form-item">
         <Label for="name" class="text-base font-medium">姓名 *</Label>
         <Input 
            id="name"
            :model-value="form.stuSimpleResumeDTO.name || ''"
            @update:model-value="form.stuSimpleResumeDTO.name = $event as string"
            placeholder="请填写姓名" 
            class="width"
          />
        </div>

        <!-- 学号 -->
        <div class="form-item">
          <Label for="studentId" class="text-base font-medium">学号 *</Label>
          <Input 
            id="studentId"
            :model-value="form.stuSimpleResumeDTO.studentId || ''"
            @update:model-value="form.stuSimpleResumeDTO.studentId = $event as string"
            placeholder="11~13位学号" 
            class="width"
          />
        </div>

        <!-- 性别 -->
        <div class="form-item">
          <Label class="text-base font-medium">性别 *</Label>
          <RadioGroup 
            :model-value="form.stuSimpleResumeDTO.gender?.toString() || ''"
            @update:model-value="form.stuSimpleResumeDTO.gender = parseInt($event as string)"
            class="flex gap-4"
          >
            <div v-for="item in gender" :key="item.value" class="flex items-center space-x-2">
              <RadioGroupItem :value="item.value" :id="item.value" />
              <Label :for="item.value">{{ item.label }}</Label>
            </div>
          </RadioGroup>
        </div>

        <!-- 年级 -->
        <div class="form-item">
          <Label for="grade" class="text-base font-medium">年级 *</Label>
          <Input 
            id="grade"
            :model-value="form.stuSimpleResumeDTO.grade?.toString() || ''"
            @update:model-value="form.stuSimpleResumeDTO.grade = parseInt($event as string)"
            type="number"
            placeholder="20xx格式填写" 
            class="width"
          />
        </div>

        <!-- 专业 -->
        <div class="form-item">
          <Label for="major" class="text-base font-medium">专业 ( 乱填后果自负!! ) *</Label>
          <Input 
            id="major"
            :model-value="form.stuSimpleResumeDTO.major || ''"
            @update:model-value="form.stuSimpleResumeDTO.major = $event as string"
            placeholder="请填写专业" 
            class="width"
          />
        </div>

        <!-- 班级 -->
        <div class="form-item">
          <Label for="className" class="text-base font-medium">班级 ( 乱填后果自负!! ) *</Label>
          <Input 
            id="className"
            :model-value="form.stuSimpleResumeDTO.className || ''"
            @update:model-value="form.stuSimpleResumeDTO.className = $event as string"
            placeholder="请以班级+班号格式填写" 
            class="width"
          />
        </div>

        <!-- 邮箱 -->
        <div class="form-item">
          <Label for="email" class="text-base font-medium">邮箱 *</Label>
          <Input 
            id="email"
            :model-value="form.stuSimpleResumeDTO.email || ''"
            @update:model-value="form.stuSimpleResumeDTO.email = $event as string"
            type="email"
            placeholder="请填写常用邮箱" 
            class="width"
          />
        </div>

        <!-- 手机号 -->
        <div class="form-item">
          <Label for="phoneNumber" class="text-base font-medium">手机号 *</Label>
          <Input 
            id="phoneNumber"
            :model-value="form.stuSimpleResumeDTO.phoneNumber || ''"
            @update:model-value="form.stuSimpleResumeDTO.phoneNumber = $event as string"
            placeholder="请填写常用手机号" 
            class="width"
          />
        </div>

        <!-- 简介 -->
        <div class="form-item">
          <Label for="introduce" class="text-base font-medium">简介 *</Label>
          <Textarea 
            id="introduce"
            :model-value="form.stuSimpleResumeDTO.introduce || ''"
            @update:model-value="form.stuSimpleResumeDTO.introduce = $event as string"
            placeholder="请填写个人简介" 
            class="width min-h-[100px]"
          />
        </div>

        <!-- 经历 -->
        <div class="form-item">
          <Label for="experience" class="text-base font-medium">经历 *</Label>
          <Textarea 
            id="experience"
            :model-value="form.stuSimpleResumeDTO.experience || ''"
            @update:model-value="form.stuSimpleResumeDTO.experience = $event as string"
            placeholder="请填写个人经历" 
            class="width min-h-[100px]"
          />
        </div>

        <!-- 获奖经历 -->
        <div class="form-item">
          <Label for="awards" class="text-base font-medium">获奖经历 *</Label>
          <Textarea 
            id="awards"
            :model-value="form.stuSimpleResumeDTO.awards || ''"
            @update:model-value="form.stuSimpleResumeDTO.awards = $event as string"
            placeholder="请填写获奖经历" 
            class="width min-h-[100px]"
          />
        </div>

        <!-- 加入理由 -->
        <div class="form-item">
          <Label for="reason" class="text-base font-medium">加入理由 *</Label>
          <Textarea 
            id="reason"
            :model-value="form.stuSimpleResumeDTO.reason || ''"
            @update:model-value="form.stuSimpleResumeDTO.reason = $event as string"
            placeholder="请填写加入理由" 
            class="width min-h-[100px]"
          />
        </div>

        <!-- 备注 -->
        <div class="form-item">
          <Label for="remark" class="text-base font-medium">备注</Label>
          <Input 
            id="remark"
            :model-value="form.stuSimpleResumeDTO.remark || ''"
            @update:model-value="form.stuSimpleResumeDTO.remark = $event as string"
            placeholder="可选填备注" 
            class="width"
          />
       </div>

      <div class="space"></div>
      <titleBlock title="附件上传【选填】" class="title"></titleBlock>
      
      <!-- 文件上传区域 -->
      <div class="form-item">
        <Label class="text-base font-medium">附件</Label>
        <Card class="width">
          <CardContent class="p-6">
            <div class="relative">
              <div 
                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                @click="triggerFileInput"
                @dragover.prevent
                @drop.prevent="handleFileDrop"
              >
                <div class="mb-4">
                  <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <p class="text-gray-600 mb-2">点击上传文件或拖拽文件到此处</p>
                <p class="text-sm text-gray-400">支持多文件上传</p>
              </div>
              <input 
                ref="fileInput"
                type="file" 
                multiple 
                class="hidden"
                @change="handleFileUpload"
              />
            </div>
            
            <!-- 文件列表显示 -->
            <div v-if="fileList.length > 0" class="mt-6">
              <h4 class="text-sm font-medium text-gray-700 mb-3">已上传文件 ({{ fileList.length }})</h4>
              <div class="space-y-2">
                <div 
                  v-for="(file, index) in fileList" 
                  :key="index" 
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                      <p class="text-xs text-gray-500">{{ formatFileSize(file.file?.size || 0) }}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    @click="removeFile(index)"
                    class="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 按钮组 -->
      <div class="flex justify-center gap-4 pt-6">
        <Button @click="submit" class="px-8">提交简历</Button>
        <Button variant="outline" @click="toActivities" class="px-8">跳转活动</Button>
      </div>
      
      <p class="last-p text-center">
        目前还剩下<span class="important-span">{{ count }}</span>次可提交简历
      </p>
    </form>

    <!-- Loading Modal -->
    <Dialog :open="showModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>提交中...</DialogTitle>
        </DialogHeader>
        <div class="flex justify-center py-8">
          <div id="loader">
            <div id="shadow"></div>
            <div id="box"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.resume-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;
}

@media (min-width: 768px) {
  .resume-layout {
    padding: 3rem 2rem;
  }
}

.top {
  z-index: 999;
  position: sticky;
  top: 0;
}

.header-description {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

@media (min-width: 768px) {
  .header-description {
    font-size: 2.5rem;
    text-align: left;
    margin-left: 2rem;
  }
}

.content {
  position: relative;
  width: 200px;
  height: 200px;
  background-color: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.content:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

@media (min-width: 768px) {
  .content {
    width: 250px;
    height: 250px;
  }
}

.content input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.5rem;
}

#icon {
  display: inline-block;
  font-size: 2.5rem;
  color: #6b7280;
}

#imgContainer {
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: none;
  border-radius: 10px;
  overflow: hidden;
}

#imgContainer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#img-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

#delImg {
  display: block;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.8);
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

#imgContainer:hover #img-mask {
  opacity: 1;
}

.form-item {
  margin-bottom: 1.5rem;
}

.width {
  width: 100%;
  background-color: transparent;
}

.space {
  height: 1rem;
  margin: 1rem 0;
}

.last-p {
  text-align: center;
  padding: 2rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.important-span {
  font-weight: 700;
  color: #ef4444;
}

.title {
  margin: 2rem 0 1.5rem 0;
}

.Resumeprocess {
  margin: 1rem 0 0 0;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

@media (min-width: 768px) {
  .Resumeprocess {
    top: 2rem;
    right: 2rem;
  }
}

/* 表单容器样式 */
#form {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

@media (min-width: 768px) {
  #form {
    padding: 3rem;
  }
}

/*测试 */
#loader {
  /* Uncomment this to make it run! */
  /*
     animation: loader 5s linear infinite; 
  */
  position: absolute;
  top: calc(50% - 20px);
  left: calc(50% - 20px);
}

@keyframes loader {
  0% {
    left: -100px;
  }

  100% {
    left: 110%;
  }
}

#box {
  width: 50px;
  height: 50px;
  background: #5aa1ff;
  animation: animate 0.5s linear infinite;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 3px;
}

@keyframes animate {
  17% {
    border-bottom-right-radius: 3px;
  }

  25% {
    transform: translateY(9px) rotate(22.5deg);
  }

  50% {
    transform: translateY(18px) scale(1, 0.9) rotate(45deg);
    border-bottom-right-radius: 40px;
  }

  75% {
    transform: translateY(9px) rotate(67.5deg);
  }

  100% {
    transform: translateY(0) rotate(90deg);
  }
}

#shadow {
  width: 50px;
  height: 5px;
  background: #000;
  opacity: 0.1;
  position: absolute;
  top: 59px;
  left: 0;
  border-radius: 50%;
  animation: shadow 0.5s linear infinite;
}

@keyframes shadow {
  50% {
    transform: scale(1.2, 1);
  }
}

body {
  background: #6997db;
  overflow: hidden;
}

h4 {
  position: absolute;
  bottom: 20px;
  left: 20px;
  margin: 0;
  font-weight: 200;
  opacity: 0.5;
  font-family: sans-serif;
  color: #fff;
}
</style>

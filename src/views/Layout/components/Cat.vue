<template>
  <div class="cat"></div>
</template>

<script>
const pathArr = [
  'https://unpkg.com/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json', // 黑色
  'https://unpkg.com/live2d-widget-model-tororo@1.0.5/assets/tororo.model.json', // 白色
];
export default {
  name: 'Cat',
  props: {
    currentColorItem: {
      type: Object, //
      default: null,
    },
    color: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // jsonPath: '../../../../public/json/tororo.model.json', // 加载模型的json路径
      config: {
        model: {
          hHeadPos: 0.5,
          vHeadPos: 0.618,
          jsonPath: pathArr[1], // 加载模型的json路径
        },
        display: {
          superSample: 2, // 超采样等级
          width: 350, // canvas的宽度
          height: 400, // canvas的高度
          position: 'left', // 显示位置：左或右
          hOffset: 170, // canvas水平偏移
          vOffset: 20, // canvas垂直偏移
        },
        mobile: {
          show: true, // 是否在移动设备上显示
          scale: 0.5, // 移动设备上的缩放
          motion: true, // 移动设备是否开启重力感应
        },
        react: {
          opacityDefault: 0.7, // 默认透明度
          opacityOnHover: 0.2, // 鼠标移上透明度
        },
        dialog: {
          enable: true, // 对话框
          hitokoto: true, //
        },
      },
    };
  },
  mounted() {
    this.getPath(this.currentColorItem);
  },
  watch: {
    currentColorItem: {
      deep: true,
      handler(v) {
        this.getPath(v);
      },
    },
  },
  methods: {
    getPath(v) {
      if (this.color) {
        if (this.color === '1') {
          this.config.model.jsonPath = pathArr[1];
        } else {
          this.config.model.jsonPath = pathArr[0];
        }
      } else {
        if (v.RGB.every((item) => item > 100)) {
          this.config.model.jsonPath = pathArr[1];
        } else {
          this.config.model.jsonPath = pathArr[0];
        }
      }
      this.$L2Dwidget.init(this.config);
    },
  },
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
</style>

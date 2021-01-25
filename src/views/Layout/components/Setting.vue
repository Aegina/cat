<template>
  <div class="setting">
    <el-popover placement="bottom" title="" width="270" trigger="click">
      <!-- <div class="setting-panel">
        <p class="setting-title">背景</p>
        <el-form ref="form1" :model="form1" label-width="80px">
          <el-form-item label="自动循环">
            <el-switch
              v-model="form1.autoPlay"
              :active-color="currentColorItem.hex"
              inactive-color="#f3f3f3"
              @change="handleChangePlayer"
            >
            </el-switch>
          </el-form-item>
        </el-form>
      </div> -->
      <div class="setting-panel">
        <p class="setting-title">操作</p>
        <el-form ref="form2" :model="form2" label-width="80px">
          <el-form-item label="猫咪颜色">
            <el-radio-group
              v-model="form2.catColor"
              @change="handleChangeColor"
            >
              <el-radio label="1">白色</el-radio>
              <el-radio label="2">黑色</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="搜索引擎">
            <el-radio-group
              v-model="form2.searchEngine"
              @change="handleChangeEngine"
            >
              <el-radio label="1">谷歌</el-radio>
              <el-radio label="2">百度</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <span class="setting-trigger el-icon-setting" slot="reference"></span>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'Setting',
  components: {},
  props: {
    currentColorItem: {
      type: Object,
      default: null,
    },
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      form1: {
        autoPlay: false,
      },
      form2: {
        catColor: '',
        searchEngine: '1',
      },
    };
  },
  computed: {
    catColor() {
      return this.currentColorItem.RGB.every((item) => item > 100) ? '1' : '2';
    },
  },
  watch: {
    catColor: {
      deep: true,
      immediate: true,
      handler(v) {
        this.form2.catColor = v;
        this.$emit('input', v);
      },
    },
  },
  methods: {
    getColor(v) {
      return v.RGB.every((item) => item > 100) ? 'white' : 'black';
    },
    // 改颜色
    handleChangeColor(v) {
      // 1 白色 2 黑色
      this.$emit('change', v);
    },
    // 改搜索引擎
    handleChangeEngine(v) {
      // 1 谷歌 2 百度
      this.$emit('changeEngine', v);
    },
    // 自动播放
    handleChangePlayer(v) {
      this.$emit('update:autoPlay', v);
    },
  },
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
.setting {
  position: fixed;
  left: 3vw;
  bottom: 3vw;
  .setting-trigger {
    font-size: 22px;
  }
}
</style>

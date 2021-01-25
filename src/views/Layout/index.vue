<template>
  <div
    class="container"
    v-if="currentColorItem"
    :style="{ background: currentColorItem.hex }"
    ref="downContainer"
    @contextmenu.prevent="$refs.menu.open"
    @mouseover="handleOverEvent"
    @mousemove="handleMoveEvent"
    @mouseleave="handleLeaveEvent"
  >
    <header
      class="header"
      data-html2canvas-ignore
      :style="{ background: currentColorItem.hex }"
    >
      <el-input
        v-model="content"
        placeholder=""
        prefix-icon="el-icon-search"
        ref="search"
        @keyup.enter.native="handleSearch"
      >
      </el-input>
    </header>

    <section class="sideBar" v-show="showSideBar">
      <transition name="el-fade-in-linear">
        <!-- 色板 -->
        <div
          class="color-container"
          :style="{ background: currentColorItem.hex }"
        >
          <div
            class="color-item"
            :style="{ 'border-color': color.hex }"
            v-for="color in colorList"
            :key="`${color.name}${color.hex}`"
            @click="handlClick(color)"
          >
            <span class="color-name" :style="{ color: color.hex }">{{
              color.name
            }}</span>
            <span class="color-graphic">
              <i
                v-for="(colorLine, i) in color.RGB"
                :key="color.name + color.hex + colorLine + i"
                :style="getColorLineStyle(colorLine, color.hex)"
                class="color-line"
              ></i>
            </span>
            <span class="color-pinyin">{{ formatHex(color.hex) }}</span>
          </div>
        </div>
      </transition>
    </section>

    <section class="main">
      <img src="../../assets/flower.png" class="trigger" alt="" srcset="" />
      <vue-p5 @setup="setup" @draw="draw"></vue-p5>
      <!-- <vue-p5 @setup="setup2" @draw="draw2"></vue-p5> -->
      <div class="main-content">
        <!-- <div class="color-name"></div> -->
        <div class="poem-content" v-if="poemData">
          <!-- <h1 class="poem-title">{{ poemData.title }}</h1> -->
          <p class="poem-auther">
            {{ poemData.author }} - {{ poemData.title }}
          </p>
          <div class="poem-text">{{ poemData.content }}</div>
        </div>
      </div>
    </section>
    <!-- <div class="wave-container"> -->
    <vue-p5
      class="wave-container"
      @setup="setupWave"
      @draw="drawWave"
      :key="key"
    ></vue-p5>
    <!-- </div> -->
    <vue-context ref="menu">
      <li v-for="item in specifications" :key="item.value">
        <a
          href="#"
          type="EXPORT"
          @click.prevent="handleContextMenu($event.target, exportDefault, item)"
          >导出为{{ item.label }}</a
        >
      </li>
    </vue-context>
    <cat :currentColorItem="currentColorItem" :color="currentColorName" />
    <Setting
      data-html2canvas-ignore
      :currentColorItem="currentColorItem"
      v-model="currentColorName"
      @change="handleChangeColor"
      @changeEngine="handleChangeEngine"
      :autoPlay.sync="autoPlay"
    />
  </div>
</template>

<script>
import { fetchColorFn } from '../../api';
import VueContext from 'vue-context';
import VueP5 from 'vue-p5';
import SansProFont from '../../assets/SourceSansPro-Regular.otf';
import { Mountain, Particle } from './wave';
import Cat from './components/Cat';
import Setting from './components/Setting';
const jinrishici = require('jinrishici');
const _Height = 70;
// 繁体字的月份
const FT_MONTH = {
  1: {
    ch: '壹',
    en: 'JAN',
  },
  2: {
    ch: '贰',
    en: 'FEB',
  },
  3: {
    ch: '叁',
    en: 'MAR',
  },
  4: {
    ch: '肆',
    en: 'APR',
  },
  5: {
    ch: '伍',
    en: 'MAY',
  },
  6: {
    ch: '陆',
    en: 'JUN',
  },
  7: {
    ch: '柒',
    en: 'JULY',
  },
  8: {
    ch: '捌',
    en: 'AUG',
  },
  9: {
    ch: '玖',
    en: 'SEP',
  },
  10: {
    ch: '拾',
    en: 'OCT',
  },
  11: {
    ch: '拾壹',
    en: 'NOV',
  },
  12: {
    ch: '拾贰',
    en: 'DEC',
  },
};

export default {
  name: 'Layout',
  components: { VueContext, VueP5, Cat, Setting },
  data() {
    const [w_width, w_height] = [window.innerWidth, window.innerHeight];
    return {
      content: '',
      select: '1',
      showSideBar: false,
      autoPlay: false, // 默认关闭自动播放
      playTimer: null,
      colorList: [], // 色板值
      whiteList: [], // 白猫
      blackList: [], // 黑猫
      form: {
        content: '',
        specification: '',
      },
      currentColorItem: null,
      currentColorName: '',
      poemData: null, // 诗词内容
      specifications: [
        { label: 'PC', value: `${w_width}*${w_height}` },
        { label: 'iphone5/SE', value: '320*568' },
        { label: 'iphone6/7/8', value: '375*667' },
        { label: 'Pixel 2', value: '411*731' },
        { label: 'Galaxy S5', value: '360*640' },
      ],
      mountains: [],
      particles: [],
      currentLetter: [],
      waveSketch: null,
    };
  },
  computed: {
    currentMonth() {
      return FT_MONTH[new Date().getMonth() + 1];
    },
    currentColorList() {
      if (this.currentColorName) {
        return this.currentColorName === '1' ? this.whiteList : this.blackList;
      }
      return this.currentColorItem.RGB.every((item) => item > 100)
        ? this.whiteList
        : this.blackList;
    },
  },
  watch: {
    currentColorItem(v) {
      if (v) {
        this.key = v.hex;
      }
    },
    autoPlay(v) {
      // 开启自动播放 诗词切换 背景色切换
      if (v) {
        this.playBackground();
      } else {
        this.pauseBackground();
      }
    },
  },
  methods: {
    playBackground() {
      this.playTimer = setInterval(() => {
        this.loadPoem();

        const _randomIndex = Math.floor(
          Math.random() * Math.floor(this.currentColorList.length)
        );
        this.currentColorItem = this.currentColorList[_randomIndex];
      }, 5000);
    },
    pauseBackground() {
      clearInterval(this.playTimer);
    },
    // 搜索
    handleSearch() {
      const { content } = this;
      if (!content) {
        return;
      }
      // 跳往搜索引擎
      if (this.select === '2') {
        window.open(`https://www.baidu.com/s?wd=${content}`);
      } else {
        window.open(
          `https://www.google.com/search?q=${content}&rlz=1C1CHWL_zh-CNUS913US913&oq=${content}&aqs=chrome..69i57j0i30.1176j0j1&sourceid=chrome&ie=UTF-8`
        );
      }
    },
    handleContextMenu: (target, fn, item) => {
      const type = target.getAttribute('type');
      switch (type) {
        case 'EXPORT':
          fn(item);
          break;
        default:
      }
    },
    exportDefault(item) {
      setTimeout(() => {
        const [width, height] = item.value.split('*');
        // const ignore = this.$refs.search.$el;
        // const downZoom = this.$refs.downContainer
        const downZoom = document.querySelector('body');
        // ignoreElements: (ele) => ele.id === 'search',
        this.$html2canvas(downZoom, {
          width,
          height,
          windowWidth: width,
          windowHeight: height,
        }).then((canvas) => {
          // 下载图片
          this.downloadImage(canvas.toDataURL('image/jpeg'), '导出图片');
        });
      }, 0);
    },
    downloadImage(url, fileName = '导出图片') {
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = url;
      fileName && tempLink.setAttribute('download', decodeURI(fileName));
      // 兼容：某些浏览器不支持HTML5的download属性
      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      }
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    },
    //   获取颜色数据
    async fetchColors() {
      const { data } = await fetchColorFn();
      this.colorList = data;
      this.whiteList = data.filter((item) => item.RGB.every((i) => i > 100));
      this.blackList = data.filter((item) => item.RGB.some((i) => i < 100));
      this.currentColorItem =
        data[Math.floor(Math.random() * Math.floor(data.length))];
      // 获取当前姓名拼音
      const letters = {
        0: ['J', 'W', 'Y', '@'],
        1: ['Y', 'Z', 'X', '@'],
        2: ['Z', 'Q', '@', '7'],
      };
      const currentLetterIndex = Math.floor(
        Math.random() * Math.floor(Object.keys(letters).length)
      );
      const currentLetter = letters[currentLetterIndex]
        ? letters[currentLetterIndex]
        : letters[2];
      this.currentLetter = currentLetter;
    },
    loadPoem() {
      jinrishici.load(
        (result) => {
          const { status, data } = result;
          if (status !== 'success') {
            this.$message.error(status);
            return;
          }
          this.poemData = { ...data.origin, content: data.content };
        },
        (err) => {
          console.error(err);
        }
      );
    },
    // 格式化颜色
    formatHex(color) {
      return color ? color.substring(1) : '000000';
    },
    // 格式话color-item
    getColorLineStyle(rgbVal, hexVal) {
      return {
        height: `${(rgbVal / 250) * _Height}%`,
        background: hexVal,
      };
    },
    // 颜色点击
    handlClick(color) {
      this.currentColorItem = color;
      // 重新渲染波浪部分
      this.waveSketch && this.waveSketch.redraw();
    },
    // p5相关部分
    setup(sketch) {
      // letters部分
      sketch.loadFont(SansProFont, (font) => {
        sketch.createCanvas(610, 150);
        // Set text characteristics
        sketch.textFont(font);
        sketch.textSize(30);
        sketch.textAlign('CENTER', 'CENTER');
      });
    },
    setup2(p) {
      // wave 部分
      p.createCanvas(p.windowWidth, p.windowHeight);
      this.growParticles(p);
      p.background(230);
    },
    setupWave(p) {
      // wave 部分
      p.createCanvas(p.windowWidth, p.windowHeight);

      this.growMountains(p);
      p.background(230);
    },
    draw(sketch) {
      sketch.background(this.currentColorItem.hex);

      // Set the gap between letters and the left and top margin
      let gap = 40;
      let margin = 15;
      sketch.translate(margin * 4, margin * 4);

      // 爱心部分  start
      // 画线条颜色
      const [r, g, b] = this.currentColorItem.RGB;
      sketch.stroke(r + 10, g + 15, b + 30);
      // 画区域
      sketch.bezier(30, 30, 45, 10, 55, 40, 30, 50);
      sketch.bezier(30, 30, 15, 10, 5, 40, 30, 50);

      // 爱心部分 end

      // Set the counter to start at the character you want
      // in this case 35, which is the # symbol
      let counter = 48;
      const [width, height] = [610, 150];

      // Loop as long as there is space on the canvas
      for (let y = 0; y < height - gap; y += gap) {
        for (let x = 0; x < width - gap; x += gap) {
          // Use the counter to retrieve individual letters by their Unicode number
          const letter = sketch.char(counter);

          // Add different color to the vowels and other characters
          if (this.currentLetter.includes(letter)) {
            sketch.fill('#ed225d');
          } else {
            sketch.fill('rgba(255,255,255,0.1)');
          }

          // Draw the letter to the screen
          sketch.text(letter, x, y);

          // Increment the counter
          counter++;
        }
      }
    },
    draw2(p) {
      this.particles.forEach((m, i) => {
        m.createParticle(p, this.currentMonth.ch);
        m.moveParticle(p);
        m.joinParticles(this.particles.slice(i));
      });
    },
    drawWave(p) {
      this.waveSketch = p;
      p.background(this.currentColorItem.hex);
      this.mountains.forEach((m) => m.display(p));
    },
    // growMountains
    growMountains(p) {
      // const colorSelected = p.random(wavesColors);
      // const c = p.color(colorSelected.hex);
      const [r, g, b] = this.currentColorItem.RGB;
      const c = p.color(r + 10, g + 40, b + 50);

      new Array(5).fill(1).map((_, i) => {
        const a = 255 - 50 * i;
        c.setAlpha(a);
        const h = p.height - 50 * i;
        const m = new Mountain(c, h, p);
        this.mountains.push(m);
      });
    },
    // growParticles
    growParticles(p) {
      // an array to add multiple particles
      for (let i = 0; i < p.width / 20; i++) {
        this.particles.push(new Particle(p));
      }
    },
    // 鼠标滑入右侧宽200的时候显示右侧导航
    handleOverEvent() {},
    handleLeaveEvent() {
      this.showSideBar = false;
    },
    // 鼠标滑入右侧宽200的时候显示右侧导航
    handleMoveEvent(e) {
      const { showSideBar } = this;
      const distance = window.innerWidth - e.clientX;
      if (distance > 0 && distance < 200) {
        if (!showSideBar) {
          this.showSideBar = true;
        }
      } else {
        this.showSideBar = false;
      }
    },
    // 设置改颜色
    handleChangeColor(v) {
      this.currentColorName = v;
      if (v === '1') {
        // 白色
        const _index = Math.floor(
          Math.random() * Math.floor(this.whiteList.length)
        );

        this.currentColorItem = this.whiteList[_index];
      } else {
        // 黑色
        const _index = Math.floor(
          Math.random() * Math.floor(this.blackList.length)
        );
        this.currentColorItem = this.blackList[_index];
      }
    },
    // 更改搜索引擎
    handleChangeEngine(v) {
      this.select = v;
    },
  },
  created() {},
  mounted() {
    //   获取颜色值
    this.fetchColors();
    // 获取诗词内容
    this.loadPoem();
  },
};
</script>
<style lang="scss" scoped>
@import '~vue-context/src/sass/vue-context';
//@import url(); 引入公共css类
.container {
  height: 100%;
}
.main-content {
  > div {
    display: inline-block;
  }
}

.main {
  position: absolute;
  // transform: translate(-50%, 0%);
  left: 15vw;
  top: 0vw;
  text-align: center;
  opacity: 0.8;
  word-break: keep-all;
  display: flex;
  flex-direction: row-reverse;
  padding-top: 120px;
}
.header {
  position: absolute;
  top: 4vw;
  left: 4vw;
  z-index: 999;
}
.sideBar {
  width: 200px !important;
  padding: 10px;
  overflow-y: auto;
  background: rgba(255, 250, 250, 0.2);
  position: absolute;
  right: 0;
  bottom: 0;
  top: 0;
  box-shadow: 10px 5px 5px rgba(255, 250, 250, 0.2);
}
.trigger {
  position: relative;
  z-index: 9;
  left: 10%;
  top: 60px;
  width: 30px;
  height: 30px;
}

.color-item {
  border-top: 5px solid;
  display: inline-block;
  display: inline-block;
  width: 60px;
  text-align: center;
  height: 100px;
  margin: 0 6px 6px 0;
  cursor: pointer;
  > span {
    position: relative;
    height: 100%;
    float: left;
    writing-mode: tb-rl;
  }
  .color-graphic {
    display: grid;
    grid-template-columns: 33%;
    width: 20px;
  }
  .color-line {
    position: relative;
    z-index: 2;
    width: 4px;
    &::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100px;
      content: '';
      display: inline-block;

      background: rgba(255, 255, 255, 0.1);
    }
  }
}
// .color-item + .color-item {
//   margin: 0 6px 6px 0;
// }
.customize-name {
  font-family: 'FZXiJinLJW';
  font-size: 100px;
  writing-mode: vertical-lr; /*从左向右 从右向左是 writing-mode: vertical-rl;*/
  writing-mode: tb-lr; /*IE浏览器的从左向右 从右向左是 writing-mode: tb-rl；*/
}
.poem-content {
  font-family: 'LiXuKeShuFa';
  // font-family: 'FZXiJinLJW';
  font-size: 40px;
  text-align: center;
  writing-mode: vertical-lr; /*从左向右 从右向左是 writing-mode: vertical-rl;*/
  writing-mode: tb-lr; /*IE浏览器的从左向右 从右向左是 writing-mode: tb-rl；*/
  margin-top: 50px;
  .poem-auther {
    width: 30px;
    font-size: 22px;
    overflow-wrap: break-word;
  }
  .poem-text {
    width: 45px;
    overflow-wrap: break-word;
  }
}
</style>

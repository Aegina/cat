<script>
export default {
  name: 'CatScript',
  render(h) {
    return h('script', {
      attrs: {
        type: 'text/javascript',
        src: this.src,
      },
      on: {
        load: (event) => {
          this.$emit('load', event);
        },
        error: (event) => {
          this.$emit('error', event);
        },
        readystatechange: (event) => {
          if (this.readyState == 'complete') {
            this.$emit('load', event);
          }
        },
      },
    });
  },
  src: {
    type: String,
    required: true,
  },
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
</style>

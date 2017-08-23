<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      listenScroll: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
      }
    },
    mounted () {
      this.$nextTick(() => {
        this._initScroll()
      })
    },
    methods: {
      _initScroll () {
        // 这里算是一个边界考虑了，因为BS初始化的时候，dom为空的时候会报错。
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
        // 会派发scroll事件，派发时机取决于probeType
        if (this.listenScroll) {
          this.scroll.on('scroll', (pos) => {
            this.$emit('scroll', pos)
          })
        }
      },
      disable () {
        this.scroll && this.scroll.disable()
      },
      enable () {
        this.scroll && this.scroll.enable()
      },
      refresh () {
        this.scroll && this.scroll.refresh()
      },
      scrollTo () {
        this.scroll && this.scroll.scrollTo(...arguments)
      },
      scrollToElement () {
        this.scroll && this.scroll.scrollToElement(...arguments)
      }
    },
    watch: {
      data () {
        // 这里监听data变化，但是BS是需要DOM变化，所以需要进行个nextTick
        this.$nextTick(() => {
          this.refresh()
        })
      }
    }
  }
</script>

<style lang="stylus" scoped>
</style>
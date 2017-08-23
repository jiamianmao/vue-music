<template>
  <div class="slider" ref='slider'>
    <div class="slider-group" ref='sliderGroup'>
      <slot></slot>
    </div>
    <div class="dots">
      <span class='dot' v-for='item of dots' :class='{active: currentPageIndex === item}'>
      </span>
    </div>
  </div>
</template>

<script>
import { addClass } from '@/common/js/dom'
import BScroll from 'better-scroll'

export default {
  // 这里给组件预留了三个控制接口
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  data () {
    return {
      dots: 0,
      currentPageIndex: 1
    }
  },
  // 在ＤＯＭ渲染好的时候再初始化BS，要不然会计算不出来正确高度
  // 但其实数据是异步的，并不能保证DOM已经加载完，需要注意的是，调用方的组件的数据因为是在created异步获取的
  // 那可能数据没请求到，就执行了这里的mounted，所以需要在调用方组件加上v-if使得数据get到再渲染这个组件
  mounted () {
    this.$nextTick(() => {
      this._setSliderWidth()
      // 这里需要注意的是，初始化dot要在BS之前，因为BS可能会克隆2份数据的
      this._initDots()
      this._initSlider()

      if (this.autoPlay) {
        this._play()
      }

      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        // 因为这里的resize的时候，BS是已经初始化过的，那么chilren的数量是已经多了2个的（在loop的情况下）
        // 那么此刻就不需要再去加两个sliderWidth了
        this._setSliderWidth(true)
      })
    })
  },
  methods: {
    // 因为是横向滚动，所以初始化的时候要计算sliderGourp的宽度
    _setSliderWidth (isResize) {
      // 因为这些都是外部传过来的，所以我们这里需要知道有多少个子元素
      this.children = this.$refs.sliderGroup.children

      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        // 因为我们需要给slider-item传入一个class来控制样式，但是该组件用的是个插槽，所以需要在这里来增加class
        addClass(child, 'slider-item')
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      // 如果loop（snapLoop）为true的时候，BS会在轮播图的前后各加一个slider-item来实现无缝滚动
      // 所以在计算的时候需要再加2个slider-item的宽度
      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initDots () {
      this.dots = this.children.length
    },
    _initSlider () {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: true,
        snapLoop: this.loop,
        snapThreshold: 0.3,
        snapSpeed: 400
        // click: true  BS的click是阻止了默认行为，自己派发了一个click，但是我们用了fastclick，所以会有问题
      })

      // 监听滚动结束的pageX 来添加active
      this.slider.on('scrollEnd', () => {
        let pageIndex = this.slider.getCurrentPage().pageX
        this.currentPageIndex = pageIndex

        // 这里是需要清掉之前的定时器的
        if (this.autoPlay) {
          clearTimeout(this.timer)
          this._play()
        }
      })
    },
    _play () {
      let pageIndex = this.currentPageIndex + 1
      this.timer = setTimeout(() => {
        this.slider.goToPage(pageIndex, 0, 400)
      }, this.interval)
    }
  },
  // 当组件中有定时器时，在销毁组件的时候记得清除以释放内存
  destroyed () {
    clearTimeout(this.timer)
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common/stylus/variable"

  .slider
    min-height: 1px
    position: relative
    overflow: hidden
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
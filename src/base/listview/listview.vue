<template>
  <scroll class='listview' :data='data' ref='listview' :listenScroll='listenScroll' @scroll='scroll' :probeType='probeType'>
    <ul>
      <li v-for='group of data' class='list-group' ref='listGroup'>
        <h2 class='list-group-title'>{{group.title}}</h2>
        <ul>
          <li v-for='item of group.items' class='list-group-item' @click='selectItem(item)'>
            <img class='avatar' v-lazy="item.avatar">
            <span class='name'>{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>

    <div class="list-shortcut" @touchstart.prevent='onShortcutTouchStart' @touchmove.prevent='onShortcutTouchMove'>
      <ul>
        <li v-for='(item, index) of shortcutList' class='item' :data-index='index' :class='{current: currentIndex === index}'>
          {{item}}
        </li>
      </ul>
    </div>
    <!-- 这里是个固定title -->
    <div class="list-fixed" v-show='fixedTitle' ref='fixed'>
      <h1 class='fixed-title'>{{fixedTitle}}</h1>
    </div>
    <div v-show='!data.length' class='loading-container'>
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
  import Scroll from '@/base/scroll/scroll'
  import { getData } from '@/common/js/dom'
  import Loading from '@/base/loading/loading'

  const LI_HEIGHT = 18
  const TITLE_HEIGHT = 30

  export default {
    // 这里在created声明touch 是因为touch数据需要在touchstart和touchmove间共享
    // 另外没有在data声明，是因为data和props的数据，vue都会自动添加getter和setter来监听数据变化
    // 但是我们这里不需要监听
    created () {
      this.touch = {}
      this.listHeight = []
      this.probeType = 3
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    data () {
      return {
        listenScroll: true,
        scrollY: -1,
        currentIndex: 0,
        diff: -1
      }
    },
    computed: {
      // 通过计算属性拿到title
      shortcutList () {
        return this.data.map((item) => {
          return item.title.substr(0, 1)
        })
      },
      fixedTitle () {
        if (this.scrollY > 0) {
          return ''
        }
        // 因为初始的时候 data是个空数组 所以要做个判断
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      // 因为这里DOM不够高，所以用不了BS，所以这里需要自己绑定touch事件咯
      onShortcutTouchStart (e) {
        // 这里直接用e.target是因为ul基本上和这些li一样大了，不用再做判断了e.target是li还是ul了
        let anchorIndex = getData(e.target, 'index')
        this.touch.y1 = e.touches[0].pageY
        this.touch.anchorIndex = anchorIndex
        // 处理start的边界bug
        if (anchorIndex !== null) {
          this._scrollTo(anchorIndex)
        }
      },
      onShortcutTouchMove (e) {
        this.touch.y2 = e.touches[0].pageY
        // 计算滑动了多少锚点
        let delta = (this.touch.y2 - this.touch.y1) / LI_HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        // 处理move的边界bug
        if (anchorIndex >= 0 && anchorIndex < this.data.length) {
          this._scrollTo(anchorIndex)
        }
      },
      scroll (pos) {
        this.scrollY = pos.y
      },
      selectItem (item) {
        this.$emit('select', item)
      },
      refresh () {
        this.$refs.listview.refresh()
      },
      _scrollTo (index) {
        // 因为右侧元素的高亮currentIndex是监听的BS派发的scroll事件
        // 而我们点击右侧元素只是调用了BS的scrollToElement方法，而没有影响scroll
        // 所以我们这里手动的设置scrollY
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      // 计算每一个listGroup的高度
      _calculateheight () {
        let listHeight = this.listHeight
        const list = this.$refs.listGroup
        let height = 0
        listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          listHeight.push(height)
        }
      }
    },
    watch: {
      data () {
        this.$nextTick(() => {
          this._calculateheight()
        })
      },
      // 通过监听scroll组件传过来的pos.y来实现联动
      scrollY (newY) {
        const listHeight = this.listHeight

        // 滚动到顶部
        if (newY > 0) {
          this.currentIndex = 0
          return
        }

        // 在中间滚动
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            // 这里是计算index + 1（滑动的）与fixedTitle：index的距离
            this.diff = height2 + newY
            return
          }
        }
        // 滚动到底部，且-newY大于最后一个元素的上限
        // 因为本来listHeight就比右侧元素多了1，现在求索引还需要再减1，即为减2
        this.currentIndex = listHeight.length - 2
      },
      diff (newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        // 这里是用来防止多次无谓操作DOM的
        // 高明之处在于fixedTop为0的第一次还是需要操作dom的
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style lang="stylus" scoped>
  @import "../../common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
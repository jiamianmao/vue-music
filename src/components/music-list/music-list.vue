<template>
  <div class="music-list">

    <div class="back">
      <i class="icon-back" @click='back'></i>
    </div>

    <h1 class='title'>{{title}}</h1>

    <div class="bg-image" :style='bgStyle' ref='bgImage'>
      <div class="play-wrapper">
        <div class="play" @click='random' v-show='songs.length > 0' ref='playBtn'>
          <i class='icon-play'></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref='filter'></div>
    </div>

    <div class="bg-layer" ref='layer'></div>

    <scroll @scroll='scroll' :probeType='probeType' :listenScroll='listenScroll' :data='songs' class='list' ref='list'>
      <div class="song-list-wrapper">
        <song-list :songs='songs' :rank='rank' @selectItem='selectItem'></song-list>
      </div>
      <div v-show='!songs.length' class='loading-container'>
        <!-- loading -->
        <loading></loading>
      </div>
    </scroll>

  </div>
</template>

<script>
  import SongList from '@/base/song-list/song-list'
  import Scroll from '@/base/scroll/scroll'
  import Loading from '@/base/loading/loading'
  import { mapActions } from 'vuex'
  import { playlistMixin } from '@/common/js/mixin'

  const RESERVED_HEIGHT = 40

  export default {
    mixins: [playlistMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        scrollY: 0
      }
    },
    created () {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted () {
      this.imageHeight = this.$refs.bgImage.clientHeight
      this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods: {
      back () {
        this.$router.back()
      },
      scroll (pos) {
        this.scrollY = pos.y
      },
      random () {
        this.randomPlay({
          list: this.songs
        })
      },
      selectItem (song, index) {
        // 点击后，改变播放状态，播放列表，顺序列表，全屏播放器，当前索引
        // 这里是播放的整个列表，而不是单个歌曲，所以把整个songs传进去
        // console.log(this.songs)
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      handlePlaylist (playList) {
        const bottom = playList.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      scrollY (newY) {
        let translateY = Math.max(this.minTranslateY, newY)
        let zIndex = 0
        let scale = 1
        let blur = 0
        this.$refs.layer.style['transform'] = `translate3d(0, ${translateY}px, 0)`

        const percent = Math.abs(newY / this.imageHeight)
        if (newY > 0) {
          scale = 1 + percent
          zIndex = 10
        } else {
          blur = Math.min(20 * percent, 20)
        }
        this.$refs.filter.style.backdrop = `blur(${blur}px)`
        if (newY < translateY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none'
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        this.$refs.bgImage.style.zIndex = zIndex
        this.$refs.bgImage.style.transform = `scale(${scale})`
      }
    },
    computed: {
      bgStyle () {
        return `background-image: url(${this.bgImage})`
      }
    },
    components: {
      SongList,
      Scroll,
      Loading
    }
  }
</script>
<style lang="stylus" scoped>
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
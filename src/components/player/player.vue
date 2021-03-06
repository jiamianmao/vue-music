<template>
  <div class="player" v-show='playList.length > 0'>
    <transition name='normal' @enter='enter' @after-enter='afterEnter' @leave='leave' @after-leave='afterLeave'>
      <div class="normal-player" v-show='fullScreen'>

        <div class="background">
          <img :src="currentSong.image" width='100%' height='100%'>
        </div>

        <div class="top">
          <div class="back" @click='back'>
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html='currentSong.name'></h1>
          <h2 class="subtitle" v-html='currentSong.singer'></h2>
        </div>

        <div class="middle" @touchstart.prevent='middleTouchStart' @touchmove.prevent='middleTouchMove' @touchend='middleTouchEnd'>

          <div class="middle-l" ref='middleL'>
            <div class="cd-wrapper" ref='cdWrapper'>
              <div class="cd" :class="cdCls">
                <img :src="currentSong.image" class="image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>

          <scroll class="middle-r" ref='lyricList' :data='currentLyric.lines'>
            <div class="lyric-wrapper">
              <div class="currentLyric">
                <p class="text" ref='lyricLine' v-for='(line, index) of currentLyric.lines' :class='{"current": currentLineNum === index}'>
                  {{ line.txt }}
                </p>
              </div>
            </div>
          </scroll>
        </div>

        <div class="bottom">
          <div class="dot-wrapper">
            <span class='dot' :class='{"active": currentShow === "cd"}'></span>
            <span class='dot' :class='{"active": currentShow === "lyric"}'></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ currentTime | format }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent='percent' @percentChange='onProgressBarChange'></progress-bar>
            </div>
            <span class="time time-r">{{ currentSong.duration | format}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click='changeMode'></i>
            </div>
            <div class="icon i-left" :class='disableCls'>
              <i class="icon-prev" @click='prev'></i>
            </div>
            <div class="icon i-center" :class='disableCls'>
              <i :class="playIcon" @click='togglePlaying'></i>
            </div>
            <div class="icon i-right" :class='disableCls'>
              <i class="icon-next" @click='next'></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>

      </div>
    </transition>

    <transition name='mini'>
      <div class="mini-player" v-show='!fullScreen' @click='open'>
        <div class="icon">
          <img :class='cdCls' :src="currentSong.image" width='40' height='40'>
        </div>
        <div class="text">
          <h2 class="name">{{currentSong.singer}}</h2>
          <p class="desc" v-html='currentSong.name'></p>
        </div>
        <div class='control'>
          <progress-circle :radius='radius' :percent='percent'>
            <i :class="miniIcon" @click.stop='togglePlaying' class='icon-mini'></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class='icon-playlist'></i>
        </div>
      </div>
    </transition>

    <audio ref='audio' :src="currentSong.url" @canplay='ready' @error='error' @timeupdate='updatetime' @ended='end'></audio>
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex'
  import animations from 'create-keyframe-animation'
  import ProgressBar from '@/base/progress-bar/progress-bar'
  import ProgressCircle from '@/base/progress-circle/progress-circle'
  import { playMode } from '@/common/js/config'
  import { shuffle } from '@/common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from '@/base/scroll/scroll'

  export default {
    data () {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentLyric: {},
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    created () {
      this.touch = {}
    },
    methods: {
      back () {
        this.setFullScreen(false)
      },
      open () {
        this.setFullScreen(true)
      },
      ready () {
        this.songReady = true
      },
      error () {
        // 防止当有歌曲无法canplay的时候，导致无法前进后退
        this.songReady = true
      },
      prev () {
        if (!this.songReady) {
          return
        }
        if (this.playList.length === 1) {
          // 当只有一首歌的时候，就是loop
          // this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            // 边界情况，第一首歌的时候 上一首就是最后一首歌
            index = this.playList.length - 1
          }
          this.setCurrentIndex(index)
          this.setPlayingState(true)
          this.songReady = false
        }
      },
      next () {
        if (!this.songReady) {
          return
        }
        if (this.playList.length === 1) {
          // 当只有一首歌的时候，就是loop
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playList.length) {
            // 边界情况，第一首歌的时候 上一首就是最后一首歌
            index = 0
          }
          this.setCurrentIndex(index)
          this.setPlayingState(true)
          this.songReady = false
        }
      },
      end () {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop () {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        this.currentLyric.seek(0)
      },
      enter (el, done) {
        // 获取初始位置
        const { x, y, scale } = this._getPositionScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        }

        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter (el) {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave (el, done) {
        this.$refs.cdWrapper.style.transition = 'all .4s'
        const { x, y, scale } = this._getPositionScale()
        this.$refs.cdWrapper.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`

        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave (el) {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style.transform = ''
      },
      togglePlaying () {
        this.setPlayingState(!this.playing)
      },
      updatetime (e) {
        this.currentTime = e.target.currentTime
      },
      onProgressBarChange (percent) {
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric.lines) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      changeMode () {
        const mode = (this.mode + 1) % 3
        this.setPlayMode(mode)
        let list = null
        if (mode === playMode.random) {
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        this._resetCurrentIndex(list)
        this.setPlayList(list)
      },
      getLyric () {
        this.currentSong.getLyric().then(lyric => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = {}
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric ({lineNum, txt}) {
        this.currentLineNum = lineNum
        if (lineNum > 6) {
          let lineEl = this.$refs.lyricLine[lineNum - 6]
          this.$refs.lyricList.scrollToElement(lineEl, 500)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 500)
        }
        this.playingLyric = txt
      },
      middleTouchStart (e) {
        this.touch.init = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
        console.log(1)
      },
      middleTouchMove (e) {
        if (!this.touch.init) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        // 维护Y轴的偏移是为了歌词那块的滑动是Y轴大于X轴 就不做处理 X轴大于Y轴的话 就左右滑动
        const deltaY = touch.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }

        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style.transition = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style.transition = 0
      },
      middleTouchEnd () {
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            this.currentShow = 'lyric'
            opacity = 0
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            opacity = 1
            this.currentShow = 'cd'
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style.transition = 'all 900ms'
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style.transition = 'all 900ms'
        this.touch.init = false
      },
      _resetCurrentIndex (list) {
        let index = list.findIndex((item) => {
          return this.currentSong.id === item.id
        })
        this.setCurrentIndex(index)
      },
      _getPositionScale () {
        // mini播放器的CD大小
        const targetWidth = 40
        // mini播放器圆心对左边栏的距离
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',
        setPlayList: 'SET_PLAYLIST'
      })
    },
    computed: {
      playIcon () {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon () {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdCls () {
        return this.playing ? 'play' : 'play pause'
      },
      disableCls () {
        return this.songReady ? '' : 'disable'
      },
      percent () {
        return this.currentTime / this.currentSong.duration
      },
      iconMode () {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      ...mapGetters([
        'fullScreen',
        'playList',
        'currentSong',
        'playing',
        'currentIndex',
        'mode',
        'sequenceList'
      ])
    },
    watch: {
      currentSong (newSong, oldSong) {
        if (newSong.id === oldSong.id) {
          return
        }
        // 因为我们在curretnSong的时候实例化了一个Lyric对象，这个对象会记录歌曲播放到的时间，
        // 那么在切歌的时候又实例化一个Lyric，就会有多个time，导致歌词跳跃
        // 所以在currentSong变化的时候，我们需要监听是否已经有实例化对象了，如果有的话，就停止time的记录
        if (this.currentLyric.lines) {
          this.currentLyric.stop()
        }
        /**
          *  此处有个 wechat 坑  当切到后台的时候  不运行js代码的
         */
        this.$nextTick(() => {
          this.$refs.audio.play()
          this.getLyric()
        })
      },
      playing (newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    filters: {
      format (interval) {
        interval = interval | 0
        let m = interval / 60 | 0
        let s = interval % 60
        m = m < 10 ? '0' + m : m
        s = s < 10 ? '0' + s : s
        return `${m}:${s}`
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0 auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
              margin-right: 5px
            &.time-r
              text-align: right
              margin-left: 5px
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
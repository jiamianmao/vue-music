<template>
  <div class="progress-bar" ref='progressBar' @click='progressClick'>
    <div class="bar-inner">
      <div class='progress' ref='progress'></div>
      <div class="progress-btn-wrapper" ref='progressBtn' @touchstart.prevent='progressTouchStart' @touchmove.prevent='progressTouchMove' @touchend='progressTouchEnd'>
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  const progressBarWidth = 16

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    data () {
      return {
      }
    },
    created () {
      this.touch = {}
    },
    methods: {
      progressTouchStart (e) {
        this.touch.init = true
        this.touch.startX = e.touches[0].pageX
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove (e) {
        if (!this.touch.init) {
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBarWidth, Math.max(0, this.touch.left + deltaX))
        this._offset(offsetWidth)
      },
      progressTouchEnd () {
        this.touch.init = false
        this._triggerPercent()
      },
      progressClick (e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        console.log(rect)
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        this._triggerPercent()
      },
      _triggerPercent () {
        const barWidth = this.$refs.progressBar.clientWidth - progressBarWidth
        const percent = this.touch.offsetWidth / barWidth
        this.$emit('percentChange', percent)
      },
      _offset (val) {
        this.$refs.progress.style.width = `${val}px`
        this.touch.offsetWidth = val
        this.$refs.progressBtn.style.transform = `translate3d(${val}px, 0, 0)`
      }
    },
    watch: {
      percent (newpercent) {
        if (newpercent >= 0) {
          const barWidth = this.$refs.progressBar.clientWidth - progressBarWidth
          const offWidth = barWidth * newpercent
          this._offset(offWidth)
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import '../../common/stylus/variable.styl'

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, .3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
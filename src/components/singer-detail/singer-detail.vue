<template>
  <transition name='slide'>
    <div class="singer-detail">
      <music-list :title='title' :bg-image='bgImage' :songs='songs'></music-list>
    </div>
  </transition>
</template>

<script>
  import { mapGetters } from 'vuex'
  import MusicList from '@/components/music-list/music-list'
  import { ERR_OK } from '@/api/config'
  import { createSong } from '@/common/js/song'

  export default {
    data () {
      return {
        songs: []
      }
    },
    created () {
      this._getDetail()
    },
    methods: {
      _getDetail () {
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        this.$http.get(`/api/v8/fcg-bin/fcg_v8_singer_track_cp.fcg?order=listen&begin=0&num=100&singermid=${this.singer.id}&g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5page&needNewCode=1&from=h5&_=1502935131910`)
        .then(res => {
          let data = res.data
          if (data.code === ERR_OK) {
            this.songs = this._normalizeSongs(data.data.list)
          }
        })
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach(item => {
          // let musicData = item.musicData
          // 对象的解构赋值，找到与变量名字相同的属性，并把值赋给变量
          let { musicData } = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    computed: {
      title () {
        return this.singer.name
      },
      bgImage () {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    components: {
      MusicList
    }
  }
</script>

<style lang="stylus" scoped>
  @import '../../common/stylus/variable'
  
  .singer-detail
    position: fixed
    z-index: 100
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: $color-background

  .slide-enter-active,.slide-leave-active
    transition: all .3s
  .slide-enter,.slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
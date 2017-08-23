<template>
  <transition name='slide'>
    <music-list :title='title' :bg-image='bgImage' :songs='songs' ref='musicList'></music-list>
  </transition>
</template>

<script>
  import MusicList from '@/components/music-list/music-list'
  import { mapGetters } from 'vuex'
  import { ERR_OK } from '@/api/config'
  import { createSong } from '@/common/js/song'

  export default {
    data () {
      return {
        songs: []
      }
    },
    components: {
      MusicList
    },
    created () {
      this._getDisc(this.disc.dissid)
    },
    methods: {
      _getDisc (id) {
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        this.$http.get(`/api/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=${id}&format=json&g_tk=75411225&loginUin=308634583&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`)
        .then(res => {
          let data = res.data
          if (data.code === ERR_OK) {
            this.songs = this._normalizeSongs(data.cdlist[0].songlist)
          }
        })
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach(item => {
          if (item.songid && item.albumid) {
            ret.push(createSong(item))
          }
        })
        return ret
      }
    },
    computed: {
      title () {
        return this.disc.dissname
      },
      bgImage () {
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    }
  }
</script>

<style lang="stylus" scoped>
  .slide-enter-active, .slider-leave-active
    transition: all .3s
  .slide-enter, .slide-leave-to
    transition: translate3d(100%, 0, 0)
</style>
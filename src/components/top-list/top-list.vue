<template>
  <transition name='slide'>
    <music-list :rank='rank' :title='title' :bg-image='bgImage' :songs='songs'></music-list>
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
        rank: true,
        songs: []
      }
    },
    created () {
      this._getRankDetail(this.topList.id)
    },
    components: {
      MusicList
    },
    methods: {
      _getRankDetail (id) {
        this.$http.get(`/api/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=${this.topList.id}&_=1501665006284`)
        .then(res => {
          let data = res.data
          if (data.code === ERR_OK) {
            let ret = []
            data.songlist.forEach(item => {
              ret.push(createSong(item.data))
            })
            this.songs = ret
          }
        })
      }
    },
    computed: {
      title () {
        return this.topList.topTitle
      },
      bgImage () {
        return this.topList.picUrl
      },
      ...mapGetters([
        'topList'
      ])
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
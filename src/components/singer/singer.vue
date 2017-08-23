<template>
  <div class="singer" ref='singer'>
    <listview :data='singers' @select='selectSinger' ref='listview'></listview>
    <router-view></router-view>
  </div>
</template>

<script>
  import { ERR_OK } from '@/api/config'
  import Singer from '@/common/js/singer'
  import Listview from '@/base/listview/listview'
  import { mapMutations } from 'vuex'
  import { playlistMixin } from '@/common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_LEN = 10

  export default {
    mixins: [playlistMixin],
    data () {
      return {
        singers: []
      }
    },
    created () {
      this._getSingerList()
    },
    methods: {
      selectSinger (singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        // console.log(singer)
        // this.$store.commit('SET_SINGER', singer)
        // 这里利用的辅助函数来做个映射
        this.setSinger(singer)
      },
      handlePlaylist (playList) {
        const bottom = playList.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.listview.refresh()
      },
      _getSingerList () {
        this.$http.get('/api/v8/fcg-bin/v8.fcg?channel=singer&page=list&key=all_all_all&pagesize=100&pagenum=1&g_tk=1432525258&loginUin=308634583&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0')
        .then(res => {
          if (res.data.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.data.list)
          }
        })
      },
      // 处理我们的singer数据，得到一个热门及字母顺序排列的
      _normalizeSinger (list) {
        let map = {
          // 这里是拿hot数据
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        // 这里因为都是记录ID,NAME,URL，重复写代码，抽到common做个singer类
        list.forEach((item, index) => {
          if (index < HOT_LEN) {
            map.hot.items.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
          }

          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
        })
        // 现在拿到的数据是个无序的，并且里面有数字的索引
        let hot = []
        let ret = []
        for (let key in map) {
          let val = map[key]
          // console.log(val)
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        // console.log(ret[ret.length - 1].items.length = 3)
        return [...hot, ...ret]
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      Listview
    }
  }
</script>
<style lang="stylus" scoped>
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
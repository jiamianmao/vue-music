<template>
  <div class="recommend" ref='recommend'>
    <scroll class="recommend-content" ref='scroll' :data='discList'>
      <div>
        <div class="slider-wrapper" v-if='recommends.length'>
          <slider>
            <div v-for='item of recommends'>
              <a :href="item.linkUrl">
                <img class='needsclick' @load='loadImage' :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for='item of discList' class='item' @click='selectItem(item)'>
              <div class="icon">
                <img v-lazy='item.imgurl' width='60' height='60'>
              </div>
              <div class="text">
                <h2 class="name">{{item.author}}</h2>
                <p class="desc">{{item.dissname}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <loading v-show='!discList.length'></loading>
    </scroll>
    <router-view></router-view>
  </div>
</template>
<script>
import Scroll from '@/base/scroll/scroll'
import Slider from '@/base/slider/slider'
import { ERR_OK } from '@/api/config'
import Loading from '@/base/loading/loading'
import { playlistMixin } from '@/common/js/mixin'
import { mapMutations } from 'vuex'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  created () {
    this._getRecommend()
    this._getDsicList()
  },
  methods: {
    handlePlaylist (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    selectItem (item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      this.setDisc(item)
    },
    // 因为这里是对slider和推荐列表进行高度计算
    // 可以利用计算属性把两者的高度相加再传给scroll组件
    // 但是我们是封装到组件中，让其自动计算的。
    // 另外如果让slider数据拿到后，就refresh也不行
    // 因为我们还需要异步的去拿imgurl的图片资源，所以高度并不一定撑开了
    // 这里我们在图片上绑定了onload事件来
    // 并且我们要设置一个flag位，来防止这五张图片都会触发这个方法导致重复无用计算
    loadImage () {
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    },
    _getRecommend () {
      this.$http.get('/api/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1502674994844')
      .then(res => {
        if (res.data.code === ERR_OK) {
          this.recommends = res.data.data.slider
        }
      })
    },
    _getDsicList () {
      // QQ的接口可以指定json还是jsonp，借鉴一下
      this.$http.get('/api/v8/fcg-bin/fcg_first_yqq.fcg?format=json&tpl=v12&page=other&callback=GetRecomListCallback7381710727767632&rnd=7381710727767632&g_tk=5381&jsonpCallback=GetRecomListCallback7381710727767632&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=GB2312&notice=0&platform=yqq&needNewCode=0')
      .then(res => {
        if (res.data.code === ERR_OK) {
          this.discList = res.data.data.hotdiss.list
        }
      })
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  components: {
    Slider,
    Scroll,
    Loading
  }
}
</script>
<style lang="stylus" scoped>
  @import "../../common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
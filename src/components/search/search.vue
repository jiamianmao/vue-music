<template>
  <div class='search'>
    <div class="search-box-wrapper">
      <search-box @query='onQueryChange' ref='searchBox'></search-box>
    </div>
    <div class="shortcut-wrapper" v-show='!query'>
      <scroll class="shortcut" ref='shortcut' :data='shortcut'>

        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li v-for='item of hotKey' class='item' @click='addQuery(item.k)'>
                <span>{{ item.k }}</span>
              </li>
            </ul>
          </div>
          <div class="search-history">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear">
                <i class='icon-clear'></i>
              </span>
            </h1>
          </div>
        </div>

      </scroll>
    </div>
  </div>
</template>

<script>
  import SearchBox from '@/base/search-box/search-box'
  import { ERR_OK } from '@/api/config'
  import Scroll from '@/base/scroll/scroll'
  import { mapGetters } from 'vuex'

  export default {
    data () {
      return {
        hotKey: [],
        query: ''
      }
    },
    created () {
      this._getHotSearch()
    },
    methods: {
      _getHotSearch () {
        let timestamp = +new Date()
        this.$http.get(`/api/splcloud/fcgi-bin/gethotkey.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=${timestamp}`)
        .then(res => {
          let response = res.data
          if (response.code === ERR_OK) {
            this.hotKey = response.data.hotkey.slice(0, 10)
          }
        })
      },
      onQueryChange (val) {
        this.query = val
      },
      addQuery (k) {
        this.$refs.searchBox.setQuery(k)
      }
    },
    computed: {
      shortcut () {
        return this.hotKey.concat(this.searchHistory)
      },
      ...mapGetters([
        'searchHistory'
      ])
    },
    watch: {
      query (newQuery) {
        if (!newQuery) {
          this.$nextTick(() => {
            this.$refs.shortcut.refresh()
          })
        }
      }
    },
    components: {
      SearchBox,
      Scroll
    }
  }
  </script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
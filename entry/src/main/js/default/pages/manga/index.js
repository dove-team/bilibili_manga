import page from '../../common/js/page';
import http from '../../common/js/http';
import prompt from '@system.prompt';

export default {
    data: {
        id: '',
        cover: '',
        title: '',
        authors: '',
        tags: '',
        newest: '',
        btnContent: '追漫',
        renewal_time: '',
        classic_lines: '',
        follow: 0,
        pageList: [],
        pages: []
    },
    onInit() {
        var self = this;
        var data = 'comic_id=' + this.id;
        http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/ComicDetail', data, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    self.cover = data.data.horizontal_cover;
                    self.title = data.data.title;
                    self.authors = data.data.author_name.join();
                    data.data.tags.forEach(item => {
                        self.tags += item.name + ';';
                    });
                    self.newest = '更新到' + data.data.last_short_title + '话';
                    self.renewal_time = data.data.renewal_time;
                    self.classic_lines = data.data.classic_lines;
                    self.follow = data.data.fav;
                    self.btnContent = data.data.fav == 1 ? "取消追漫" : "追漫";
                    self.pages = data.data.ep_list;
                    self.pageList = self.pages.splice(0, 30);
                }
                else {
                    prompt.showToast({
                        message: "加载购买数据失败...",
                        duration: 1000
                    });
                }
            }
        });
    },
    loadMore() {
        if (this.pages != null && this.pages.length > 0) {
            var arr = this.pages.splice(0, 30);
            this.pageList = this.pageList.concat(arr);
        }
    },
    btnFollow() {
        var data = 'comic_ids=' + this.id;
        if (this.follow == 1) {
            http.postHttpData('https://manga.bilibili.com/twirp/bookshelf.v1.Bookshelf/AddFavorite', data, function (data) {
                if (data != null && typeof data != 'undefined') {
                    var msg = data.code == '0' ? "取消追漫成功！" : "取消追漫失败！"
                    prompt.showToast({
                        message: msg,
                        duration: 1000
                    });
                }
            });
        }
        else {
            http.postHttpData('https://manga.bilibili.com/twirp/bookshelf.v1.Bookshelf/DeleteFavorite', data, function (data) {
                if (data != null && typeof data != 'undefined') {
                    var msg = data.code == '0' ? "追漫成功！" : "追漫失败！"
                    prompt.showToast({
                        message: msg,
                        duration: 1000
                    });
                }
            });
        }
    },
    goToPage(e) {
        var cid = this.id;
        var id = e.target.dataSet.id;
        page.navigateWith('view', {
            id: id,
            cid: cid
        });
    }
}
import db from '../../common/js/db';
import http from '../../common/js/http';
import page from '../../common/js/page';
import ext from '../../common/js/untils';
import prompt from '@system.prompt';

export default {
    data: {
        homes: {
            color_normal: 'white',
            color_active: 'cyan',
            show: true,
            list: [{
                       i: 0,
                       show: true,
                       icon: 'common/images/home.png',
                       title: '首页'
                   }, {
                       i: 1,
                       show: false,
                       icon: 'common/images/search.png',
                       title: '搜索'
                   }, {
                       i: 2,
                       show: false,
                       icon: 'common/images/book.png',
                       title: '书架'
                   }, {
                       i: 3,
                       show: false,
                       icon: 'common/images/user.png',
                       title: '我的'
                   }]
        },
        userId: '',
        typeData: null,
        newData: [],
        stylesData: [],
        areasData: [],
        statusData: [],
        pricesData: [],
        rankData: [],
        ordersData: [],
        typeListData: [],
        searchData: [],
        recommandData: [],
        focusData: [],
        historyData: [],
        buyData: [],
        orderTag: '追漫顺序',
        orders: ['追漫顺序', '更新时间', '最近漫画'],
        buyIndex: 0,
        newIndex: 0,
        keywords: '',
        typeIndex: 1,
        followIndex: 1,
        historyIndex: 0,
        searchIndex: 1,
        recommandndex: 1,
        areasPos: '全部',
        statusPos: '全部',
        stylesPos: '全部',
        pricesPos: '全部',
        ordersPos: '全部',
        userName: '请登录',
        userCover: 'common/images/noavatar.png'
    },
    onShow() {
        this.recommandManga();
        var self = this;
        db.query('userid', function (value) {
            self.userId = value;
            if (value != '') {
                http.getHttpData('https://app.bilibili.com/x/v2/space?ps=10&vmid=' + value, 0, function (data) {
                    if (data != null && typeof data != 'undefined') {
                        if (data.code == '0') {
                            db.update('userinfo', JSON.stringify(data.data));
                            self.userName = data.data.card.name;
                            self.userCover = data.data.card.face;
                        }
                    }
                });
            }
        });
    },
    loadMore(e) {
        switch (e.target.dataSet.type) {
            case 'buy':
                this.buyIndex++;
                this.buyLoad();
                break;
            case 'history':
                this.historyIndex++;
                this.historyLoad();
                break;
            case 'focus':
                this.followIndex++;
                this.followData();
                break;
            case 'new':
                this.newIndex++;
                this.newManga();
                break;
            case 'type':
                this.typeIndex++;
                this.loadTypeData();
                break;
            case 'search':
                this.searchIndex++;
                this.searchManga(this.keywords);
                break;
            case 'recommand':
                this.recommandndex++;
                this.recommandManga();
                break;
        }
    },
    logout() {
        db.update('userid', '');
        db.update('cookies', '');
        db.update('userinfo', '');
        db.update('accesskey', '');
        db.update('expires_in', '');
        db.update('refresh_token', '');
        this.userName = '请登录';
        this.userCover = 'common/images/noavatar.png';
    },
    logoutDialog() {
        this.$element('settingDialog').show()
    },
    hideDialog() {
        this.$element('settingDialog').close()
    },
    clickCover() {
        if (this.userId == '') {
            page.navigate('login')
        }
    },
    changeHomeTabactive(e) {
        for (let i = 0; i < this.homes.list.length; i++) {
            let element = this.homes.list[i];
            element.show = false;
            element.color = this.homes.color_normal;
            if (i === e.index) {
                element.show = true;
                element.color = this.homes.color_active;
            }
        }
        switch (e.index) {
            case 2:
                if ('' != this.userId) {
                    this.followData();
                }
                break;
        }
    },
    changeBookTabactive(e) {
        switch (e.index) {
            case 1:
                if (this.historyIndex == 0) {
                    this.historyIndex++;
                    this.historyLoad();
                }
                break;
            case 2:
                if (this.buyIndex == 0) {
                    this.buyIndex++;
                    this.buyLoad();
                }
                break;
        }
    },
    changeTabactive(e) {
        switch (e.index) {
            case 0:
                if (this.recommandndex == 0) {
                    this.recommandndex++;
                    this.recommandManga();
                }
                break;
            case 1:
                if (this.rankData.length == 0) {
                    this.hotManga();
                }
                break;
            case 2:
                if (this.newIndex == 0) {
                    this.newIndex = 1;
                    this.newManga();
                }
                break;
            case 3:
                if (this.typeData == null) {
                    this.areaManga();
                }
                break;
        }
    },
    queryManga(e) {
        this.keywords = e.text;
        this.searchIndex = 1;
        this.searchManga(e.text);
    },
    buyLoad() {
        var self = this;
        var data = 'page_num=' + this.buyIndex + '&page_size=15';
        http.postHttpData('https://manga.bilibili.com/twirp/user.v1.User/GetAutoBuyComics', data, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    self.buyData = data.data;
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
    followData() {
        var self = this;
        var order = this.orders.indexOf(this.orderTag) + 1;
        var data = 'page_num=' + this.followIndex + '&page_size=15&order=' + order;
        http.postHttpData('https://manga.bilibili.com/twirp/bookshelf.v1.Bookshelf/ListFavorite', data, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    self.focusData = data.data;
                }
                else {
                    prompt.showToast({
                        message: "加载追漫数据失败...",
                        duration: 1000
                    });
                }
            }
        });
    },
    historyLoad() {
        var self = this;
        var data = 'page_num=' + this.historyIndex + '&page_size=15';
        http.postHttpData('https://manga.bilibili.com/twirp/bookshelf.v1.Bookshelf/ListHistory', data, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    self.historyData = data.data;
                }
                else {
                    prompt.showToast({
                        message: "加载历史数据失败...",
                        duration: 1000
                    });
                }
            }
        });
    },
    searchManga(text) {
        var self = this;
        var data = 'key_word=' + encodeURIComponent(text) + "&page_num=" + this.searchIndex + "&page_size=20";
        http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/Search', data, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    var array = data.data.list;
                    array.forEach(item => {
                        item.title = item.title.replace("<em class=\"keyword\">", '').replace("</em>", "");
                    });
                    if (self.searchIndex == 1) {
                        self.searchData = array;
                    }
                    else {
                        self.searchData = self.searchData.concat(array);
                    }
                }
                else {
                    prompt.showToast({
                        message: "加载排行数据失败...",
                        duration: 2000
                    });
                }
            }
        });
    },
    hotManga() {
        var self = this;
        http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/HomeHot', '', function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    self.rankData = data.data;
                }
                else {
                    prompt.showToast({
                        message: "加载排行数据失败...",
                        duration: 2000
                    });
                }
            }
        });
    },
    newManga() {
        var self = this;
        var data = 'style_id=-1&area_id=-1&is_finish=-1&order=3&is_free=-1&page_num=' + this.newIndex + '&page_size=20';
        http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/ClassPage', data, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    if (self.newIndex == 1) {
                        self.newData = data.data;
                    }
                    else {
                        self.newData = self.newData.concat(data.data);
                    }
                }
                else {
                    prompt.showToast({
                        message: "加载新作数据失败...",
                        duration: 2000
                    });
                }
            }
        });
    },
    areaManga() {
        var self = this;
        http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/AllLabel', '', function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    self.typeData = data.data;
                    self.stylesData = ext.selectName(data.data.styles);
                    self.stylesPos = self.stylesData[0];
                    self.areasData = ext.selectName(data.data.areas);
                    self.areasPos = self.areasData[0];
                    self.statusData = ext.selectName(data.data.status);
                    self.statusPos = self.statusData[0];
                    self.pricesData = ext.selectName(data.data.prices);
                    self.pricesPos = self.pricesData[0];
                    self.ordersData = ext.selectName(data.data.orders);
                    self.ordersPos = self.ordersData[0];
                    self.loadTypeData();
                }
                else {
                    prompt.showToast({
                        message: "加载新作数据失败...",
                        duration: 2000
                    });
                }
            }
        });
    },
    recommandManga() {
        var self = this;
        var data = 'page_num=' + this.recommandndex + '&omit_cards=1&drag=0&new_fall_into_trap=0';
        http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/HomeRecommend', data, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    if (self.recommandndex == 1) {
                        self.recommandData = data.data.list;
                    }
                    else {
                        self.recommandData = self.recommandData.concat(data.data.list);
                    }
                }
                else {
                    prompt.showToast({
                        message: "加载排行数据失败...",
                        duration: 2000
                    });
                }
            }
        });
    },
    selectType(e) {
        switch (e.target.dataSet.type) {
            case 'f_order':
                this.orderTag = e.newValue;
                break;
            case 'price':
                this.pricesPos = e.newValue;
                break;
            case 'area':
                this.areasPos = e.newValue;
                break;
            case 'status':
                this.statusPos = e.newValue;
                break;
            case 'style':
                this.stylesPos = e.newValue;
                break;
            case 'order':
                this.ordersPos = e.newValue;
                break;
        }
        if (e.target.dataSet.type != 'f_order') {
            this.loadTypeData();
        }
    },
    loadTypeData() {
        var ids = ext.takeId(this.typeData, this.areasPos, this.statusPos, this.stylesPos, this.ordersPos, this.pricesPos);
        var data = 'style_id=' + ids[0] + '&area_id=' + ids[1] + '&is_finish=' + ids[2] + '&order=' + ids[3] + '&is_free=' + ids[4] + '&page_num='
        + this.typeIndex + '&page_size=15';
        var self = this;
        http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/ClassPage', data, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    if (self.typeIndex == 1) {
                        self.typeListData = data.data;
                    }
                    else {
                        self.typeListData = self.typeListData.concat(data.data);
                    }
                }
                else {
                    prompt.showToast({
                        message: "加载新作数据失败...",
                        duration: 2000
                    });
                }
            }
        });
    },
    goToPage(e) {
        var id = e.target.dataSet.id;
        page.navigateWith('manga', {
            id: id
        });
    }
}
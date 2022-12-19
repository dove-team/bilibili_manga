import db from '../../common/js/db';
import prompt from '@system.prompt';
import page from '../../common/js/page';
import http from '../../common/js/http';

export default {
    data: {
        id: '',
        cid: '',
        pay: 0,
        content: '',
        type: 1,
        imgs: []
    },
    onInit() {
        this.loadInfo();
    },
    loadInfo() {
        var self = this;
        var param = "ep_id=" + this.id;
        http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/GetImageIndex', param, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    var urls = [];
                    for (var i = 0;i < data.data.images.length; i++) {
                        urls[i] = data.data.images[i].path;
                    }
                    var content = 'urls=' + JSON.stringify(urls);
                    http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/ImageToken', content, function (data) {
                        if (data != null && typeof data != 'undefined') {
                            if (data.code == '0') {
                                var items = [];
                                for (var i = 0;i < data.data.length; i++) {
                                    var item = data.data[i];
                                    items.push({
                                        img: item.url + '?token=' + item.token
                                    });
                                }
                                self.imgs = items;
                            }
                        }
                    });
                }
                else if (data.code == '1') {
                    db.query('userid', function (value) {
                        if (value == '') {
                            prompt.showToast({
                                message: "请登录后继续！",
                                duration: 1000
                            });
                        }
                        else {
                            http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/GetEpisodeBuyInfo', param, function (data) {
                                if (data != null && typeof data != 'undefined') {
                                    if (data.code == '0') {
                                        self.pay = data.data.pay_gold;
                                        self.content = '剩余漫币:' + data.data.remain_gold + '剩余漫读券：' + data.data.remain_coupon + '剩余通用券：' + data.data.remain_silver
                                        + '剩余限免卡：' + data.data.remain_item;
                                        self.$element('eventDialog').show();
                                    }
                                    else {
                                        prompt.showToast({
                                            message: "获取购买信息失败！",
                                            duration: 1000
                                        });
                                    }
                                }
                            });
                        }
                    });
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
    selectType(e) {
        this.type = e.newValue
    },
    reload(e) {
        console.log(e)
    },
    buy() {
        var self = this;
        var data = '';
        switch (this.type) {
            case 1:
                data = "buy_method=3&ep_id=" + this.id + "&pay_amount=" + this.pay + "&auto_pay_gold_status=2";
                break;
            case 2:
                data = "buy_method=2&auto_pay_gold_status=2&ep_id=" + this.id + "&coupon_id=" + this.cid;
                break;
            case 3:
                data = "buy_method=5&ep_id=" + this.id;
                break;
            case 4:
                data = "buy_method=4&auto_pay_gold_status=2&ep_id=" + this.id + "&coupon_id=" + this.cid;
                break;
        }
        http.postHttpData('https://manga.bilibili.com/twirp/comic.v1.Comic/BuyEpisode', data, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    prompt.showToast({
                        message: "购买成功！",
                        duration: 1000
                    });
                    setTimeout(function () {
                        self.loadInfo();
                    }, 1500);
                }
                else {
                    prompt.showToast({
                        message: "购买失败，" + data.msg,
                        duration: 1000
                    });
                }
            }
        });
    }
}
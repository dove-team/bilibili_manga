import db from '../js/db'
import crypto from 'crypto-js';
import http from '@ohos.net.http';

export default {
    mid: null,
    accesskey: null,
    loginKey: {
        "Appkey": "783bbb7264451d82",
        "Secret": "2653583c8873dea268ab9386918b1d65"
    },
    androidKey: {
        "Appkey": "1d8b6e7d45233436",
        "Secret": "560c52ccd288fed045859ed18bffd973"
    },
    androidTvKey: {
        "Appkey": "4409e2ce8ffd12b8",
        "Secret": "59b43e04ad6965f34319062b478f83dd"
    },
    init(callBack) {
        var self = this;
        if (self.mid == null) {
            db.query('userid', function (value) {
                self.mid = value;
            });
        }
        if (self.accesskey == null) {
            db.query('accesskey', function (value) {
                self.accesskey = value;
                callBack();
            });
        }
        else {
            callBack();
        }
    },
    getSign(value, key) {
        var sign = '';
        if (value.indexOf('?') > -1) {
            var index = value.indexOf("?", 4) + 1;
            var str = value.substring(index);
            var array = str.split('&').sort();
            for (var i = 0;i < array.length; i++) {
                if (i != 0) {
                    sign += '&';
                }
                sign += array[i];
            }
            sign += key.Secret;
        }
        else {
            if (value.startsWith('&')) {
                value = value.substring(1);
            }
            var array = value.split('&').sort();
            for (var i = 0;i < array.length; i++) {
                if (i != 0) {
                    sign += '&';
                }
                sign += array[i];
            }
            sign += key.Secret;
        }
        sign = crypto.MD5(sign).toString();
        return '&sign=' + sign;
    },
    getReqParas(url, type, callBack) {
        var self = this;
        var key = self.androidKey;
        if (type == 1) {
            key = self.loginKey;
        }
        if (type == 2) {
            key = self.androidTvKey;
        }
        this.init(function () {
            var timestamp = (new Date()).valueOf();
            if (url.indexOf('?') > -1) {
                url += '&access_key=' + self.accesskey + '&mid=' + self.mid + '&appkey=' + key.Appkey +
                '&platform=android&device=android&actionKey=appkey&build=5520400&mobi_app=android_comic&ts=' + timestamp;
            }
            else {
                url += '?access_key=' + self.accesskey + '&mid=' + self.mid + '&appkey=' + key.Appkey +
                '&platform=android&device=android&actionKey=appkey&build=5520400&mobi_app=android_comic&ts=' + timestamp;
            }
            url += self.getSign(url, key);
            callBack(url);
        });
    },
    postReqParas(postContent, isLogin, callBack) {
        var self = this;
        this.init(function () {
            var key = self.androidKey;
            if (isLogin == 1) {
                key = self.loginKey;
            }
            if (isLogin == 2) {
                key = self.androidTvKey;
            }
            var timestamp = (new Date()).valueOf();
            if (isLogin == 0) {
                if (postContent == '') {
                    postContent += "access_key=" + self.accesskey + "&appkey=" + key.Appkey + "&mobi_app=android_comic&device=android&version=3.0.0&actionKey=appkey&platform=android&ts="
                    + timestamp;
                }
                else {
                    postContent += "&access_key=" + self.accesskey + "&appkey=" + key.Appkey + "&mobi_app=android_comic&device=android&version=3.0.0&actionKey=appkey&platform=android&ts="
                    + timestamp;
                }
            }
            else {
                if (postContent == '') {
                    postContent += "access_key=" + self.accesskey + "&appkey=" + key.Appkey + "&platform=android&mobi_app=android&device=android&ts="
                    + timestamp + "&build=6235200";
                }
                else {
                    postContent += "&access_key=" + self.accesskey + "&appkey=" + key.Appkey + "&platform=android&mobi_app=android&device=android&ts="
                    + timestamp + "&build=6235200";
                }
            }
            postContent += self.getSign(postContent, key);
            callBack(postContent);
        });
    },
    postLoginData(url, datas, type, callBack) {
        this.postReqParas(datas, type, function (paras) {
            let httpRequest = http.createHttp();
            httpRequest.request(url,
                {
                    method: http.RequestMethod.POST,
                    header: {
                        'referer': 'http://www.bilibili.com/',
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    extraData: paras,
                    connectTimeout: 60000,
                    readTimeout: 60000,
                }, (err, data) => {
                    if (!err) {
                        if (data.responseCode == http.ResponseCode.OK && data.result != null && typeof data.result != 'undefined') {
                            try {
                                var json = JSON.parse(data.result);
                                callBack(json);
                            }
                            catch (e) {
                                console.log(e)
                            }
                        }
                    }
                    else {
                        console.info('error:' + JSON.stringify(err));
                    }
                    httpRequest.destroy();
                });
        });
    },
    postHttpData(url, datas, callBack) {
        this.postReqParas(datas, 0, function (paras) {
            let httpRequest = http.createHttp();
            httpRequest.request(url,
                {
                    method: http.RequestMethod.POST,
                    header: {
                        'referer': 'http://www.bilibili.com/',
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    extraData: paras,
                    connectTimeout: 60000,
                    readTimeout: 60000,
                }, (err, data) => {
                    if (!err) {
                        if (data.responseCode == http.ResponseCode.OK && data.result != null && typeof data.result != 'undefined') {
                            try {
                                var json = JSON.parse(data.result);
                                callBack(json);
                            }
                            catch (e) {
                                console.log(e)
                            }
                        }
                    }
                    else {
                        console.info('error:' + JSON.stringify(err));
                    }
                    httpRequest.destroy();
                });
        });
    },
    getHttpData(url, type, callBack) {
        let httpRequest = http.createHttp();
        this.getReqParas(url, type, function (uri) {
            httpRequest.request(uri,
                {
                    method: http.RequestMethod.GET,
                    header: {
                        'referer': 'http://www.bilibili.com/'
                    },
                    connectTimeout: 60000,
                    readTimeout: 60000,
                }, (err, data) => {
                    if (!err && data.responseCode == http.ResponseCode.OK) {
                        var json = JSON.parse(data.result);
                        callBack(json);
                    }
                    else {
                        console.log('gethttp error:' + JSON.stringify(err));
                    }
                    httpRequest.destroy();
                });
        });
    }
}
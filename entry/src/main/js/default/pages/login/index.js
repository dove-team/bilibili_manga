import prompt from '@system.prompt';
import { v4 as uuidv4 } from 'uuid';
import db from '../../common/js/db';
import page from '../../common/js/page';
import http from '../../common/js/http';
import ext from '../../common/js/untils';

export default {
    data: {
        account: '',
        pwd: '',
        sid: '',
        cid: '',
        timer: null,
        title: '账号',
        remainTime: 0,
        smsReSend: '发送验证码',
        captchaUrl: '',
        captchaKey: '',
        countryData: [],
        countryDatas: null,
        countryCode: '中国大陆(+86)'
    },
    onInit() {
        var self = this;
        http.getHttpData('https://passport.bilibili.com/x/passport-login/country', 1, function (data) {
            if (data != null && typeof data != 'undefined') {
                if (data.code == '0') {
                    var countryData = [];
                    self.countryDatas = data.data.list;
                    for (var idx = 0;idx < self.countryDatas.length; idx++) {
                        var item = self.countryDatas[idx];
                        var content = item.cname + '(+' + item.country_code + ')';
                        countryData[idx] = content;
                    }
                    self.countryData = countryData;
                }
                else {
                    prompt.showToast({
                        message: "加载短信登录数据失败...",
                        duration: 1000
                    });
                }
            }
        });
    },
    setCountry(e) {
        this.countryCode = e.newValue;
    },
    setValue(e) {
        switch (e.target.dataSet.type) {
            case 'account':
                this.account = e.value;
                break;
            case 'pwd':
                this.pwd = e.value;
                break;
        }
    },
    smsCode() {
        var self = this;
        if (self.remainTime > 0) {
            prompt.showToast({
                message: "请等待" + self.remainTime + "s后重发验证码！",
                duration: 1000
            });
        }
        this.cid = ext.takeCid(this.countryDatas, this.countryCode);
        var account = this.account;
        if (account == '') {
            prompt.showToast({
                message: "请输入手机号！",
                duration: 1000
            });
        }
        else {
            if (account.length > 6) {
                this.sid = uuidv4().replace(/-/g, '');
                var data = '&cid=' + this.cid + '&tel=' + account + '&login_session_id=' + this.sid;
                http.postLoginData('https://passport.bilibili.com/x/passport-login/sms/send', data, 1, function (data) {
                    if (data != null && typeof data != 'undefined') {
                        if (data.code == '0') {
                            self.captchaKey = data.data.captcha_key;
                            self.captchaUrl = data.data.recaptcha_url;
                            if (self.captchaUrl == '') {
                                self.remainTime = 60;
                                self.timer = setInterval(function () {
                                    if (self.remainTime == 0) {
                                        self.smsReSend = '重发验证码';
                                    }
                                    else {
                                        self.smsReSend = '重发验证码(' + self.remainTime + 's)';
                                    }
                                    if (self.remainTime > 0) {
                                        self.remainTime--;
                                    }
                                    else {
                                        clearInterval(self.timer);
                                    }
                                }, 1000);
                            }
                            else {
                                var url = 'https://l78z.nsapps.cn/bili_gt.html' + '' + '&app=uwp';
                                page.navigateWith('web', {
                                    url: url
                                });
                            }
                        }
                        else {

                        }
                    }
                });
            }
            else {
                prompt.showToast({
                    message: "请输入正确的手机号格式！",
                    duration: 1000
                });
            }
        }
    },
    login() {
        var pwd = this.pwd;
        var account = this.account;
        if (account != '' && pwd != '') {
            var data = '&cid=' + this.cid + '&tel=' + account + '&login_session_id=' + this.sid + '&captcha_key='
            + this.captchaKey + '&code=' + pwd;
            http.postLoginData('https://passport.bilibili.com/x/passport-login/login/sms', data, 1, function (data) {
                if (data != null && typeof data != 'undefined') {
                    if (data.code == '0' && data.data.status == '0') {
                        db.update('userid', data.data.token_info.mid);
                        db.update('expires_in', data.data.token_info.expires_in);
                        db.update('accesskey', data.data.token_info.access_token);
                        db.update('refresh_token', data.data.token_info.refresh_token);
                        page.navigateBack();
                    }
                    else {
                        prompt.showToast({
                            message: "登录失败：" + data.message,
                            duration: 1000
                        });
                    }
                }
            });
        }
        else {
            prompt.showToast({
                message: "请输入账号密码！",
                duration: 1000
            });
        }
    }
}
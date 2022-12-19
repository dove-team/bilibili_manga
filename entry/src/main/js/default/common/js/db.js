import dataStorage from '@ohos.data.storage';
import featureAbility from '@ohos.ability.featureAbility';

export default {
    query(key, callBack) {
        var context = featureAbility.getContext();
        context.getFilesDir().then((path) => {
            dataStorage.getStorage(path + '/db', function (err, storage) {
                if (!err) {
                    storage.get(key, '', function (err, value) {
                        if (!err) {
                            callBack(value);
                        }
                        else {
                            callBack('');
                        }
                    });
                }
                else {
                    callBack('');
                }
            });
        });
    },
    update(key, value) {
        var context = featureAbility.getContext();
        context.getFilesDir().then((path) => {
            dataStorage.getStorage(path + '/db', function (err, storage) {
                if (!err) {
                    var str = '' + value;
                    storage.putSync(key, str);
                    storage.flushSync();
                }
            });
        });
    }
}
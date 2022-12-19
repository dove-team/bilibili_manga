export default {
    selectName(source) {
        var idx = 0;
        var array = [];
        source.forEach(item => {
            array[idx] = item.name;
            idx++;
        });
        return array;
    },
    takeId(source, areasPos, statusPos, stylesPos, ordersPos, pricesPos) {
        var style = source.styles.find(item => item.name == stylesPos);
        var area = source.areas.find(item => item.name == areasPos);
        var status = source.status.find(item => item.name == statusPos);
        var order = source.orders.find(item => item.name == ordersPos);
        var price = source.prices.find(item => item.name == pricesPos);
        return [style.id, area.id, status.id, order.id, price.id];
    },
    takeCid(codes, code) {
        var cc = code.substring(code.indexOf('+') + 1).replace(')', '');
        var data = codes.find(item => item.country_code == cc);
        return data.country_code;
    }
}
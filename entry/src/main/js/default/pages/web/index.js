export default {
    data: {
        url: '',
        fresh: false
    },
    refresh(e) {
        this._data.fresh = e.refreshing;
        this.$element('web').reload();
    },
    pageStart() {

    },
    pageFinish() {
        this._data.fresh = false;
    },
    pageError() {

    }
}
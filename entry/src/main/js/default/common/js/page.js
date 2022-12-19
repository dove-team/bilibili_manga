import router from '@system.router';

export default {
    navigate(view) {
        router.push({
            uri: "pages/" + view + "/index",
            params: {}
        });
    },
    navigateWith(view, paras) {
        router.push({
            uri: "pages/" + view + "/index",
            params: paras
        });
    },
    navigateBack() {
        router.back();
        router.clear();
    }
}
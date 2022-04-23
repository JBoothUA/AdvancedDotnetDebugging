// main entry point
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SmartCommandModule } from './_app.module';
if (window.location.href.indexOf('localhost:2777') === -1) {
    enableProdMode();
}
$(function () {
    platformBrowserDynamic().bootstrapModule(SmartCommandModule)
        .catch(function (err) { return console.error(err); });
});
//# sourceMappingURL=main.js.map
//declare module 'ImageViewer' {
//    export = ImageViewer;
//}

//declare const somethingUseful: JQueryImageViewer;

//interface JQueryImageViewer {
//    ImageViewer(options?: any): any;
//}

interface JQueryStatic {
    ImageViewer(container?: string, options?: any): any;
}

interface JQuery {
    ImageViewer(container?: string, options?: any): any;
}

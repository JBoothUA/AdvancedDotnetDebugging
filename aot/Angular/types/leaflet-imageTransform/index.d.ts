// Type definitions for Leaflet.imageTransform 1.0
/// <reference types="leaflet" />

declare namespace L {

	class ImageTransform extends ImageOverlay {
		constructor(Url: string, anchors: any, options: any);
		setAnchors(anchors: any): void;
	}

	function imageTransform(Url: string, anchors: any, options: any): ImageTransform;

}

/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
export class RadialMenuButtonImage {
    ImageSrc: string;
    OffsetTop: number = 0;
    OffsetLeft: number = 0;

    constructor(imageSrc: string, offsetTop: number = 0, offsetLeft: number = 0) {
        this.ImageSrc = imageSrc;
        this.OffsetTop = offsetTop;
        this.OffsetLeft = offsetLeft;
    }
}
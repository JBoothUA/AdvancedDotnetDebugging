export module Video {
    
    export class Camera implements Serializable<Camera> {
        public Username: string;
        public Password: string;
        public Port: string;
        public Ip: string;
        public Uri: any;
        public Id: string;
        public DisplayName: string;
        public Type: string;
        public IsPTZ: boolean;

        constructor(camera: object) {
            if (camera)
                this.deserialize(camera);
        }

        deserialize(input: any): Camera {
            this.Username = input.Username;
            this.Password = input.Password;
            this.Port = input.Port;
            this.Ip = input.Ip;
            this.Uri = input.Uri;
            this.Id = input.Id;
            this.DisplayName = input.DisplayName;
            this.Type = input.Type;
            this.IsPTZ = input.IsPtz;

            return this;
        }
    }

    export abstract class VideoVendor {
        constructor(protected cameraData: Camera) { }

        public getLiveVideo() { }

        public playLiveVideo() { }

        public stopLiveVideo() { }

        public disposeLiveVideo() { }

        public resumeLiveVideo() { }

        public refreshCameraVideo() { }

        public initVideo() { }

        public getCameraResolution() { }
    }

    export class Gamma2VideoVendor extends VideoVendor {
        constructor(cameraData: Camera) {
            super(cameraData);
        }
       
        public getLiveVideo() {
            return `<img width = "auto" height= "auto" 
                    style="background-repeat: no-repeat; background-position: center;-webkit-user-select: none;max-width:100%;max-height:100%;min-width:66px;min-height:66px;background-image:url('../../Content/Images/loading-spinner-white.gif')"
                    src= "`+ this.cameraData.Uri + `" >`;
        }
    }

    export class AdeptVideoVendor extends VideoVendor {
        constructor(cameraData: Camera) {
            super(cameraData);
        }

        public getLiveVideo() {
         
        }
    }
}

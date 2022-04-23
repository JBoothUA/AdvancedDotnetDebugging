import {
    Component, Input, Output,
    OnInit, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter,SimpleChange
} from '@angular/core';
import { CommandName } from './../patrols/action.class';


enum Type {
    Preset,
    Custom,
    Message,
    AudioFile
}

@Component({
    selector: 'say-play-chooser',
    templateUrl: 'say-play-chooser.component.html',
    styleUrls: ['say-play-chooser.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SayPlayChooser implements OnInit{
    @Input() mode: string = 'normal'
    @Input() sayParameterList: any = [];
    @Input() playParameterList: any = [];
    @Input() hideIcon: boolean = false;
    @Output() onCommandChange = new EventEmitter();
    @Output() onValueChange = new EventEmitter();
    @Output() onEnterPress = new EventEmitter();
    @Input() set commandName(commandName: CommandName) {
        if (commandName === CommandName.SayMessage) {
            if (this.mode === 'normal') {
                this.selectedType = Type.Message;
            } else {
                this.selectedType = Type.Preset;
            }
        }
        else {
            this.selectedType = Type.AudioFile
        }
    }

    public Type: typeof Type = Type;
    public selectedType: Type = Type.Preset
	private selectedItem: string;
	private selectedName: string;
    private customItem: string;
    private groupID: string;
    private CommandName: typeof CommandName = CommandName;

    public constructor(private ref: ChangeDetectorRef) { }

    public setCustomValue(msg: string) {
        this.selectedItem = null;
        this.customItem = msg;
        this.ref.markForCheck();
    }

    public setValue(command: CommandName, val: string) {
		this.selectedName = null;

		if (command == CommandName.SayMessage) {
			//Is it in the say parameter list?
			if (this.sayParameterList) {
				this.sayParameterList.Presets.forEach((item: any, index: number) => {
					if (item.StringValue === val) {
						this.selectedType = Type.Preset;
						this.selectedItem = val;
						this.selectedName = item.Name;
					}
				});
			}

			//Must be custom say
			if (!this.selectedItem) {
				this.selectedType = Type.Custom;
				this.customItem = val;
			}
		} else {
			//Is it in the play parameter list?
			if (this.playParameterList) {
				this.playParameterList.Presets.forEach((item: any, index: number) => {
					if (item.StringValue === val) {
						this.selectedItem = val;
						this.selectedName = item.Name;
					}
				});
			}
		}


		this.ref.detectChanges();
		if (this.selectedName != null) {
			let elem = document.getElementById(this.selectedName + this.groupID);
			if (elem != null) {
				let elemTop = elem.offsetTop;
				let parentElem = document.getElementById('presetsList'+this.groupID);
				if (parentElem != null) {
					parentElem.scrollTop = elemTop - parentElem.offsetTop + parentElem.scrollTop;
				}
			}
		}
    };

    public ngOnInit(): void {
        this.groupID = this.createGUID();
	}

    public selectItem(name: string):void {
        this.selectedItem = name;
        this.customItem = undefined;
		this.ref.markForCheck();
        this.onValueChange.emit(this.selectedItem.replace(/\r?\n|\r/g, ''));
    }

    public commandChange(commandName: CommandName): void {
        this.selectedItem = undefined;
        this.customItem = undefined;
		this.ref.markForCheck();
        this.onCommandChange.emit(commandName);
		this.onValueChange.emit(undefined);
    }

	public commandChangeCompact(commandName: CommandName, commandType: Type): void {
		this.selectedItem = undefined;
		this.customItem = undefined;
		this.selectedType = commandType;
		this.ref.markForCheck();
		this.onCommandChange.emit(commandName);
		this.onValueChange.emit(undefined);
	}

    public customValueChange(data: string) {
        this.selectedItem = undefined;
		this.ref.markForCheck();
        this.onValueChange.emit(this.customItem.replace(/\r?\n|\r/g, ''));
    }

    public fireEnterEvent(): void {
        this.onEnterPress.emit(this.customItem.replace(/\r?\n|\r/g, ''));
    }

    public getPresetList(): any {
        if (this.selectedType === Type.AudioFile) {
            if (this.playParameterList) {
                return this.playParameterList.Presets;
            } else {
                return [];
            }
        } else {
            if (this.sayParameterList) {
                return this.sayParameterList.Presets;
            } else {
                return [];
            }
        }
    }

    private createGUID(): string {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    }
}
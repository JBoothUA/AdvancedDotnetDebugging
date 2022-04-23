import { PatrolService } from '../patrols/patrol.service';
import {
	ActionCategory, ActionType, ActionScope, ActionDefinition, ActionDefinitions,
	ParameterDefinition,
} from '../patrols/action.class';
import { DataValue } from './../shared/shared-interfaces';
import { Injectable } from '@angular/core';

@Injectable()
export class MockPBPatrolService extends PatrolService {

	public loadActionDefinitions(): void {
		let actCatMap: Map<string, ActionCategory> = new Map<string, ActionCategory>();
		let inputActDefs: any[] = [
		{
			CommandName: 0,
			DisplayName: 'E-Stop',
			Description: 'Stop Robot',
			Category: 'Robot Navigation',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 1,
			IsQuickAction: false
		},
		{
			CommandName: 1,
			DisplayName: 'E-Stop Reset',
			Description: 'Release Stop',
			Category: 'Robot Navigation',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 1,
			IsQuickAction: false
		},
		{
			CommandName: 24,
			DisplayName: 'Go to Location',
			Description: 'Send the robot to a specified map location',
			Category: 'Robot Navigation',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 1,
			IsQuickAction: true
		},
		{
			CommandName: 4,
			DisplayName: 'Go Charge',
			Description: 'Send robot to its charging station',
			Category: 'Robot Navigation',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 20,
			DisplayName: 'Orient',
			Description: 'Orient the robot',
			Category: 'Robot Navigation',
			Prompt: 'Choose which way you want ROBOTNAME to face.',
			Parameters: [
				{
					Name: 2,
					DisplayName: 'Degrees',
					Type: 1,
					Prompt: 'Direction in degrees',
					Presets: [
						{
							Name: 'North',
							DisplayName: 'North',
							BooleanValue: <any>null,
							StringValue: '0',
							IntValue: 0,
							DoubleValue: <any>null,
							ImageValue: <any>null
						},
						{
							Name: 'South',
							DisplayName: 'South',
							BooleanValue: null,
							StringValue: '180',
							IntValue: 180,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'East',
							DisplayName: 'East',
							BooleanValue: null,
							StringValue: '90',
							IntValue: 90,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'West',
							DisplayName: 'East',
							BooleanValue: null,
							StringValue: '270',
							IntValue: 270,
							DoubleValue: null,
							ImageValue: null
						}
					]
				}
			],
			ActionType: 5,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 23,
			DisplayName: 'Play Audio',
			Description: 'Play an audio file through the sound system',
			Category: 'Sounds',
			Prompt: 'Choose a file',
			Parameters: [
				{
					Name: 4,
					DisplayName: 'Filename',
					Type: 0,
					Prompt: 'Choose a file',
					Presets: [
						{
							Name: 'bird',
							DisplayName: 'bird',
							BooleanValue: null,
							StringValue: 'bird',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'caruso',
							DisplayName: 'caruso',
							BooleanValue: null,
							StringValue: 'caruso',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'cat',
							DisplayName: 'cat',
							BooleanValue: null,
							StringValue: 'cat',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'chicken',
							DisplayName: 'chicken',
							BooleanValue: null,
							StringValue: 'chicken',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'crickets',
							DisplayName: 'crickets',
							BooleanValue: null,
							StringValue: 'crickets',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'dog',
							DisplayName: 'dog',
							BooleanValue: null,
							StringValue: 'dog',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'dolphin',
							DisplayName: 'dolphin',
							BooleanValue: null,
							StringValue: 'dolphin',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'easy',
							DisplayName: 'easy',
							BooleanValue: null,
							StringValue: 'easy',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'frog',
							DisplayName: 'frog',
							BooleanValue: null,
							StringValue: 'frog',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'goat',
							DisplayName: 'goat',
							BooleanValue: null,
							StringValue: 'goat',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'gong',
							DisplayName: 'gong',
							BooleanValue: null,
							StringValue: 'gong',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'peacock',
							DisplayName: 'peacock',
							BooleanValue: null,
							StringValue: 'peacock',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'tiger',
							DisplayName: 'tiger',
							BooleanValue: null,
							StringValue: 'tiger',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						}
					]
				}
			],
			ActionType: 4,
			ActionScope: 0,
			IsQuickAction: true
		},
		{
			CommandName: 12,
			DisplayName: 'Say Message',
			Description: 'Say a message through the sound system',
			Category: 'Sounds',
			Prompt: 'Enter custom message for ROBOTNAME to say',
			Parameters: [
				{
					Name: 0,
					DisplayName: 'Phrase',
					Type: 0,
					Prompt: 'Enter a phrase',
					Presets: [
						{
							Name: 'Hello',
							DisplayName: 'Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.',
							BooleanValue: null,
							StringValue: 'Hello, my name is Ramsee. I am the new face of security. I am pleased to meet you. Welcome to Hexagon Live.',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'Selfie',
							DisplayName: 'I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.',
							BooleanValue: null,
							StringValue: 'I would love to take a selfie with you. It will only cost 5 dollars. Just kidding. Ha. Ha. Ha.  Please feel free to take my picture as many times as you would like.  Please post one on the Hexagon Facebook page.',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'LasVegas',
							DisplayName: 'I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.',
							BooleanValue: null,
							StringValue: 'I have heard what happens in Las Vegas stays in Las Vegas but I am programmed to see and record everything so be good and do not forget to call your mother.',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'SlotMachine',
							DisplayName: 'I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.',
							BooleanValue: null,
							StringValue: 'I am very pleased to meet you. I hope you have a great time in Las Vegas. Just so you know, I am a security robot but I also double as a slot machine.  Please put a twenty in my slot and pull my arm.  Thank you for your contribution.',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'Hide',
							DisplayName: 'I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.',
							BooleanValue: null,
							StringValue: 'I am able to sense heat, cold, humidity, and gas. I am also able to see in total darkness so hiding under your bed will not work. I will find you.',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: 'Headlights',
							DisplayName: 'I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?',
							BooleanValue: null,
							StringValue: 'I use many different sensors to scan my environment and to communicate. I can see in 360 degrees and even in total darkness. I also have flashers and a siren. How do you like my headlights?',
							IntValue: null,
							DoubleValue: null,
							ImageValue: null
						}
					]
				}
			],
			ActionType: 3,
			ActionScope: 0,
			IsQuickAction: true
		},
		{
			CommandName: 15,
			DisplayName: 'Siren On',
			Description: 'Turn siren on',
			Category: 'Sounds',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 14,
			DisplayName: 'Siren Off',
			Description: 'Turn siren off',
			Category: 'Sounds',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 3,
			DisplayName: 'Flashers On',
			Description: 'Turn flashers on',
			Category: 'Lights',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 2,
			DisplayName: 'Flashers Off',
			Description: 'Turn flashers off',
			Category: 'Lights',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 7,
			DisplayName: 'Headlights On',
			Description: 'Turn headlights on',
			Category: 'Lights',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 6,
			DisplayName: 'Headlights Off',
			Description: 'Turn headlights off',
			Category: 'Lights',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 8,
			DisplayName: 'I/R Illuminators Off',
			Description: 'Turn I/R Illuminators Off',
			Category: 'Lights',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 9,
			DisplayName: 'I/R Illuminators On',
			Description: 'Turn I/R Illuminators On',
			Category: 'Lights',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 10,
			DisplayName: 'Robot at Charger',
			Description: 'Sets the robots position to the chargers location',
			Category: 'Charger',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 1,
			IsQuickAction: false
		},
		{
			CommandName: 13,
			DisplayName: 'Set Charger Location',
			Description: 'Set the robots charger location',
			Category: 'Charger',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 1,
			IsQuickAction: false
		},
		{
			CommandName: 19,
			DisplayName: 'Set Volume Level',
			Description: 'Set volume level percentage',
			Category: 'Sounds',
			Prompt: 'Set the volume level for ROBOTNAMEs audio.',
			Parameters: [
				{
					Name: 1,
					DisplayName: 'Percentage',
					Type: 2,
					Prompt: 'Enter volume as percentage',
					Presets: null
				}
			],
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: false
		},
		{
			CommandName: 17,
			DisplayName: 'Mute Volume',
			Description: 'Disable sound system',
			Category: 'Sounds',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: true
		},
		{
			CommandName: 18,
			DisplayName: 'Unmute Volume',
			Description: 'Enable sound system',
			Category: 'Sounds',
			Prompt: null,
			Parameters: null,
			ActionType: 0,
			ActionScope: 0,
			IsQuickAction: true
		},
		{
			CommandName: 26,
			DisplayName: 'Dwell',
			Description: 'Robot will remain in place for a period of time.',
			Category: 'Robot Navigation',
			Prompt: 'Duration in seconds',
			Parameters: [
				{
					Name: 5,
					DisplayName: 'Duration in seconds',
					Type: 0,
					Prompt: 'Duration in seconds',
					Presets: [
						{
							Name: '30Seconds',
							DisplayName: '30 Seconds',
							BooleanValue: null,
							StringValue: '30',
							IntValue: 30,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: '1Minute',
							DisplayName: '1 Minute',
							BooleanValue: null,
							StringValue: '60',
							IntValue: 60,
							DoubleValue: null,
							ImageValue: null
						},
						{
							Name: '3Minutes',
							DisplayName: '3 Minutes',
							BooleanValue: null,
							StringValue: '180',
							IntValue: 180,
							DoubleValue: null,
							ImageValue: null
						}
					]
				}
			],
			ActionType: 2,
			ActionScope: 2,
			IsQuickAction: false
		}
	];

		this.actDefs = [];
		let actDef: ActionDefinitions;
		actDef = { Manufacturer: 'Gamma2', PlatformType: 'Ground', Description: 'Actions for Gamma2 robots', Categories: [] };
		this.actDefs.push(actDef);
		let actCats = actDef.Categories;

		for (let item of inputActDefs) {
			if (item.ActionScope === ActionScope.All || item.ActionScope === ActionScope.PatrolAction) {
				if (item.Category) {
					let actCat: ActionCategory;
					if (!actCatMap.has(item.Category)) {
						actCat = new ActionCategory();
						actCat.DisplayName = item.Category;
						actCat.ActionDefinitions = [];
						actCat.ExpandedState = true;
						actCat.Description = '';
						actCats.push(actCat);
						actCatMap.set(item.Category, actCat);
					}
					else
						actCat = actCatMap.get(item.Category);

					switch (item.ActionType) {
						case ActionType.Command: {
							let cmdType: any = this.getCmdType(item);
							if (cmdType.Type === 'command') {
								let cmdActionDef: ActionDefinition = new ActionDefinition();
								cmdActionDef.ActionScope = item.ActionScope;
								cmdActionDef.ActionType = item.ActionType;
								cmdActionDef.Description = item.Description;
								cmdActionDef.DisplayName = item.DisplayName;
								cmdActionDef.Command.push(item.CommandName);
								cmdActionDef.Prompt = item.Prompt;
								cmdActionDef.Selected = false;
								cmdActionDef.Parameters = [];
								if (item.Parameters) {
									let paramDef: ParameterDefinition = new ParameterDefinition();
									paramDef.DisplayName = item.Parameters[0].DisplayName;
									paramDef.Name = item.Parameters[0].Name;
									paramDef.Prompt = item.Parameters[0].Prompt;
									paramDef.Type = item.Parameters[0].Type;
									paramDef.Presets = [];
									cmdActionDef.Parameters.push(paramDef);
								}

								actCat.ActionDefinitions.push(cmdActionDef);
							} else if (cmdType.Type === 'toggle') {
								let cmdActionDef: ActionDefinition = this.getActDef(actCat, cmdType.DisplayName);
								cmdActionDef.ActionScope = item.ActionScope;
								cmdActionDef.ActionType = ActionType.Toggle;
								cmdActionDef.Description = item.Description;
								cmdActionDef.Prompt = item.Prompt;
								cmdActionDef.Selected = false;
								cmdActionDef.Parameters = [];
								if (cmdType.OnOff === 'on') {
									cmdActionDef.Command[1] = item.CommandName;
								}
								else {
									cmdActionDef.Command[0] = item.CommandName;
								}
							}

							break;
						}
						case ActionType.Orient: {
							let cmdActionDef: ActionDefinition = new ActionDefinition();
							cmdActionDef.ActionScope = item.ActionScope;
							cmdActionDef.ActionType = item.ActionType;
							cmdActionDef.Command.push(item.CommandName);
							cmdActionDef.Description = item.Description;
							cmdActionDef.DisplayName = item.DisplayName;
							cmdActionDef.Prompt = item.Prompt;
							cmdActionDef.Selected = false;
							cmdActionDef.Parameters = [];
							let paramDef: ParameterDefinition = new ParameterDefinition();
							paramDef.DisplayName = item.Parameters[0].DisplayName;
							paramDef.Name = item.Parameters[0].Name;
							paramDef.Prompt = item.Parameters[0].Prompt;
							paramDef.Type = item.Parameters[0].Type;
							paramDef.Presets = [];
							for (let ii = 0; item.Parameters[0].Presets && ii < item.Parameters[0].Presets.length; ii++) {
								let inputPreset: DataValue = item.Parameters[0].Presets[ii];
								let preset: DataValue = this.populatePreset(inputPreset);
								paramDef.Presets.push(preset);
							}
							cmdActionDef.Parameters.push(paramDef);
							actCat.ActionDefinitions.push(cmdActionDef);
							break;
						}
						case ActionType.Play: {
							let cmdActionDef: ActionDefinition = new ActionDefinition();
							cmdActionDef.ActionScope = item.ActionScope;
							cmdActionDef.ActionType = item.ActionType;
							cmdActionDef.Command.push(item.CommandName);
							cmdActionDef.Description = item.Description;
							cmdActionDef.DisplayName = item.DisplayName;
							cmdActionDef.Prompt = item.Prompt;
							cmdActionDef.Selected = false;
							cmdActionDef.Parameters = [];
							let paramDef: ParameterDefinition = new ParameterDefinition();
							paramDef.DisplayName = item.Parameters[0].DisplayName;
							paramDef.Name = item.Parameters[0].Name;
							paramDef.Prompt = item.Parameters[0].Prompt;
							paramDef.Type = item.Parameters[0].Type;
							paramDef.Presets = [];
							for (let ii = 0; item.Parameters[0].Presets && ii < item.Parameters[0].Presets.length; ii++) {
								let inputPreset: DataValue = item.Parameters[0].Presets[ii];
								let preset: DataValue = this.populatePreset(inputPreset);
								paramDef.Presets.push(preset);
							}
							cmdActionDef.Parameters.push(paramDef);
							actCat.ActionDefinitions.push(cmdActionDef);
							break;
						}
						case ActionType.Say: {
							let cmdActionDef: ActionDefinition = new ActionDefinition();
							cmdActionDef.ActionScope = item.ActionScope;
							cmdActionDef.ActionType = item.ActionType;
							cmdActionDef.Command.push(item.CommandName);
							cmdActionDef.Description = item.Description;
							cmdActionDef.DisplayName = item.DisplayName;
							cmdActionDef.Prompt = item.Prompt;
							cmdActionDef.Selected = false;
							cmdActionDef.Parameters = [];
							let paramDef: ParameterDefinition = new ParameterDefinition();
							paramDef.DisplayName = item.Parameters[0].DisplayName;
							paramDef.Name = item.Parameters[0].Name;
							paramDef.Prompt = item.Parameters[0].Prompt;
							paramDef.Type = item.Parameters[0].Type;
							paramDef.Presets = [];
							for (let ii = 0; item.Parameters[0].Presets && ii < item.Parameters[0].Presets.length; ii++) {
								let inputPreset: DataValue = item.Parameters[0].Presets[ii];
								let preset: DataValue = this.populatePreset(inputPreset);
								paramDef.Presets.push(preset);
							}

							cmdActionDef.Parameters.push(paramDef);
							actCat.ActionDefinitions.push(cmdActionDef);
							break;
						}
						case ActionType.Dwell: {
							let cmdActionDef: ActionDefinition = new ActionDefinition();
							cmdActionDef.ActionScope = item.ActionScope;
							cmdActionDef.ActionType = item.ActionType;
							cmdActionDef.Command.push(item.CommandName);
							cmdActionDef.Description = item.Description;
							cmdActionDef.DisplayName = item.DisplayName;
							cmdActionDef.Prompt = item.Prompt;
							cmdActionDef.Selected = false;
							cmdActionDef.Parameters = [];
							let paramDef: ParameterDefinition = new ParameterDefinition();
							paramDef.DisplayName = item.Parameters[0].DisplayName;
							paramDef.Name = item.Parameters[0].Name;
							paramDef.Prompt = item.Parameters[0].Prompt;
							paramDef.Type = item.Parameters[0].Type;
							paramDef.Presets = [];
							for (let ii = 0; item.Parameters[0].Presets && ii < item.Parameters[0].Presets.length; ii++) {
								let inputPreset: DataValue = item.Parameters[0].Presets[ii];
								let preset: DataValue = this.populatePreset(inputPreset);
								paramDef.Presets.push(preset);
							}
							cmdActionDef.Parameters.push(paramDef);
							actCat.ActionDefinitions.push(cmdActionDef);
							break;
						}
						default: {
							console.warn('Unknown action type detected', item.ActionType);
						}
					}
				}
			}
		}
	}
}
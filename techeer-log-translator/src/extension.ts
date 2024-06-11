import * as vscode from 'vscode';

let terminalOutput = {};

export function activate(context: vscode.ExtensionContext) {
	let options = vscode.workspace.getConfiguration('techeerLogTranslator');

	console.log('extension is now active');
	const disposable = vscode.commands.registerCommand('extension.techeer.logTranslator', () => {
		if (options.get("enable") === false) {
			vscode.window.showInformationMessage("Techeer Log Translator가 꺼져있습니다. 설정에서 활성화해주세요.");
			return;
		} else {
			vscode.window.showInformationMessage("Techeer Log Translator가 켜져있습니다.");
		
		}
		const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
		if (terminals.length <= 0) {
		vscode.window.showWarningMessage('No terminals found, cannot run copy');
		return;
		}
		runClipboardMode();
		// runCacheMode();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	terminalOutput = {};
}

function runCacheMode() {
	let terminal = vscode.window.activeTerminal;
	if (terminal === undefined) {
		vscode.window.showWarningMessage('No active terminal found, can not capture');
		return;
	}
	terminal.processId.then(terminalId => {
	  	vscode.commands.executeCommand('workbench.action.files.newUntitledFile').then(() => {
			let editor = vscode.window.activeTextEditor;
			if (editor === undefined) {
			vscode.window.showWarningMessage('Failed to find active editor to paste terminal content');
			return;
			}
			if (terminalId === undefined || terminalId === null) {
			vscode.window.showWarningMessage('Failed to find terminal ID');
			return;
			}
			let cache = cleanupCacheData((<any>terminalOutput)[terminalId]);
			editor.edit(builder => {
				builder.insert(new vscode.Position(0, 0), cache);
			});
	  	});
	});
}
function cleanupCacheData(data: string): string {
	return data.replace(new RegExp('\x1b\[[0-9;]*m', 'g'), '');
}

function runClipboardMode() {
	vscode.commands.executeCommand('workbench.action.terminal.selectAll').then(() => {
	  vscode.commands.executeCommand('workbench.action.terminal.copySelection').then(() => {
		vscode.commands.executeCommand('workbench.action.terminal.clearSelection').then(() => {
		  vscode.commands.executeCommand('workbench.action.files.newUntitledFile').then(() => {
			vscode.commands.executeCommand('editor.action.clipboardPasteAction');
		  });
		});
	  });
	});
  }

// function registerTerminalForCapture(terminal: vscode.Terminal) {
// 	terminal.processId.then(terminalId => {
// 	  (<any>terminalOutput)[terminalId] = "";
// 	  (<any>terminal).onDidWriteData((data: any) => {
// 		// TODO:
// 		//   - Need to remove (or handle) backspace
// 		//   - not sure what to do about carriage return???
// 		//   - might have some odd output
// 		(<any>terminalOutput)[terminalId] += data;
// 	  });
// 	});
//   }

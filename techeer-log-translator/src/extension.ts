import * as vscode from 'vscode';

let terminalOutput = {};

export function activate(context: vscode.ExtensionContext) {
	let options = vscode.workspace.getConfiguration('techeer-log-translator');
	console.log(options);
	console.log('Congratulations, your extension "techeer-log-translator" is now active!');
	const disposable = vscode.commands.registerCommand('extension.techeer.logTranslator', () => {
		vscode.window.showInformationMessage('Hello World from Techeer Log Translator!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

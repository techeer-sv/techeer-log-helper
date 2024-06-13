import * as vscode from 'vscode';
const ncp = require("copy-paste");
// import * as axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
    console.log('extension is now active');

    const disposable = vscode.commands.registerCommand('extension.techeer.logTranslatorAll', () => {
        runTranslation('all');
    });

    const disposable2 = vscode.commands.registerCommand('extension.techeer.logTranslatorPython', () => {
        runTranslation('python');
    });

    const disposable3 = vscode.commands.registerCommand('extension.techeer.logTranslatorNode', () => {
        runTranslation('node');
    });

    context.subscriptions.push(disposable, disposable2, disposable3);
}

export function deactivate() {
    console.log('extension is now deactivated');
}

async function runTranslation(mode: string) {
    const options = vscode.workspace.getConfiguration('techeerLogTranslator');

    if (!options.get("enable")) {
        vscode.window.showInformationMessage("Techeer Log Translator가 꺼져있습니다. 설정에서 활성화해주세요.");
        return;
    }

    vscode.window.showInformationMessage("Techeer Log Translator가 켜져있습니다.");

    const terminals = vscode.window.terminals;
    if (!terminals || terminals.length === 0) {
        vscode.window.showWarningMessage('No terminals found, cannot run copy');
        return;
    }

    try {
        await vscode.commands.executeCommand('workbench.action.terminal.selectAll');
        await vscode.commands.executeCommand('workbench.action.terminal.copySelection');
        await vscode.commands.executeCommand('workbench.action.terminal.clearSelection');

        const content = await new Promise<string>((resolve, reject) => {
            ncp.paste((err: any, content: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });

        let filteredContent = '';
        if (mode === 'python') {
            filteredContent = filterPythonOutputs(content);
        } else if (mode === 'node') {
            filteredContent = filterNodeErrors(content);
        } else {
			filteredContent = content;
		}

        await new Promise<void>((resolve, reject) => {
            ncp.copy(filteredContent, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
        await vscode.commands.executeCommand('editor.action.clipboardPasteAction');

        console.log(`Translation completed for mode: ${mode}`);
    } catch (error) {
        console.error('Error occurred during translation:', error);
        vscode.window.showErrorMessage('Failed to perform translation');
    }
}

function filterNodeErrors(content: string): string {
    let result = '';
    const nodeErrorPattern1 = /(?:\w+Error|Error):.*(?:\n\s*at.*)*(?<![.?!])$/gm;
    const nodeErrorPattern2 = /^(?!(?:\s*at|\t)).*\b(?:js|ts):.*$/gm;
    let match1, match2;

    while ((match1 = nodeErrorPattern1.exec(content)) !== null && (match2 = nodeErrorPattern2.exec(content)) !== null) {
        result += `오류 위치 => ${match2[0]}\n`;
        result += `오류 내용 => ${match1[0]}\n`;
    }

    return result.trim();
}

function filterPythonOutputs(content: string): string {
    let result = '';
    // const pythonErrorPattern = /^(Traceback[\s\S]*?)(?:Error:.*$)/gm;
	const pythonErrorPattern =/^Traceback[\s\S]*?(?:\n.*[.?!])?Error.*[.?!]$/gm;
    let match;

    while ((match = pythonErrorPattern.exec(content)) !== null) {
        result += `오류 시작 \n${match[0]}\n오류 끝\n\n`;
    }

    return result.trim();
}

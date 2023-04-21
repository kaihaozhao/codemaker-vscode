// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CodeMakerService from './service/codemakerservice';
import AuthenticationError from './AuthenticationError';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "CodeMaker" is now active!');

	const token = vscode.workspace.getConfiguration().get('codemaker.token') as string
	const codeMakerService = new CodeMakerService(token);

	context.subscriptions.push(vscode.commands.registerCommand('extension.demo.codemaker.generate.doc', (uri) => {
		vscode.window.showInformationMessage(`Generating doc for ${uri ? uri.path : 'null'}`);
		if (uri) {
			codeMakerService.generateDocumentation(uri.path)
				.then(() => {
					vscode.window.showInformationMessage(`Documentation generated for ${uri ? uri.path : 'null'}`);
				})
				.catch(err => {
					if (err instanceof AuthenticationError) {
						vscode.window.showInformationMessage(`Invalid token`);
					} else {
						vscode.window.showInformationMessage(`Processing failed`);
					}
				});
		}
	}));

	// TODO
	context.subscriptions.push(vscode.commands.registerCommand('extension.demo.codemaker.generate.unittest', (uri) => {
		vscode.window.showInformationMessage(`Generating unit tests for ${uri ? uri.path : 'null'}`);
		if (uri) {
			vscode.window.showInformationMessage(`Unit tests generated for ${uri ? uri.path : 'null'}`);
		}
	}));
	
	// TODO
	context.subscriptions.push(vscode.commands.registerCommand('extension.demo.codemaker.migrate.java17', (uri) => {
		vscode.window.showInformationMessage(`Migrating ${uri ? uri.path : 'null'} to Java 17：`);
		if (uri) {
			vscode.window.showInformationMessage(`Migrate ${uri ? uri.path : 'null'} to Java 17`);
		}
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
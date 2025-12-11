const vscode = require('vscode');
const TodoProvider = require('./TodoProvider');
const { DecorationManager } = require('./DecorationManager');

function activate(context) {
    console.log('TODO Tracker активирован!');

    const todoProvider = new TodoProvider();
    const decorationManager = new DecorationManager();

    const treeView = vscode.window.createTreeView('todoList', {
        treeDataProvider: todoProvider,
        showCollapseAll: true
    });

    const commands = [
        ['todoTracker.refresh', () => { todoProvider.refresh(); decorationManager.updateDecorations(); }],
        ['todoTracker.filterAll', () => todoProvider.setFilter(null)],
        ['todoTracker.filterTodo', () => todoProvider.setFilter('TODO')],
        ['todoTracker.filterFixme', () => todoProvider.setFilter('FIXME')],
        ['todoTracker.filterHack', () => todoProvider.setFilter('HACK')],
        ['todoTracker.goToTodo', (item) => {
            if (!item?.filePath) return;
            vscode.workspace.openTextDocument(item.filePath).then(doc => {
                vscode.window.showTextDocument(doc).then(editor => {
                    const pos = new vscode.Position(item.line, 0);
                    editor.selection = new vscode.Selection(pos, pos);
                    editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
                });
            });
        }]
    ];

    commands.forEach(([cmd, handler]) => {
        context.subscriptions.push(vscode.commands.registerCommand(cmd, handler));
    });

    vscode.window.onDidChangeActiveTextEditor(e => e && decorationManager.updateDecorations(e), null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(e => {
        const editor = vscode.window.activeTextEditor;
        if (editor?.document === e.document) decorationManager.updateDecorations(editor);
    }, null, context.subscriptions);
    vscode.workspace.onDidSaveTextDocument(() => todoProvider.refresh(), null, context.subscriptions);
    vscode.workspace.onDidOpenTextDocument(() => {
        setTimeout(() => vscode.window.activeTextEditor && decorationManager.updateDecorations(vscode.window.activeTextEditor), 50);
    }, null, context.subscriptions);

    setTimeout(() => {
        vscode.window.visibleTextEditors.forEach(e => decorationManager.updateDecorations(e));
        todoProvider.refresh();
    }, 100);

    context.subscriptions.push(treeView, decorationManager);
}

function deactivate() {
    console.log('TODO Tracker деактивирован');
}

module.exports = { activate, deactivate };

const vscode = require('vscode');
const path = require('path');

class TodoItem extends vscode.TreeItem {
    constructor(label, collapsibleState, type, options = {}) {
        super(label, collapsibleState);
        this.type = type;
        this.filePath = options.filePath;
        this.line = options.line;
        this.keyword = options.keyword;
        this.children = options.children || [];

        if (type === 'file') {
            this.iconPath = vscode.ThemeIcon.File;
            this.description = `(${this.children.length})`;
        } else {
            const icons = {
                'TODO': new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.orange')),
                'FIXME': new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red')),
                'HACK': new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.purple'))
            };
            this.iconPath = icons[this.keyword] || icons['TODO'];
            this.description = `Строка ${this.line + 1}`;
            this.command = { command: 'todoTracker.goToTodo', title: 'Перейти', arguments: [this] };
        }
    }
}

class TodoProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.todos = [];
        this.filter = null;
    }

    refresh() {
        this.scanWorkspace().then(() => this._onDidChangeTreeData.fire());
    }

    setFilter(keyword) {
        this.filter = keyword;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) { return element; }

    getChildren(element) {
        if (!element) return this.getFileItems();
        return element.type === 'file' ? element.children : [];
    }

    getFileItems() {
        const fileMap = new Map();

        this.todos.filter(t => !this.filter || t.keyword === this.filter).forEach(todo => {
            if (!fileMap.has(todo.filePath)) fileMap.set(todo.filePath, []);
            fileMap.get(todo.filePath).push(todo);
        });

        return [...fileMap.entries()].map(([filePath, todos]) => {
            const todoItems = todos.map(t => new TodoItem(t.text, vscode.TreeItemCollapsibleState.None, 'todo', t));
            const fileItem = new TodoItem(path.basename(filePath), vscode.TreeItemCollapsibleState.Expanded, 'file', { filePath, children: todoItems });
            fileItem.tooltip = vscode.workspace.asRelativePath(filePath);
            return fileItem;
        });
    }

    async scanWorkspace() {
        this.todos = [];
        const config = vscode.workspace.getConfiguration('todoTracker');
        const include = config.get('includePatterns', ['**/*.js', '**/*.ts', '**/*.py']);
        const exclude = config.get('excludePatterns', ['**/node_modules/**']);
        const keywords = Object.keys(config.get('keywords', { TODO: '', FIXME: '', HACK: '' }));
        const pattern = new RegExp(`\\b(${keywords.join('|')})\\b:?\\s*(.*)`, 'gi');

        try {
            const files = await vscode.workspace.findFiles(`{${include.join(',')}}`, `{${exclude.join(',')}}`, 1000);
            
            for (const file of files) {
                try {
                    const doc = await vscode.workspace.openTextDocument(file);
                    doc.getText().split('\n').forEach((line, i) => {
                        pattern.lastIndex = 0;
                        let match;
                        while ((match = pattern.exec(line)) !== null) {
                            this.todos.push({
                                filePath: file.fsPath,
                                line: i,
                                keyword: match[1].toUpperCase(),
                                text: `${match[1].toUpperCase()}: ${match[2].trim() || '(без описания)'}`
                            });
                        }
                    });
                } catch {}
            }
        } catch {}
    }
}

module.exports = TodoProvider;

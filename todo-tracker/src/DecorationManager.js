const vscode = require('vscode');

class DecorationManager {
    constructor() {
        this.decorationTypes = {};
        const keywords = vscode.workspace.getConfiguration('todoTracker').get('keywords', {
            'TODO': '#FF8C00', 'FIXME': '#FF0000', 'HACK': '#9400D3'
        });

        Object.entries(keywords).forEach(([keyword, color]) => {
            this.decorationTypes[keyword] = vscode.window.createTextEditorDecorationType({
                backgroundColor: `${color}40`,
                border: `2px solid ${color}`,
                borderRadius: '4px',
                color: color,
                fontWeight: 'bold',
                overviewRulerColor: color,
                overviewRulerLane: vscode.OverviewRulerLane.Full,
                textDecoration: `underline wavy ${color}`
            });
        });
    }

    updateDecorations(editor) {
        editor = editor || vscode.window.activeTextEditor;
        if (!editor) return;

        const keywords = vscode.workspace.getConfiguration('todoTracker').get('keywords', {
            'TODO': '#FF8C00', 'FIXME': '#FF0000', 'HACK': '#9400D3'
        });
        const keywordList = Object.keys(keywords);
        const decorations = Object.fromEntries(keywordList.map(k => [k, []]));
        const pattern = new RegExp(`\\b(${keywordList.join('|')})\\b:?`, 'gi');
        const text = editor.document.getText();

        let match;
        while ((match = pattern.exec(text)) !== null) {
            const keyword = match[1].toUpperCase();
            const start = editor.document.positionAt(match.index);
            const end = editor.document.positionAt(match.index + match[0].length);
            const afterText = editor.document.lineAt(start.line).text.substring(end.character).trim();
            
            decorations[keyword].push({
                range: new vscode.Range(start, end),
                hoverMessage: new vscode.MarkdownString(`**${keyword}**\n\n${afterText || '(без описания)'}`)
            });
        }

        Object.entries(decorations).forEach(([keyword, ranges]) => {
            this.decorationTypes[keyword] && editor.setDecorations(this.decorationTypes[keyword], ranges);
        });
    }

    dispose() {
        Object.values(this.decorationTypes).forEach(d => d.dispose());
    }
}

module.exports = { DecorationManager };

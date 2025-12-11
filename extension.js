const vscode = require('vscode');

let outputChannel = null;
let animationInterval = null;
let isRunning = false;

const ROCKET = `
       /\\
      /  \\
     |    |
     |    |
     | 🐳 |
     |    |
    /|    |\\
   / |    | \\
  /  |    |  \\
 '---|    |---'
     |    |
    /      \\
   /   /\\   \\
  '---'  '---'
`;

const FLAME_1 = `
       ||
      /||\\
     / || \\
       **
`;

const FLAME_2 = `
       ||
      /||\\
     //||\\\\
    // || \\\\
      ****
       **
`;

const FLAME_3 = `
       ||
     //||\\\\
    ///||\\\\\\
   /// || \\\\\\
     ******
      ****
       **
`;

function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Docker Build');
    
    const showCmd = vscode.commands.registerCommand('dinodocker.showDino', () => {
        startAnimation();
    });

    const hideCmd = vscode.commands.registerCommand('dinodocker.hideDino', () => {
        stopAnimation();
    });

    const terminalListener = vscode.window.onDidWriteTerminalData(e => {
        const data = e.data.toLowerCase();
        if (isDockerComposeCommand(data) && !isRunning) {
            startAnimation();
        }
        if (isRunning && (data.includes('successfully') || data.includes('done'))) {
            setTimeout(() => completeAnimation(), 500);
        }
    });

    const taskStart = vscode.tasks.onDidStartTask(e => {
        const name = (e.execution.task.name + ' ' + (e.execution.task.definition.command || '')).toLowerCase();
        if (isDockerComposeCommand(name)) startAnimation();
    });

    const taskEnd = vscode.tasks.onDidEndTask(e => {
        const name = (e.execution.task.name + ' ' + (e.execution.task.definition.command || '')).toLowerCase();
        if (isDockerComposeCommand(name)) completeAnimation();
    });

    context.subscriptions.push(outputChannel, showCmd, hideCmd, terminalListener, taskStart, taskEnd);
}

function isDockerComposeCommand(text) {
    return (text.includes('docker-compose') || text.includes('docker compose')) &&
           (text.includes('build') || text.includes('up'));
}

function startAnimation() {
    if (isRunning) return;
    isRunning = true;
    
    outputChannel.show(true);
    outputChannel.clear();
    
    let frame = 0;
    let progress = 0;
    
    animationInterval = setInterval(() => {
        outputChannel.clear();
        
        if (progress < 95) {
            progress += Math.random() * 3 + 1;
            if (progress > 95) progress = 95;
        }
        
        const height = Math.floor((100 - progress) / 5);
        const flames = [FLAME_1, FLAME_2, FLAME_3];
        const flame = flames[frame % 3];
        
        for (let i = 0; i < height; i++) {
            outputChannel.appendLine('');
        }
        
        outputChannel.appendLine(ROCKET);
        outputChannel.appendLine(flame);
        
        const groundLevel = 20 - height;
        for (let i = 0; i < groundLevel; i++) {
            if (i === groundLevel - 1) {
                outputChannel.appendLine('='.repeat(40));
            } else {
                outputChannel.appendLine('');
            }
        }
        
        const pct = Math.round(progress);
        const filled = Math.floor(pct / 2.5);
        const bar = '#'.repeat(filled) + '-'.repeat(40 - filled);
        outputChannel.appendLine(`[${bar}] ${pct}%`);
        
        frame++;
    }, 300);
}

function completeAnimation() {
    stopAnimation();
    
    outputChannel.clear();
    outputChannel.appendLine(ROCKET);
    outputChannel.appendLine(FLAME_3);
    outputChannel.appendLine('');
    outputChannel.appendLine('');
    outputChannel.appendLine('='.repeat(40));
    outputChannel.appendLine('[########################################] 100%');
}

function stopAnimation() {
    isRunning = false;
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}

function deactivate() {
    stopAnimation();
    if (outputChannel) outputChannel.dispose();
}

module.exports = { activate, deactivate };

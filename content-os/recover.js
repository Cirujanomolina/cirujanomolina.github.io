const fs = require('fs');
const logPath = 'C:/Users/Juan/.gemini/antigravity/brain/72ecaaeb-dcba-4362-934c-f7c585863b70/.system_generated/logs/transcript.jsonl';
const logs = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean).map(JSON.parse);

let content = '';
logs.forEach(log => {
    if (log.type === 'ACTION_RESULT' && log.content && log.content.includes('constructor_reels_v2.html')) {
        content += log.content + '\n';
    }
});
fs.writeFileSync('reels_logs.txt', content);

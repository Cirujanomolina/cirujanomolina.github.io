const fs = require('fs');

function extract() {
    const logPath = 'C:/Users/Juan/.gemini/antigravity/brain/f35e7117-c01c-4d4a-a3a9-348e7381736e/.system_generated/logs/transcript.jsonl';
    const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
    
    let allContent = '';
    for (const line of lines) {
        try {
            const log = JSON.parse(line);
            if (log.type === 'ACTION_RESULT' && typeof log.content === 'string') {
                if (log.content.includes('constructor_reels')) {
                    allContent += log.content + '\n---\n';
                }
            }
        } catch(e) {}
    }
    fs.writeFileSync('extracted_reels.txt', allContent);
}
extract();

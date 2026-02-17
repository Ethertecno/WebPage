function parseBriefDescription(rawText = "") {
    const lines = rawText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    const result = [];
    let currentParagraph = "";

    for (const line of lines) {
        // Start a new paragraph if line looks like key:value, tab, or uppercase heading
        const isNewParagraph = line.includes(':') || line.includes('\t') || (/^[A-ZÁÉÍÓÚÑ]/.test(line) && line === line.split(' ')[0]);

        if (isNewParagraph) {
            if (currentParagraph) {
                result.push({ type: "paragraph", text: currentParagraph.trim() });
            }
            currentParagraph = line;
        } else {
            currentParagraph += " " + line;
        }
    }

    // Push the last paragraph if exists
    if (currentParagraph) {
        result.push({ type: "paragraph", text: currentParagraph.trim() });
    }

    return result;
}


function parseSpecifications(rawText = "") {
    const lines = rawText
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

        console.log(lines)
    const result = [];
    let currentSection = null;

    for (const line of lines) {
       // Section header (no tab AND no colon)
        if (!line.includes('\t') && !line.includes(':')) {
            currentSection = {
                section: line,
                items: []
            };
            result.push(currentSection);
        
        } else {
            // Key-value row
            let key, value;

            if (line.includes('\t')) {
                [key, value] = line.split('\t');
            } else {
                [key, value] = line.split(':');
            }

            if (currentSection && key && value) {
                currentSection.items.push({
                    key: key.trim(),
                    value: value.trim()
                });
            }
        }
    }

    return result;
}


module.exports = {
    parseBriefDescription,
    parseSpecifications
};
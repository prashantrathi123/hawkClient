import { getAutocompleteSuggestions } from 'graphql-language-service';

/**
 * Truncate the right side of a query string based on the character index.
 * @param {string} query - The original query string.
 * @param {number} characterIndex - The character index where the cursor is located.
 * @returns {string} The truncated query string.
 */
function truncateQueryAtIndex(query, characterIndex) {
    if (typeof query !== 'string') {
        return query
    }

    if (typeof characterIndex !== 'number' || characterIndex < 0 || characterIndex > query.length) {
        return query
    }

    // Extract substring from the start of the query to the given index
    return query.substring(0, characterIndex);
}

/**
 * Generate custom completions for Ace Editor using GraphiQL Toolkit.
 * @param {Object} schema - The GraphQL schema.
 * @param {string} query - The current query in the editor.
 * @param {Object} pos - Cursor position in the editor { row: number, column: number }.
 * @returns {Array} Array of custom completion objects.
 */
const generateCustomCompletions = (schema, query, pos, oldQuery) => {
    try {
        if (typeof query !== 'string') {
            throw new Error(`Invalid query type: ${typeof query}. Expected a string.`);
        }

        // Calculate character index from row and column
        const lines = query.split('\n');
        let characterIndex = 0;

        for (let i = 0; i < pos.row; i++) {
            characterIndex += lines[i].length + 1; // Include newline characters
        }
        characterIndex += pos.column;
        if (oldQuery.length < query.length) {
            // characterIndex = characterIndex + 1
        }

        // Validate schema
        if (!schema) {
            throw new Error('Schema is required but not provided.');
        }

        let turncatedQuery = truncateQueryAtIndex(query, characterIndex)

        // Get suggestions using GraphQL Language Service
        let suggestions = getAutocompleteSuggestions(schema, turncatedQuery, characterIndex);

        // Map suggestions to Ace Editor format
        const customCompletions = suggestions.map((suggestion) => ({
            caption: suggestion.label,
            value: suggestion.insertText || suggestion.label,
            meta: suggestion.detail || "",
            score: 1000, // Priority score
        }));
        return customCompletions;
    } catch (error) {
        return [];
    }
};

export default generateCustomCompletions;

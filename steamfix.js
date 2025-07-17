// Fixed getSteamGames function for steam-game-path@2.3.0

// Try to import steam-game-path, handle if not available
let steamGamePath = null;
try {
    steamGamePath = require('steam-game-path');
    console.log('steam-game-path loaded successfully');
} catch (err) {
    console.warn('steam-game-path not available:', err.message);
}

async function getSteamGames() {
    if (!steamGamePath) {
        console.warn('Steam game path module not available');
        return [];
    }
    
    try {
        let games = [];
        
        // Method 1: Direct call (most common for v2.3.0)
        if (typeof steamGamePath === 'function') {
            // If the module itself is a function
            games = await steamGamePath();
        }
        // Method 2: Check for getGames method
        else if (typeof steamGamePath.getGames === 'function') {
            games = await steamGamePath.getGames();
        }
        // Method 3: Check for default export
        else if (steamGamePath.default && typeof steamGamePath.default === 'function') {
            games = await steamGamePath.default();
        }
        // Method 4: Check for other common method names
        else if (typeof steamGamePath.getAllGames === 'function') {
            games = await steamGamePath.getAllGames();
        }
        else if (typeof steamGamePath.games === 'function') {
            games = await steamGamePath.games();
        }
        else {
            console.warn('No recognized method found in steam-game-path module');
            console.log('Available methods:', Object.keys(steamGamePath));
            return [];
        }
        
        // Validate and format the results
        if (!Array.isArray(games)) {
            console.warn('Steam games result is not an array:', typeof games);
            return [];
        }
        
        console.log(`Found ${games.length} Steam games`);
        
        return games.map(game => {
            // Handle different possible property names
            const name = game.name || game.displayName || game.title || game.appName || 'Unknown Game';
            const appId = game.appid || game.id || game.steamId || game.appId;
            
            return {
                name: name,
                path: `steam://run/${appId}`,
                source: 'Steam'
            };
        });
        
    } catch (err) {
        console.error('Error getting Steam games:', err);
        return [];
    }
}

// Test the function
getSteamGames().then(games => {
    console.log('Steam games found:', games.length);
    if (games.length > 0) {
        console.log('First game example:', games[0]);
    }
}).catch(err => {
    console.error('Test failed:', err);
});
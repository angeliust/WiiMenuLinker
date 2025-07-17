// Debug script to check steam-game-path API
const steamGamePath = require('steam-game-path');

console.log('=== STEAM-GAME-PATH DEBUG ===');
console.log('Type:', typeof steamGamePath);
console.log('Is function:', typeof steamGamePath === 'function');
console.log('Keys:', Object.keys(steamGamePath || {}));
console.log('Methods:', Object.getOwnPropertyNames(steamGamePath || {}));

// Check if it's a constructor
if (typeof steamGamePath === 'function') {
    console.log('\n=== CONSTRUCTOR TEST ===');
    try {
        const instance = new steamGamePath();
        console.log('Instance created successfully');
        console.log('Instance methods:', Object.getOwnPropertyNames(instance));
        console.log('Instance prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
    } catch (e) {
        console.log('Constructor failed:', e.message);
    }
}

// Check for common method names
const commonMethods = ['getGames', 'getAllGames', 'games', 'getInstalledGames', 'findGames'];
commonMethods.forEach(method => {
    if (steamGamePath && typeof steamGamePath[method] === 'function') {
        console.log(`✓ Found method: ${method}`);
    }
});

// Try to call any available method
if (steamGamePath) {
    console.log('\n=== TESTING METHODS ===');
    
    // Test direct methods
    if (typeof steamGamePath.getGames === 'function') {
        console.log('Testing getGames...');
        steamGamePath.getGames()
            .then(games => console.log('getGames result:', games?.length || 0, 'games'))
            .catch(err => console.log('getGames error:', err.message));
    }
    
    // Test if it's a default export
    if (steamGamePath.default && typeof steamGamePath.default.getGames === 'function') {
        console.log('Testing default.getGames...');
        steamGamePath.default.getGames()
            .then(games => console.log('default.getGames result:', games?.length || 0, 'games'))
            .catch(err => console.log('default.getGames error:', err.message));
    }
}
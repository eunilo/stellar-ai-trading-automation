// Script to fix TypeScript errors
const fs = require('fs');
const path = require('path');

// Fix process.env access patterns
function fixProcessEnvAccess(content) {
  return content.replace(/process\.env\.([A-Z_]+)/g, "process.env['$1']");
}

// Fix logger import
function fixLoggerImport(content) {
  return content.replace(
    /import { logger } from ['"]\.\.\/utils\/logger['"];?/g,
    "import { logger } from '../utils/logger';"
  );
}

// Fix unused parameters
function fixUnusedParameters(content) {
  return content.replace(/\(req: Request, res: Response\)/g, '(_req: Request, res: Response)');
}

// Fix return type issues
function fixReturnTypes(content) {
  return content.replace(/async \(req: Request, res: Response\) => \{/g, 'async (req: Request, res: Response): Promise<void> => {');
}

// Files to fix
const files = [
  'src/config/index.ts',
  'src/api/routes/ai.ts',
  'src/api/routes/soroswap.ts',
  'src/api/routes/strategies.ts',
  'src/api/routes/marketData.ts',
  'src/index.ts',
  'src/services/AIService.ts',
  'src/services/MarketDataService.ts',
  'src/services/SoroswapService.ts',
  'src/services/StellarService.ts',
  'src/services/StrategyManager.ts',
  'src/utils/logger.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply fixes
    content = fixProcessEnvAccess(content);
    content = fixLoggerImport(content);
    content = fixUnusedParameters(content);
    content = fixReturnTypes(content);
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});

console.log('TypeScript errors fixed!');

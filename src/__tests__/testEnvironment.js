const JSDOMEnvironment = require('jest-environment-jsdom').default;

class CustomTestEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
    
    // Get the test file name from the test path
    const testName = context.testPath.split('/').pop();
    
    // Set the test name as an environment variable
    this.global.process.env.JEST_TEST_NAME = testName;
    
    // Also set it on import.meta.env for Vite compatibility
    if (!this.global.import) {
      Object.defineProperty(this.global, 'import', {
        value: {},
        writable: true,
        configurable: true
      });
    }
    
    if (!this.global.import.meta) {
      Object.defineProperty(this.global.import, 'meta', {
        value: {},
        writable: true,
        configurable: true
      });
    }
    
    if (!this.global.import.meta.env) {
      this.global.import.meta.env = {};
    }
    
    this.global.import.meta.env.JEST_TEST_NAME = testName;
  }
}

module.exports = CustomTestEnvironment;
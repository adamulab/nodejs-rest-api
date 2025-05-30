/*
 *Create and export configuration variables.
 */

// Container for all the environment
const environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "staging",
  hashingSecret: "IamWildandCool",
};

// Production environment
environments.production = {
  httpPort: 8880,
  httpsPort: 8881,
  envName: "production",
  hashingSecret: "IamWildandCoolAgain",
};

// Determine which was passed as a command-line argument

const currentEnvironment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLocaleLowerCase()
    : "";

// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.staging;

// Export the modules
module.exports = environmentToExport;

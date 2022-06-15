import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as documentdb from "@pulumi/azure-native/documentdb";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as insights from "@pulumi/azure-native/insights";

// General Configuration
const config = new pulumi.Config();
const configRG = config.require("resourceGroupName");
const configLocation = config.require("location");  // EastUS, WestUS etc.
// Database Configuration
const configDBAccountName = config.require("cosmosAccountName");
const configDBName = config.require("cosmosDBName");
// Storage Configuration
const configStorageName = config.require("storageName");
const configStorageKind = config.require("storageKind");
const configStorageSKU = config.require("storageSKU");
// WebApp Service Configuration
const configAppServiceName = config.require("appServiceName");
const configAppServiceKind = config.require("appServiceKind");
const configAppServiceSKUName = config.require("appServiceSKUName");
const configAppServiceSKUTier = config.require("appServiceSKUTier");
// WebApp App Insights Configuration
const configAppInsightsName = config.require("appInsightsName");
const configAppInsightsKind = config.require("appInsightsKind");
const configAppInsightsType = config.require("appInsightsType");
// WebApp Configuration
const configAppName = config.require("webAppName");
// Static Site Configuration
const configFrontEndName = config.require("frontEndName");

// Create an Azure Resource Group
export var resourceGroup = new resources.ResourceGroup(configRG, { location: configLocation, resourceGroupName: configRG, tags: { "Project" : "PulmiExample" } });

// Cosmos DB Account
export var cosmosdbAccount = new documentdb.DatabaseAccount(configDBAccountName, {
    resourceGroupName: resourceGroup.name,
    tags: { "Project" : "PulmiExample" },
    databaseAccountOfferType: documentdb.DatabaseAccountOfferType.Standard,
    locations: [{
        locationName: configLocation,
        failoverPriority: 0,
    }],
    consistencyPolicy: {
        defaultConsistencyLevel: documentdb.DefaultConsistencyLevel.Session,
    },
});

// Cosmos DB Database
export var cosmosdbDatabase = new documentdb.SqlResourceSqlDatabase(configDBName, {
    resourceGroupName: resourceGroup.name,
    accountName: cosmosdbAccount.name,
    tags: { "Project" : "PulmiExample" },
    resource: {
        id: configDBName,
    },
});

// Storage Account
export var storageAccount = new storage.StorageAccount(configStorageName, {
    resourceGroupName: resourceGroup.name,
    kind: configStorageKind,
    tags: { "Project" : "PulmiExample" },
    sku: {
        name: configStorageSKU,
    },
    location: "WestUS"
});

// WebApp Service Plan
export var appServicePlan = new web.AppServicePlan(configAppServiceName, {
    resourceGroupName: resourceGroup.name,
    kind: configAppServiceKind,
    tags: { "Project" : "PulmiExample" },
    sku: {
        name: configAppServiceSKUName,
        tier: configAppServiceSKUTier,
    },
});

// App Insights for the Web App
export var appInsights = new insights.Component(configAppInsightsName, {
    resourceGroupName: resourceGroup.name,
    kind: configAppInsightsKind,
    applicationType: configAppInsightsType,
    tags: { "Project" : "PulmiExample" },
});

var comosdbDonnectionString = cosmosdbAccount.documentEndpoint;

// Web App
export var webApp = new web.WebApp(configAppName, {
    resourceGroupName: resourceGroup.name,
    serverFarmId: appServicePlan.id,
    tags: { "Project" : "PulmiExample" },
    siteConfig: {
        appSettings: [
            {
                name: "APPINSIGHTS_INSTRUMENTATIONKEY",
                value: appInsights.instrumentationKey,
            },
            {
                name: "APPLICATIONINSIGHTS_CONNECTION_STRING",
                value: pulumi.interpolate`InstrumentationKey=${appInsights.instrumentationKey}`,
            },
            {
                name: "ApplicationInsightsAgent_EXTENSION_VERSION",
                value: "~2",
            }
        ],
        connectionStrings: [{
            name: "db",
            connectionString: comosdbDonnectionString,
            type: web.ConnectionStringType.DocDb
        }],
    },
});

// Enable static website support
export var staticWebsite = new storage.StorageAccountStaticWebsite(configFrontEndName, {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    indexDocument: "index.html",
    error404Document: "404.html",
});

// Upload Web Files
["index.html", "404.html"].map(name =>
    new storage.Blob(name, {
        resourceGroupName: resourceGroup.name,
        accountName: storageAccount.name,
        containerName: staticWebsite.containerName,
        source: new pulumi.asset.FileAsset(`./websrc/${name}`),
        contentType: "text/html",
    }),
);

// Web endpoint to the website
export const staticEndpoint = storageAccount.primaryEndpoints.web;
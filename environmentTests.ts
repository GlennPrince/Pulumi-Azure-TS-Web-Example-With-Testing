import * as pulumi from "@pulumi/pulumi";
import "mocha";

pulumi.runtime.setMocks({
    newResource: function(args: pulumi.runtime.MockResourceArgs): {id: string, state: any} {
        return {
            id: args.inputs.name + "_id",
            state: args.inputs,
        };
    },
    call: function(args: pulumi.runtime.MockCallArgs) {
        return args.inputs;
    }, 
});

describe("Environment", function() {
    let environment: typeof import("./index");

    before(async function() {
        this.timeout(6000);
        environment = await import("./index");
    });

    describe("Resource Group", function() {
        it("must have a name set", function(done) {
            pulumi.all([environment.resourceGroup.name]).apply(func => {
                if(environment.resourceGroup.name == null){
                    done(new Error('Resource Group does not have a Name set'));
                } else {
                    done();
                }
            })
        })
    });

    describe("All Resources", function() {
        it("Resource Group must be tagged", function(done) {
            pulumi.all([environment.resourceGroup.tags]).apply(([tags]) => {
                if(!tags){ done(new Error('Resource Group does not have a Tag')); } else { done(); }
            });
        })
        it("CosmosDB Account must be tagged", function(done) {
            pulumi.all([environment.cosmosdbAccount.tags]).apply(([tags]) => {
                if(!tags){ done(new Error('CosmosDB Account does not have a Tag')); } else { done(); }
            });
        })
        it("CosmosDB Database must be tagged", function(done) {
            pulumi.all([environment.cosmosdbDatabase.tags]).apply(([tags]) => {
                if(!tags){ done(new Error('Cosmos Database does not have a Tag')); } else { done(); }
            });
        })
        
        it("Storage Account must be tagged", function(done) {
            pulumi.all([environment.storageAccount.tags]).apply(([tags]) => {
                if(!tags){ done(new Error('Storage Account does not have a Tag')); } else { done(); }
            });
        })
        it("App Insights must be tagged", function(done) {
            pulumi.all([environment.appInsights.tags]).apply(([tags]) => {
                if(!tags){ done(new Error('App Insights does not have a Tag')); } else { done(); }
            });
        })
        it("Service Plan must be tagged", function(done) {
            pulumi.all([environment.appServicePlan.tags]).apply(([tags]) => {
                if(!tags){ done(new Error('App Service Plan does not have a Tag')); } else { done(); }
            });
        })
        it("Web App must be tagged", function(done) {
            pulumi.all([environment.webApp.tags]).apply(([tags]) => {
                if(!tags){ done(new Error('Web App does not have a Tag')); } else { done(); }
            });
        })
    });
});
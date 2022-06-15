import * as azure from "@pulumi/azure-native";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";

new PolicyPack("azure-typescript", {
    policies: [{
        name: "storage-container-location",
        description: "Prohibits Azure Storage Containers being located anywhere else but WestUS.",
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(azure.storage.StorageAccount, (storage, args, reportViolation) => {
            if (storage.location != "WestUS") {
                reportViolation("Azure Storage Accounts must be in WestUS");
            }
        }),
    }],
});